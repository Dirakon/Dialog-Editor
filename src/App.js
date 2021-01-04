import React from 'react';
import './App.css';
import DraftTextEditor from './components/DraftTextEditor'

var pj = 0

function App() {
    return (
        <div className="App" style={{height : '100%'}}>
            <div style ={{height:'100%'}}>
                <div className={'flexer'}>
                    <DraftTextEditor/>
                    <div className={'DIVIDER'} draggable={true}>
                    </div>
                    <div className={ 'actDialog'}>
                        dialog Example
                    </div>
                </div>

                <button> Compile!</button>
            </div>
        </div>


    );
}

export default App;
