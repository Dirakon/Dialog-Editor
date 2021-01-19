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
        const el = document.querySelector('.actDialog');
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
            //Some kind of error, dunno...
        }
        this.process(this.curLine);
    }

    process(line) {
        this.text = "";
        this.options = [];
        line++;
        let sht = 1, minsht = 1, maxsht = 1;
        let seekingForElse = -1;
        while (sht !== 0) {
            if (seekingForElse > -1) {
                seekingForElse--;
            }
            let charId = 0;
            while (charId < this.code[line].length) {
                if (this.code[line][charId] === '(') { //Visibility change
                    sht++;
                } else if (this.code[line][charId] === ')') {   //Visibility change
                    if (maxsht !== 1 && ((sht < minsht || sht > maxsht)) === false) {
                        maxsht--;
                    } else if (seekingForElse === -2 && (sht < minsht || sht > maxsht) === true) {
                        seekingForElse = 2;
                    }
                    sht--;
                } else if (sht < minsht || sht > maxsht) {   //Out of our visibility
                    ++charId;
                    continue;
                } else if (this.code[line][charId] === '\\') {   //Option
                    charId++;
                    let newOption = "";
                    for (let lch = charId; lch < this.code[line].length; ++lch) {
                        if (this.code[line][lch] === '/') {
                            break;
                        }
                        newOption += this.code[line][lch];
                    }
                    this.options.push([newOption, line + 1])
                    break;
                } else if (this.code[line][charId] === ':') {   //Some operation
                    charId++;
                    let operation = this.readFromPointToDot(this.code[line], charId);
                    charId = operation[1];
                    operation = operation[0];
                    if (operation === this.EXIT) {  //Exit the dialog operation.
                        this.options = [];
                        this.text = "--EXITED THE DIALOG--";
                        return charId;
                    } else if (operation[0] === '"') {//That's THE text
                        let txt = "";
                        for (let i = 1; i < operation.length - 1; ++i) {
                            txt += operation[i];
                        }
                        this.text = txt;
                    } else if (operation === this.REMEMBER) {   //Load some point
                        let loadedSaveLine = this.readFromPointToDot(this.code[line], charId)[0];
                        this.process(this.saves[parseInt(loadedSaveLine)]);
                        return;
                    } else if (operation === this.DUNFORGET) {  //Save some point
                        let saveWhat = this.readFromPointToDot(this.code[line], charId);  // 0 - str, 1 - charId
                        charId = saveWhat[1];
                        saveWhat = parseInt(saveWhat[0]);
                        let saveWhere = this.readFromPointToDot(this.code[line], charId);  // 0 - str, 1 - charId
                        charId = saveWhere[1];
                        saveWhere = parseInt(saveWhere[0]);
                        this.saves[saveWhere] = saveWhat + 1 + line;
                    } else if (operation === this.VAR) {        //Working with variables
                        let sign = this.readFromPointToDot(this.code[line], charId);
                        charId = sign[1];
                        sign = sign[0];
                        let variable = ""
                        for (let i = 1; i < sign.length - 1; ++i) {
                            variable += sign[i];
                        }
                        sign = this.readFromPointToDot(this.code[line], charId);
                        charId = sign[1];
                        sign = sign[0];
                        let amount = this.readFromPointToDot(this.code[line], charId);
                        charId = amount[1];
                        amount = parseInt(amount[0]);
                        if (sign === "=") {
                            this.vars[variable] = amount;
                        } else if (sign === "+=") {
                            this.vars[variable]+=amount;
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
                                pass = this.vars[variable] < amount;
                            }
                            if (pass) {
                                maxsht++;
                            } else {
                                seekingForElse = -2;
                            }
                        }
                    } else if (operation === this.ADDTAG) {
                        let tag = this.readFromPointToDot(this.code[line], charId);
                        charId = tag[1];
                        tag = tag[0];
                        this.tags[tag]=true;
                    } else if (operation === this.DELETETAG) {
                        let tag = this.readFromPointToDot(this.code[line], charId);
                        charId = tag[1];
                        tag = tag[0];
                        this.tags[tag] = false;
                    }
                     else if (operation === this.HASTAG) {
                        let tag = this.readFromPointToDot(this.code[line], charId);
                        charId = tag[1];
                        tag = tag[0];
                        if (!(tag in this.tags) || this.tags[tag] === false ) {
                            seekingForElse = -2;
                        } else {
                            maxsht++;
                        }
                    } else if (operation === this.UP) {
                        let num = this.readFromPointToDot(this.code[line], charId);
                        charId = num[1];
                        num = parseInt(num[0])
                        let discussedLine = line - 1;
                        sht = -1;
                        while (sht !== num) {
                            for (let lch = 0; lch < this.code[discussedLine].length; ++lch) {
                                if (this.code[discussedLine][lch] === ' ' || this.code[discussedLine][lch] === '\t' || this.code[discussedLine][lch] === '\n') {
                                    continue;
                                }
                                if (this.code[discussedLine][lch] === '(') {
                                    sht++;
                                } else if (this.code[discussedLine][lch] === ')') {
                                    sht--;
                                } else {
                                    break;
                                }
                            }
                            discussedLine--;
                        }
                        return this.process(discussedLine + 1);
                    } else if (operation === this.ELSE && seekingForElse > -1) {
                        seekingForElse = -1;
                        maxsht++;
                    }
                    break;
                }
                ++charId;
            }
            ++line;
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

    readFromPointToDot(line, charId) {    //Returns [string we were looking for,new char id]
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
                return [ans, charId + 1];
            }
            ans += line[charId];
            ++charId;
        }
        return [ans, charId + 1];
    }


}

export default DialogAnalyzer;
