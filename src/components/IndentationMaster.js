import { characterCountInString, replaceAllInString } from "./DialogUtils"

class IndentationMaster {
    constructor(context) {
        this.context = context
    }
    analyzeLineAndRemoveIndentationCharacters(line) {
        line = line.trim()
        if (line.startsWith('(') || line.startsWith(')')) {
            let amountOfOpeningBrackets = characterCountInString('(', line)
            let amountOfClosingBrackets = characterCountInString(')', line)
            this.context.indentationLevel += amountOfOpeningBrackets
            this.context.indentationLevel -= amountOfClosingBrackets
            while (this.context.maxIndentationLevel > 1 && amountOfClosingBrackets != 0) {
                this.context.maxIndentationLevel--;
                amountOfClosingBrackets--;
            }
            line = replaceAllInString(replaceAllInString(line,'(', ''),')', '')
        }
        return line
    }
    canWeWorkInCurrentLine() {
        return this.context.indentationLevelIsInReach()
    }
}

export default IndentationMaster