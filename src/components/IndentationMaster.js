import { characterCountInString, replaceAllInString } from "./DialogUtils"

class IndentationMaster {
    constructor(context) {
        this.context = context
    }
    analyzeLineAndRemoveIndentationCharacters(line) {
        line = line.trim()
        if (line.startsWith('(')) {
            let amountOfOpeningBrackets = characterCountInString('(', line)
            this.context.indentationLevel += amountOfOpeningBrackets
        }
        else if (line.startsWith(')')) {
            let amountOfClosingBrackets = characterCountInString(')', line)
            this.context.indentationLevel -= amountOfClosingBrackets
            this.context.maxIndentationLevel = Math.min(this.context.maxIndentationLevel,this.context.indentationLevel)
        } else {
            return line
        }
        return replaceAllInString(replaceAllInString(line, '(', ''), ')', '')
    }
    canWeWorkInCurrentLine() {
        return this.context.indentationLevelIsInReach()
    }
}

export default IndentationMaster