import DraftTextEditor from "./DraftTextEditor";
import React from "react";
import EditorState from "draft-js/lib/EditorState";
import DialogEngine from "./DialogEngine";
import SubscribableEvent from "./SubcribableEvent";
import DividerBar from "./DividerBar";
import DialogSide from "./DialogSide";

function MyEditor(props) {
    let editorState;
    let dialogEngine = new DialogEngine()
    let onProhibitSelectionStateChanged = new SubscribableEvent(),onDividerMoved = new SubscribableEvent(), onDialogChanged = new SubscribableEvent(),
    onOptionsChanged = new SubscribableEvent(), onOptionClicked = new SubscribableEvent();
    function compileButtonClicked() {
        dialogEngine.compile(editorState.getCurrentContent().getPlainText('\u0001'));
        onDialogChanged.Start(dialogEngine.getText())
        onOptionsChanged.Start(dialogEngine.getOptions())
    }
    onOptionClicked.Subscribe((chosenOption)=>{
        dialogEngine.chooseOption(chosenOption)
        onDialogChanged.Start(dialogEngine.getText())
        onOptionsChanged.Start(dialogEngine.getOptions())
    })
    return <div style={{ height: '100%' }}>
        <div className={'horizontalDialogLayout'}>
            <DraftTextEditor defaultDialog={props.defaultDialog} setEditorState={(t) => editorState = t}  onDividerMoved = {onDividerMoved} onProhibitSelectionStateChanged = {onProhibitSelectionStateChanged}/>
            <DividerBar onProhibitSelectionStateChanged = {onProhibitSelectionStateChanged} onDividerMoved = {onDividerMoved} />
            <DialogSide onProhibitSelectionStateChanged = {onProhibitSelectionStateChanged} onDialogChanged = {onDialogChanged} onOptionsChanged = {onOptionsChanged} onOptionClicked={onOptionClicked} />
        </div>

        <button className={'compileButton'} onClick={compileButtonClicked}> Compile!</button>
    </div>
}

export default MyEditor;