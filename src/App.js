import React, { useEffect } from 'react';
import DraftTextEditor from './components/DraftTextEditor'
import MyEditor from './components/MyEditor.jsx';
import { replaceAllInString } from './scripts/DialogUtils';
import { getSampleDialog } from './scripts/FileLoader';

function App() {
    let sampleDialog = getSampleDialog();
    document.title = "Dialog Editor"

    return (
        <div className="App" style={{ height: '100%' }}>
            <MyEditor defaultDialog={sampleDialog} />
        </div>
    );
}

export default App;