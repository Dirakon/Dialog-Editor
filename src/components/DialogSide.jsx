import { useState } from "react";

function DialogSide(props) {
    let [selectionProhibited, setSelectionProhibited] = useState(false);
    let [currentDialog, setCurrentDialog] = useState('Dialog will be visible here!');
    let [currentOptions, setCurrentOptions] = useState([])
    props.onProhibitSelectionStateChanged.Subscribe(() => { setSelectionProhibited(!selectionProhibited) })
    props.onOptionsChanged.Subscribe((newOptions) => { setCurrentOptions(newOptions) })
    props.onDialogChanged.Subscribe((dialog) => { setCurrentDialog(dialog) })
    return <div className={selectionProhibited ? 'dialogSide prohibitSelection' : 'dialogSide'}>
        <div className={'actualDialog'}>
            {currentDialog}
            {currentOptions.map((option, index) => <div key={index}>
                <br />
                <button key={index} onClick={() => props.onOptionClicked.Start(index)}>{option}</button>
            </div>)}
        </div>
    </div>
}

export default DialogSide;