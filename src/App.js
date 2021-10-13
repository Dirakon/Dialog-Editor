import React, {useEffect} from 'react';
import DraftTextEditor from './components/draftTextEditor'


function App() {
    useEffect(() => {
        document.title = "Dialog Editor"
    }, []);
    return (
        <div className="App" style={{height : '100%'}}>
            <div style ={{height:'100%'}}>
                <div className={'flexer'}>
                    <DraftTextEditor/>
                    <div className={'DIVIDER'}>
                    </div>
                    <div className={ 'dialogSide'}>
                        <div className={'actualDialog'}>
                        Dialog will be visible here!
                        </div>
                    </div>
                </div>

                <button className={'compiler'}> Compile!</button>
            </div>
        </div>


    );
}

export default App;
