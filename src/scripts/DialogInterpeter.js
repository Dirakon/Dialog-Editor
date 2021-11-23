import { getQuoteWithoutQuotationMarks, readFromPointToDot, removeElementFromArray, replaceAllInString } from "./DialogUtils";
import { SYMBOL_NOT_FOUND_FLAG, getLineWithoutComments } from "./DialogUtils";
import { stringToVariable } from "./DialogVariable";
import IndentationMaster from "./IndentationMaster";

export const PROGRAM_HALTED = -1, UP_X_LEVELS = -2, SEEK_FOR_NEXT_ELSE = -3, GO_TO_NEXT_LINE = -4, GO_TO_X_LINE = -5;
export function getNextLineFromProgramStatus(programStatus, programStatusDescriptor, currentLine) {
    switch (programStatus) {
        case GO_TO_NEXT_LINE:
            return currentLine + 1
        case GO_TO_X_LINE:
            return programStatusDescriptor
        default:
            throw ("getNextLineFromProgramStatus got program status that does not support getting the next line: " + programStatus.toString())
    }
}

const operationNameToOperationFunction = {
    'exit': exitOperation,
    'save': saveOperation,
    'load': loadOperation,
    'addTag': addTagOperation,
    'var': variableOperation,
    'else': elseOperation,
    'hasTag': hasTagOperation,
    'up': upOperation,
    'deleteTag': deleteTagOperation
}

const linesToSeekForElseFor = 2
export function locateLineWithNextElse(lines, context) {
    let indentationMaster = new IndentationMaster(context)
    let linesToSeekForElseForLeft = linesToSeekForElseFor
    let saveContext = context.getClone()
    while (context.currentLine < lines.length) {
        let line = indentationMaster.analyzeLineAndRemoveIndentationCharacters(getLineWithoutComments(lines[context.currentLine]))
        if (indentationMaster.canWeWorkInCurrentLine()) {
            if (line.startsWith(':else')) {
                context.nextElseIsToExecute = true
                return context.currentLine
            } else if (linesToSeekForElseForLeft-- == 0) {
                break;
            }
        }
        context.currentLine++;
    }
    context.setToClone(saveContext)
    return SYMBOL_NOT_FOUND_FLAG
}

export function locateLineXLevelsUp(lines, howManyLevelsUp, context) {
    context.indentationLevel = -howManyLevelsUp
    let indentationMaster = new IndentationMaster(context)
    while (context.currentLine > 0 && context.indentationLevel != 1) {
        context.currentLine--;
        indentationMaster.analyzeLineAndRemoveIndentationCharacters(getLineWithoutComments(lines[context.currentLine]))
    }
    context.maxIndentationLevel = 1
    if (context.currentLine < 0)
        return SYMBOL_NOT_FOUND_FLAG
    else
        return context.currentLine + 1
}

const regexToSplitDotsOutsideOfQuotationMarks = /\.(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/
export function interpretOneLine(line, context, programStatus) {
    let programStatusDescriptor = 0
    let indentationMaster = new IndentationMaster(context)
    let newOptions = [], newText = undefined

    line = indentationMaster.analyzeLineAndRemoveIndentationCharacters(getLineWithoutComments(line))
    if (indentationMaster.canWeWorkInCurrentLine()) {
        if (line.startsWith('\\')) { //option
            let optionEnd = line.indexOf('/')
            let newOption = line.substring(1, optionEnd);
            newOptions.push([newOption, context.currentLine + 1])
            programStatus = GO_TO_NEXT_LINE
        } else if (line.startsWith(':"')) { // text
            newText = replaceAllInString(line, '"', '').substring(1);
            programStatus = GO_TO_NEXT_LINE
        } else if (line.startsWith(':')) { //operation
            let operationCall = line.substring(1, line.indexOf('.') == SYMBOL_NOT_FOUND_FLAG ? line.length : line.indexOf('.'))
            let args = line.substr(operationCall.length + 2)
                .split(regexToSplitDotsOutsideOfQuotationMarks);
            ({ programStatus, programStatusDescriptor } = operationNameToOperationFunction[operationCall](args, context))
        } else {
            programStatus = GO_TO_NEXT_LINE
        }
    }
    return { newOptions: newOptions, newText: newText, programStatus: programStatus, programStatusDescriptor: programStatusDescriptor }
}

function variableOperation(args, context) {
    let var1 = stringToVariable(args[0], context.vars), sign = args[1], var2 = stringToVariable(args[2], context.vars)
    if (sign === '=') {
        var1.assignValue(var2.getValue())
    } else if (sign === '+=') {
        var1.assignValue(var1.getValue() + var2.getValue())
    } else if (sign === '-=') {
        var1.assignValue(var1.getValue() - var2.getValue())
    } else {
        let pass = applyLogicalOperationToVariables(var1, sign, var2);
        if (pass) {
            context.maxIndentationLevel++
        } else {
            return { programStatus: SEEK_FOR_NEXT_ELSE, programStatusDescriptor: undefined }
        }
    }
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function applyLogicalOperationToVariables(var1, sign, var2) {
    switch (sign) {
        case '==':
            return var1.getValue() == var2.getValue();
        case ">=":
            return var1.getValue() >= var2.getValue();
        case "!=":
            return var1.getValue() != var2.getValue();
        case "<=":
            return var1.getValue() <= var2.getValue();
        case "<":
            return var1.getValue() < var2.getValue();
        case ">":
            return var1.getValue() > var2.getValue();
        default:
            throw ('unidentified sign: ' + sign);
    }
}

function addTagOperation(args, context) {
    context.tags.push(args[0])
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function deleteTagOperation(args, context) {
    removeElementFromArray(args[0], context.tags)
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function hasTagOperation(args, context) {
    if (context.tags.includes(args[0])) {
        context.maxIndentationLevel += 1
        return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
    } else {
        return { programStatus: SEEK_FOR_NEXT_ELSE, programStatusDescriptor: undefined }
    }
}
function elseOperation(args, context) {
    if (context.nextElseIsToExecute) {
        context.nextElseIsToExecute = false
        context.maxIndentationLevel += 1
    }
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function loadOperation(args, context) {
    return { programStatus: GO_TO_X_LINE, programStatusDescriptor: context.saves[parseInt(args[0])] }
}
function saveOperation(args, context) {
    context.saves[parseInt(args[1])] = context.currentLine + parseInt(args[0])
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function upOperation(args, context) {
    return { programStatus: UP_X_LEVELS, programStatusDescriptor: parseInt(args[0]) }
}
function exitOperation(args, context) {
    return { programStatus: PROGRAM_HALTED, programStatusDescriptor: undefined }
}
