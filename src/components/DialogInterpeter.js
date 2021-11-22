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
    while (context.currentLine >= 0) {
        let line = indentationMaster.analyzeLineAndRemoveIndentationCharacters(getLineWithoutComments(lines[context.currentLine]))
        if (indentationMaster.canWeWorkInCurrentLine()) {
            if (line.startsWith(':else')) {
                context.setToClone(saveContext)
                context.nextElseIsToExecute = true
                return indentationMaster.currentLine
            } else if (linesToSeekForElseForLeft-- == 0) {
                break;
            }
        }
        context.currentLine--;
    }
    context.setToClone(saveContext)
    return SYMBOL_NOT_FOUND_FLAG
}

export function locateLineXLevelsUp(lines, howManyLevelsUp, context) {
    let saveIndentationLevel = context.indentationLevel
    context.indentationLevel -= howManyLevelsUp
    let indentationMaster = new IndentationMaster(context)
    while (context.currentLine > 0 && saveIndentationLevel != context.indentationLevel) {
        context.currentLine--;
        indentationMaster.analyzeLineAndRemoveIndentationCharacters(getLineWithoutComments(lines[context.currentLine]))
    }
    if (context.currentLine < 0)
        return SYMBOL_NOT_FOUND_FLAG
    else
        return context.currentLine
}

const regexToSplitDotsOutsideOfQuotationMarks = /\.(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/
export function interpretOneLine(line, context, programStatus) {
    let programStatusDescriptor = 0
    let indentationMaster = new IndentationMaster(context)
    let newOptions = [], newText = undefined

    line = indentationMaster.analyzeLineAndRemoveIndentationCharacters(getLineWithoutComments(line))
    console.log(line)
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
            let { str: operationCall } = readFromPointToDot(line, 1)
            let args = line.substr(operationCall.length + 2)
                .split(regexToSplitDotsOutsideOfQuotationMarks)
            //   .map((arg) => arg.startsWith('"') ? arg.substr(1, arg.length - 2) : parseInt(arg))
            console.log(operationCall);
            console.log(args)
            console.log(operationNameToOperationFunction[operationCall]);
            ({ programStatus, programStatusDescriptor } = operationNameToOperationFunction[operationCall](args, context))
        } else {
            programStatus = GO_TO_NEXT_LINE
        }
    }
    console.log(newText)
    return { newOptions: newOptions, newText: newText, programStatus: programStatus, programStatusDescriptor: programStatusDescriptor }
    /*
        while (charId < line.length) {
            if (line[charId] === '(') { //Visibility change
                context.indentationLevel++;
            } else if (line[charId] === ')') {   //Visibility change
                if (context.maxIndentationLevel !== 1 && context.indentationLevelIsInReach()) {
                    context.maxIndentationLevel--;
                } else if (context.currentLinesToSeekForElseFor === -2 && !context.indentationLevelIsInReach()) {
                    context.currentLinesToSeekForElseFor = 2;
                }
                context.indentationLevel--;
            } else if (!context.indentationLevelIsInReach()) {   //Out of our visibility
                ++charId;
                continue;
            } else if (line[charId] === '\\') {   //Option
                let optionEnd = line.indexOf('/')
                let newOption = line.substring(charId + 1, optionEnd);
                charId = optionEnd + 1
                newOptions.push([newOption, context.currentLine + 1])
                break;
            } else if (line[charId] === ':') {   //Some operation
                charId++;
                let { str: operation, newCharId } = readFromPointToDot(line, charId);
                charId=newCharId
                if (operation[0] === '"') {//That's THE text
                    newText = operation.replace('"', '');
                }
                else {
                      programStatus  = operationNameToOperationFunction[operation](charId, context)
                    
                }
                break;
            }
            ++charId;
        }*/
}


function variableOperation(args, context) {
    let var1 = stringToVariable(args[0],context.vars), sign = args[1], var2 = stringToVariable(args[2],context.vars)
    if (sign === '=') {
        var1.assignValue(var2)
    } else if (sign === '+=') {
        var1.assignValue(var1.getValue() + var2.getValue())
    } else if (sign === '-=') {
        var1.assignValue(var1.getValue() - var2.getValue())
    } else {
        let pass = applyLogicalOperationToVariables(sign, var1, var2);
        if (pass) {
            context.maxIndentationLevel++
        } else {
            return { programStatus: SEEK_FOR_NEXT_ELSE, programStatusDescriptor: undefined }
        }
    }
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
    /*  let sign = readFromPointToDot(this.code[context.currentLine], charId);
      charId = sign.charId;
      sign = sign.str;
      let variable = ""
      for (let i = 1; i < sign.length - 1; ++i) {
          variable += sign[i];
      }
      sign = readFromPointToDot(this.code[context.currentLine], charId);
      charId = sign.charId;
      sign = sign.str;
      let amount = readFromPointToDot(this.code[context.currentLine], charId);
      charId = amount.charId;
      amount = parseInt(amount.str);
      if (sign === "=") {
          this.vars[variable] = amount;
      } else if (sign === "+=") {
          this.vars[variable] += amount;
      } else {
          let pass = false;
          if (sign === "==") {
              pass = this.vars[variable] === amount;
          } else if (sign === ">=") {
              pass = this.vars[variable] >= amount;
          } else if (sign === "!=") {
              pass = this.vars[variable] !== amount;
          } else if (sign === "<=") {
              pass = this.vars[variable] <= amount;
          } else if (sign === "<") {
              pass = this.vars[variable] < amount;
          } else if (sign === ">") {
              pass = this.vars[variable] > amount;
          }
          if (pass) {
              context.maxIndentationLevel++;
          } else {
              context.currentLinesToSeekForElseFor = -2;
          }
      }*/
}
function applyLogicalOperationToVariables(sign, var1, var2) {
    switch (sign) {
        case '==':
            return  var1.getValue() == var2.getValue();
        case ">=":
            return  var1.getValue() >= var2.getValue();
        case "!=":
            return  var1.getValue() != var2.getValue();
        case "<=":
            return var1.getValue() <= var2.getValue();
        case "<":
            return  var1.getValue() < var2.getValue();
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
    if (context.tags.includes(getQuoteWithoutQuotationMarks(args[0]))) {
        context.maxIndentationLevel += 1
    }
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function elseOperation(args, context) {
    if (context.nextElseIsToExecute) {
        context.nextElseIsToExecute = false
        context.maxIndentationLevel += 1
    }
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function loadOperation(args, context) {
    console.log(args[0])
    console.log(context.saves[parseInt(args[0])])
    return { programStatus: GO_TO_X_LINE, programStatusDescriptor: context.saves[parseInt(args[0])] }
}
function saveOperation(args, context) {
    console.log(args[0])
    context.saves[parseInt(args[1])] = context.currentLine + parseInt(args[0])
    console.log(context.saves[parseInt(args[1])])
    return { programStatus: GO_TO_NEXT_LINE, programStatusDescriptor: undefined }
}
function upOperation(args, context) {
    return { programStatus: UP_X_LEVELS, programStatusDescriptor: context.saves[parseInt(args[0])] }
}
function exitOperation(args, context) {
    return { programStatus: PROGRAM_HALTED, programStatusDescriptor: undefined }
}
/*
function executeAnOperation(operation, charId, context) {
    let needsToExit = false;
    switch (operation) {
        case VAR: {        //Working with variables

        }
            break;
        case ADD_TAG: {
            let tag = readFromPointToDot(this.code[context.currentLine], charId);
            charId = tag.charId;
            tag = tag.str;
            this.tags[tag] = true;
        }
            break;
        case DELETE_TAG: {
            let tag = readFromPointToDot(this.code[context.currentLine], charId);
            charId = tag.charId;
            tag = tag.str;
            this.tags[tag] = false;
        }
            break;
        case HAS_TAG: {
            let tag = readFromPointToDot(this.code[context.currentLine], charId);
            charId = tag.charId;
            tag = tag.str;
            if (!(tag in this.tags) || this.tags[tag] === false) {
                context.currentLinesToSeekForElseFor = -2;
            } else {
                context.maxIndentationLevel++;
            }
        }
            break;
        case ELSE: {
            if (context.currentLinesToSeekForElseFor > -1) {
                context.currentLinesToSeekForElseFor = -1;
                context.maxIndentationLevel++;
            }
        }
            break;
        case EXIT: {//Exit the dialog operation.
            this.options = [];
            this.text = "--EXITED THE DIALOG--";
            needsToExit = true
        }
            break;
        case LOAD: {  //Load some point
            let loadedSaveLine = readFromPointToDot(this.code[context.currentLine], charId).str;
            this.process(this.saves[parseInt(loadedSaveLine)]);
            needsToExit = true
        }
            break;
        case SAVE: { //Save some point
            let saveWhat = readFromPointToDot(this.code[context.currentLine], charId);  // 0 - str, 1 - charId
            charId = saveWhat.charId;
            saveWhat = parseInt(saveWhat.str);
            let saveWhere = readFromPointToDot(this.code[context.currentLine], charId);  // 0 - str, 1 - charId
            charId = saveWhere.charId;
            saveWhere = parseInt(saveWhere.str);
            this.saves[saveWhere] = saveWhat + 1 + context.currentLine;
        }
            break;
        case UP: {
            let num = readFromPointToDot(this.code[context.currentLine], charId);
            charId = num.charId;
            num = parseInt(num.str)
            let discussedLine = context.currentLine - 1;
            context.indentationLevel = -1;
            while (context.indentationLevel !== num) {
                for (let lch = 0; lch < this.code[discussedLine].length; ++lch) {
                    if (this.code[discussedLine][lch] === ' ' || this.code[discussedLine][lch] === '\t' || this.code[discussedLine][lch] === '\n') {
                        continue;
                    }
                    if (this.code[discussedLine][lch] === '(') {
                        context.indentationLevel++;
                    } else if (this.code[discussedLine][lch] === ')') {
                        context.indentationLevel--;
                    } else {
                        break;
                    }
                }
                discussedLine--;
            }
            this.process(discussedLine + 1);
            needsToExit = true;
        }
            break;
    }
    return { needsToExit: needsToExit, charId: charId }
}
*/