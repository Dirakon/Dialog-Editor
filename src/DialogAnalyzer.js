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
        this.saves = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]; // 10 saves
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
            alert(sht);
            if (seekingForElse > -1) {
                seekingForElse--;
            }
            let charId = 0;
            while (charId < this.code[line].length) {
                alert(this.code[line][charId]);
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
                    alert("op");
                    charId++;
                    let operation = this.readFromPointToDot(this.code[line], charId);
                    charId = operation[1];
                    operation = operation[0];
                    if (operation === this.EXIT) {
                        this.options=[];
                        this.text="";
                        return charId;
                    } else if (operation[0] === '"') {//That's THE speech
                        alert("THE");
                        let txt = "";
                        for (let i = 1;i < operation.length - 1;++i )
                        {
                            txt +=operation[i];
                        }
                        this.text = txt ;
                    } else if (operation === this.REMEMBER) {
                        let loadedSaveLine = this.readFromPointToDot(this.code[line], charId)[0];
                        this.process(this.saves[parseInt(loadedSaveLine)]);
                        return charId;
                    } else if (operation === this.DUNFORGET) {
                        let saveWhat = this.readFromPointToDot(this.code[line], charId);  // 0 - str, 1 - charId
                        charId = saveWhat[1];
                        saveWhat = parseInt(saveWhat[0]);
                        let saveWhere= this.readFromPointToDot(this.code[line], charId);  // 0 - str, 1 - charId
                        charId = saveWhere[1];
                        saveWhere = parseInt(saveWhere[0]);
                        this.saves[saveWhere] = saveWhat + 1 + line;
                    }
                    /*else if (com == DRUG || com == TIMA) {
                        Character pal;
                        if (com == DRUG) {
                            pal = sobut;
                        } else {
                            int
                            vot = int.Parse(readFromPointToDotNG(code[line], ch));
                            ch = savech;
                            pal = (Character.team[vot]);
                        }
                        com = readFromPointToDotNG(code[line], ch);
                        ch = savech;
                        if (com == VAR) {
                            string
                            znak = readFromPointToDotNG(code[line], ch);
                            ch = savech;
                            string
                            var =
                            "";
                            for (int i = 1;
                            i < znak.Length - 1;
                            ++i
                        )
                            {
                                var +=
                                znak[i];
                            }
                            znak = readFromPointToDotNG(code[line], ch);
                            ch = savech;
                            int
                            amount = int.Parse(readFromPointToDotNG(code[line], ch));
                            ch = savech;
                            if (znak == "=") {
                                pal.setVar(
                                var ,
                                amount
                            )
                                ;
                            } else if (znak == "+=") {
                                pal.addToVar(
                                var ,
                                amount
                            )
                                ;
                            } else {
                                bool
                                pass = false;
                                if (znak == "==") {
                                    pass = pal.getVar(
                                    var )
                                ==
                                    amount;
                                } else if (znak == ">=") {
                                    pass = pal.getVar(
                                    var )
                                >=
                                    amount;
                                } else if (znak == "!=") {
                                    pass = pal.getVar(
                                    var )
                                !=
                                    amount;
                                } else if (znak == "<=") {
                                    pass = pal.getVar(
                                    var )
                                <=
                                    amount;
                                } else if (znak == "<") {
                                    pass = pal.getVar(
                                    var )
                                <
                                    amount;
                                } else if (znak == ">") {
                                    pass = pal.getVar(
                                    var )
                                >
                                    amount;
                                }
                                if (pass) {
                                    maxsht++;
                                } else {
                                    seekingForInache = -2;
                                }
                            }
                        } else if (operation === this.ADDTAG) {
                            pal.addTag(readFromPointToDotNG(code[line], ch));
                            ch = savech;
                        } else if (operation === this.DELETETAG) {
                            pal.deleteTag(readFromPointToDotNG(code[line], ch));
                            ch = savech;
                        } else if (operation === this.HASTAG) {
                            if (pal.hasTag(readFromPointToDotNG(code[line], ch))) {
                                maxsht++;
                            } else {
                                seekingForInache = -2;
                            }
                            ch = savech;
                        }
                    } */
                    else if (operation === this.UP) {
                        let num = this.readFromPointToDot(this.code[line], this.ch);
                        charId = num[1];
                        num = parseInt(num[0])
                        let discussedLine = line - 1;
                        sht = 0;
                        while (sht !== num) {
                            for (let lch = 0;lch < this.code[discussedLine].length;++lch )
                            {
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
        this.process();
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
                    ans += '\n';
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

module.exports = DialogAnalyzer
