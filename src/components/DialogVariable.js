import { getQuoteWithoutQuotationMarks } from "./DialogUtils"

class DialogConstant{
    constructor (value){
        this.value=value
    }
    getValue(){
        return this.value
    }
    assignValue(newValue){
        throw("Trying to assign value to constant!")
    }
    
}

class DialogVariable{
    constructor (varName,varDictionary){
        this.varName=varName
        this.varDictionary=varDictionary
    }
    getValue(){
        return this.varDictionary[this.varName]
    }
    assignValue(newValue){
        this.varDictionary[this.varName] = newValue
    }
    
}

export function stringToVariable(string,varDictionary){
    if (string.startsWith('"')){
        return makeVariableOfDynamicType(getQuoteWithoutQuotationMarks(string),varDictionary)
    }else{
        return makeVariableOutOfConstant(string)
    }
}

function makeVariableOutOfConstant(string){
    return new DialogConstant(parseInt(string))
}

function makeVariableOfDynamicType(varName, variableDictionary){
    if (!variableDictionary.hasOwnProperty(varName)){
        variableDictionary[varName] = undefined
    }
    return new DialogVariable(varName,variableDictionary)
}
