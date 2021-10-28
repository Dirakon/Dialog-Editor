import { useCallback } from "react";

class DialogAnalyzer {
    constructor(props) {
        // OPERATIONS:
        this.EXIT = "exit";
        this.DUNFORGET = "save";
        this.REMEMBER = "load";
        this.ADDTAG = "addTag";
        this.VAR = "var";
        this.ELSE = "else";
        this.HASTAG = "hasTag";
        this.UP = "up";
        this.DELETETAG = "deleteTag";
    }

    compile(code) {
        this.code = code.split('');
        this.curLine = 0;
        this.tags = {};
        this.vars = {};
        this.saves = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]; // 10 saves
        let found = false;
        for (; this.curLine < this.code.length; ++this.curLine) {
            for (let charId = 0; charId < this.code[this.curLine].length; ++charId) {
                if (this.code[this.curLine][charId] === '(') {
                    found = true;
                    break;
                }

            }
            if (found) {
                break;
            }
        }
        if (!found) {
            //Did not found the first left bracket...
            alert("You are missing the first left bracket! Code is incorrect.")
            return
        }
        this.process(this.curLine);
    }

    executeAnOperation(operation, charId, context) {
        let needsToExit = false;
        switch (operation) {
            case (this.VAR): {        //Working with variables
                let sign = this.readFromPointToDot(this.code[context.line], charId);
                charId = sign.charId;
                sign = sign.str;
                let variable = ""
                for (let i = 1; i < sign.length - 1; ++i) {
                    variable += sign[i];
                }
                sign = this.readFromPointToDot(this.code[context.line], charId);
                charId = sign.charId;
                sign = sign.str;
                let amount = this.readFromPointToDot(this.code[context.line], charId);
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
                        context.seekingForElse = -2;
                    }
                }
            }
                break;
            case this.ADDTAG: {
                let tag = this.readFromPointToDot(this.code[context.line], charId);
                charId = tag.charId;
                tag = tag.str;
                this.tags[tag] = true;
            }
                break;
            case this.DELETETAG: {
                let tag = this.readFromPointToDot(this.code[context.line], charId);
                charId = tag.charId;
                tag = tag.str;
                this.tags[tag] = false;
            }
                break;
            case this.HASTAG: {
                let tag = this.readFromPointToDot(this.code[context.line], charId);
                charId = tag.charId;
                tag = tag.str;
                if (!(tag in this.tags) || this.tags[tag] === false) {
                    context.seekingForElse = -2;
                } else {
                    context.maxIndentationLevel++;
                }
            }
                break;
            case this.ELSE: {
                if (context.seekingForElse > -1) {
                    context.seekingForElse = -1;
                    context.maxIndentationLevel++;
                }
            }
                break;
            case this.EXIT: {//Exit the dialog operation.
                this.options = [];
                this.text = "--EXITED THE DIALOG--";
                needsToExit = true
            }
                break;
            case this.REMEMBER: {  //Load some point
                let loadedSaveLine = this.readFromPointToDot(this.code[context.line], charId).str;
                this.process(this.saves[parseInt(loadedSaveLine)]);
                needsToExit = true
            }
                break;
            case this.DUNFORGET: { //Save some point
                let saveWhat = this.readFromPointToDot(this.code[context.line], charId);  // 0 - str, 1 - charId
                charId = saveWhat.charId;
                saveWhat = parseInt(saveWhat.str);
                let saveWhere = this.readFromPointToDot(this.code[context.line], charId);  // 0 - str, 1 - charId
                charId = saveWhere.charId;
                saveWhere = parseInt(saveWhere.str);
                this.saves[saveWhere] = saveWhat + 1 + context.line;
            }
                break;
            case this.UP: {
                let num = this.readFromPointToDot(this.code[context.line], charId);
                charId = num.charId;
                num = parseInt(num.str)
                let discussedLine = context.line - 1;
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

    process(line) {
        this.text = "";
        this.options = [];
        let context = {}
        context.line = ++line;
        context.indentationLevel = 1
        context.minIndentationLevel = 1
        context.maxIndentationLevel = 1;
        context.seekingForElse = -1;
        while (context.indentationLevel !== 0) {
            if (context.seekingForElse > -1) {
                context.seekingForElse--;
            }
            let charId = 0;
            while (charId < this.code[context.line].length) {
                if (this.code[context.line][charId] === '(') { //Visibility change
                    context.indentationLevel++;
                } else if (this.code[context.line][charId] === ')') {   //Visibility change
                    if (context.maxIndentationLevel !== 1 && ((context.indentationLevel < context.minIndentationLevel || context.indentationLevel > context.maxIndentationLevel)) === false) {
                        context.maxIndentationLevel--;
                    } else if (context.seekingForElse === -2 && (context.indentationLevel < context.minIndentationLevel || context.indentationLevel > context.maxIndentationLevel) === true) {
                        context.seekingForElse = 2;
                    }
                    context.indentationLevel--;
                } else if (context.indentationLevel < context.minIndentationLevel || context.indentationLevel > context.maxIndentationLevel) {   //Out of our visibility
                    ++charId;
                    continue;
                } else if (this.code[context.line][charId] === '\\') {   //Option
                    charId++;
                    let newOption = "";
                    for (let lch = charId; lch < this.code[context.line].length; ++lch) {
                        if (this.code[context.line][lch] === '/') {
                            break;
                        }
                        newOption += this.code[context.line][lch];
                    }
                    this.options.push([newOption, context.line + 1])
                    break;
                } else if (this.code[context.line][charId] === ':') {   //Some operation
                    charId++;
                    let operation = this.readFromPointToDot(this.code[context.line], charId);
                    charId = operation.charId;
                    operation = operation.str;
                    if (operation[0] === '"') {//That's THE text
                        let txt = "";
                        for (let i = 1; i < operation.length - 1; ++i) {
                            txt += operation[i];
                        }
                        this.text = txt;
                    }
                    else {
                        let opResult = this.executeAnOperation(operation, charId, context)
                        if (opResult.needsToExit == true) {
                            return opResult.charId;
                        }
                        charId = opResult.charId;
                    }
                    break;
                }
                ++charId;
            }
            ++context.line;
        }
    }

    getText() {
        return this.text;
    }

    getOptions() {  // [options] where one option is [string, lineNum]
        return this.options;
    }

    chooseOption(option) {
        this.curLine = option[1];
        this.process(this.curLine);
    }

    readFromPointToDot(line, charId) {    //Returns {str:string we were looking for, charId: new char id}
        let ans = "";
        let quotes = false;
        while (charId < line.length) {
            if (line[charId] === '"') {
                quotes = !quotes;
            }
            if (quotes) {
                if (line[charId] === '\\' && line.length - 1 !== charId && line[charId + 1] === 'n') { //New line when writing dialogs
                    charId += 2;
                    ans += '<br>';
                    continue;
                }
            } else if (line[charId] === '.') {
                return { str: ans, charId: charId + 1 };
            }
            ans += line[charId];
            ++charId;
        }
        return { str: ans, charId: charId + 1 }
    }


}

export default DialogAnalyzer;
