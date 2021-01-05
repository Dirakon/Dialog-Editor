class DialogAnalyzer{
    compile (code){//return [text,[options]]
        const el = document.querySelector('.actDialog');
        this.code = code.split('');
        this.curLine = 0;
        this.tags = {};
        this.vars = {};
        let ans = ["COMPILED!",[]];
        let found = false;
        for (;this.curLine < this.code.length;++this.curLine){
            for (let charId = 0; charId < this.code[this.curLine].length;++charId){
                if (this.code[this.curLine][charId] === '('){
                    found = true;
                    break;
                }

            }
            if (found) {
                break;
            }
        }
        if (!found){
            //Some kind of error, dunno...
        }


        return ans;
    }
    readFromPointToDot(line,charId){    //Returns [string we were looking for,new char id]
        let ans = "";
        let quotes = false;
        while (charId < line.length){
            if (line[charId] === '"'){
                quotes = !quotes;
            }
            if (quotes){
                if (line[charId] === '\\'  && line.length -1 !== charId && line[charId+1] === 'n'){ //New line when writing dialogs
                    charId+=2;
                    ans+='\n';
                    continue;
                }
            }
            else if (line[charId] === '.'){
                return [ans,charId+1];
            }
            ans += line[charId];
            ++charId;
        }
        return [ans,charId+1];
    }



}

module.exports=DialogAnalyzer
