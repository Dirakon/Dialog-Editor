
export const SYMBOL_NOT_FOUND_FLAG = -1;

export function readFromPointToDot(line, charId) {    //Returns {str:string we were looking for, charId: new char id}
    let lineWithoutUserStrings = replaceUserStringsWithSafeCharacters(line)
    let noStringLineFromThePoint = lineWithoutUserStrings.substr(charId)
    let indexOfDotInNewLine = noStringLineFromThePoint.indexOf('.')
    let desiredString;
    if (indexOfDotInNewLine == SYMBOL_NOT_FOUND_FLAG) {
        desiredString = line.substring(charId)
    } else {
        desiredString = line.substring(charId, charId+indexOfDotInNewLine)
    }
    return { str: desiredString, charId: charId + desiredString.length }
}
export function replaceAllInString(string,elementOld,elementNew){
    return string.split(elementOld).join(elementNew);
}
export function removeElementFromArray(elem,array){
    return array.filter(el=>el!=elem)
}

export function getQuoteWithoutQuotationMarks(string){
    return string.substr(1,string.length-2)
}
export function formatCodeToBrowserStyle(code) {
    return replaceAllInString(code,'\\n', '<br>')
}
export function getLineWithoutComments(line){
    let noUserStringsLine = replaceUserStringsWithSafeCharacters(line)
    let indexOfCommentStart = noUserStringsLine.indexOf('//')
    if (indexOfCommentStart == SYMBOL_NOT_FOUND_FLAG){
        return line
    }else{
        return line.substr(0,indexOfCommentStart)
    }
}

const safeCharacter = 'a'
export function replaceUserStringsWithSafeCharacters(line) {
    if (characterCountInString(line,'"') % 2 != 0)
        throw ("string not closed in the following line: " + line)
    let newLine = ""
    let currentlyInUserString = false
    for (let character of line) {
        if (character == '"') {
            newLine += safeCharacter
            currentlyInUserString = !currentlyInUserString
        } else {
            newLine += currentlyInUserString ? safeCharacter : character;
        }
    }
    return newLine
}

export function characterCountInString(character, string) {
    return string.split(character).length - 1
}
