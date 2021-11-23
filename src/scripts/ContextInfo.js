class ContextInfo{
    constructor(currentLine,vars,tags,saves){
        this.saves = saves
        this.tags=tags
        this.vars=vars
        this.currentLine=currentLine
        this.indentationLevel = 1
        this.nextElseIsToExecute = false
        this.maxIndentationLevel = 1
    }
    indentationLevelIsInReach(){
        return this.indentationLevel >= 1 && this.indentationLevel <= this.maxIndentationLevel
    }
    getClone(){
        return {line:this.currentLine, indentationLevel:this.indentationLevel,maxIndentationLevel:this.maxIndentationLevel}
    }
    setToClone(clone){
        ({line:this.currentLine,indentationLevel:this.indentationLevel,maxIndentationLevel:this.maxIndentationLevel}=clone)
    }
}
export default ContextInfo