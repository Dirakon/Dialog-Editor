import ContextInfo from "./ContextInfo";
import { interpretOneLine, PROGRAM_HALTED, UP_X_LEVELS, SEEK_FOR_NEXT_ELSE, getNextLineFromProgramStatus, GO_TO_NEXT_LINE, locateLineXLevelsUp, locateLineWithNextElse } from "./DialogInterpeter";
import { SYMBOL_NOT_FOUND_FLAG, formatCodeToBrowserStyle } from "./DialogUtils";
import IndentationMaster from "./IndentationMaster";

class DialogEngine {
    compile(code) {
        this.setToInitialState(formatCodeToBrowserStyle(code))
        let firstLine = this.getLineWithFirstLeftBracket();
        if (firstLine == SYMBOL_NOT_FOUND_FLAG) {
            //Did not find the first left bracket...
            throw ("You are missing the first left bracket! Code is incorrect.")
        }
        this.process(firstLine + 1);
    }

    setToInitialState(code) {
        this.code = code.split('');
        this.curLine = 0;
        this.tags = [];
        this.vars = {};
        this.saves = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]; // 10 saves
    }

    getLineWithFirstLeftBracket() {
        for (let lineIndex = 0; lineIndex < this.code.length; ++lineIndex) {
            let bracketIndex = this.code[lineIndex].indexOf('(')
            if (bracketIndex !== SYMBOL_NOT_FOUND_FLAG)
                return lineIndex
        }
        return SYMBOL_NOT_FOUND_FLAG
    }


    process(line) {
        this.text = "";
        this.options = [];
        let context = new ContextInfo(line + 1, this.vars, this.tags, this.saves)
        this.programStatus = GO_TO_NEXT_LINE
        while (context.indentationLevel !== 0) {
            let { newOptions, newText, programStatus: newProgramStatus, programStatusDescriptor } = interpretOneLine(this.code[context.currentLine], context, this.programStatus)
            this.applyNewInformation(newProgramStatus, newText, newOptions);
            if (this.programStatus == PROGRAM_HALTED) {
                break;
            } else if (this.programStatus == UP_X_LEVELS) {
                this.goXLevelsUp(context, programStatusDescriptor);
            } else if (this.programStatus == SEEK_FOR_NEXT_ELSE) {
                this.goToNextElseOtherwiseNextLine(context);
            } else {
                context.currentLine = getNextLineFromProgramStatus(this.programStatus, programStatusDescriptor, context.currentLine)
            }
        }
    }

    applyNewInformation(newProgramStatus, newText, newOptions) {
        this.programStatus = newProgramStatus;
        if (newText !== undefined)
            this.text = newText;
        this.options = [...this.options, ...newOptions];
    }

    goToNextElseOtherwiseNextLine(context) {
        let lineWithElse = locateLineWithNextElse(this.code, context);
        this.programStatus = GO_TO_NEXT_LINE;
        if (lineWithElse == SYMBOL_NOT_FOUND_FLAG)
            context.currentLine = getNextLineFromProgramStatus(this.programStatus, undefined, context.currentLine);
        else
            context.currentLine = lineWithElse;
    }

    goXLevelsUp(context, programStatusDescriptor) {
        context.currentLine = locateLineXLevelsUp(this.code, programStatusDescriptor, context);
        this.programStatus = GO_TO_NEXT_LINE;
        if (context.currentLine == SYMBOL_NOT_FOUND_FLAG) {
            throw ("Cannot locate line with specified amount of levels of indentation up");
        }
    }

    getText() {
        return this.text;
    }

    getOptions() {
        return this.options.map(option => option[0]);
    }

    chooseOption(optionIndex) {
        this.curLine = this.options[optionIndex][1];
        this.process(this.curLine);
    }

}

export default DialogEngine;

