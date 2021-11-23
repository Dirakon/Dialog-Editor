import DraftTextEditor from "./DraftTextEditor";
import React, { useEffect } from "react";
import EditorState from "draft-js/lib/EditorState";
import DialogEngine from "../scripts/DialogEngine";
import SubscribableEvent from "../scripts/SubcribableEvent";
import DividerBar from "./DividerBar";
import DialogSide from "./DialogSide";

function MyEditor(props) {
    let draftTextEditor;
    let dialogEngine = new DialogEngine()
    let onProhibitSelectionStateChanged = new SubscribableEvent(), onDividerMoved = new SubscribableEvent(), onDialogChanged = new SubscribableEvent(),
        onOptionsChanged = new SubscribableEvent(), onOptionClicked = new SubscribableEvent();
    function compileButtonClicked() {
        dialogEngine.compile(draftTextEditor.state.editorState.getCurrentContent().getPlainText('\u0001'));
        onDialogChanged.Start(dialogEngine.getText())
        onOptionsChanged.Start(dialogEngine.getOptions())
    }
    useEffect(() => {
        onOptionClicked.Subscribe((chosenOption) => {
            dialogEngine.chooseOption(chosenOption)
            onDialogChanged.Start(dialogEngine.getText())
            onOptionsChanged.Start(dialogEngine.getOptions())
        })
    }, [])
    return <div style={{ height: '100%' }}>
        <div className={'horizontalDialogLayout'}>
            <DraftTextEditor defaultDialog={props.defaultDialog} setChild={(t) => draftTextEditor = t} onDividerMoved={onDividerMoved} onProhibitSelectionStateChanged={onProhibitSelectionStateChanged} />
            <DividerBar onProhibitSelectionStateChanged={onProhibitSelectionStateChanged} onDividerMoved={onDividerMoved} />
            <DialogSide onProhibitSelectionStateChanged={onProhibitSelectionStateChanged} onDialogChanged={onDialogChanged} onOptionsChanged={onOptionsChanged} onOptionClicked={onOptionClicked} />
        </div>

        <button className={'compileButton'} onClick={compileButtonClicked}> Compile!</button>
    </div>
}

export default MyEditor;