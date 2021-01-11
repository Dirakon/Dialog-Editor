import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import 'draft-js/dist/Draft.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import BrowserRouter from 'react-router-dom/BrowserRouter'
class MyEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createEmpty()};
        this.onChange = editorState => this.setState({editorState});
    }


    render() {
        return (
            <Editor editorState={this.state.editorState} onChange={this.onChange} />
        );
    }
}

ReactDOM.render(
    <BrowserRouter basename={process.env.PUBLIC_URL} >
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);
//ReactDOM.render(<React.StrictMode><MyEditor /></React.StrictMode>, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
