import DraftTextEditor from "./DraftTextEditor";
import React from "react";
import EditorState from "draft-js/lib/EditorState";
import DialogAnalyzer from "./DialogAnalyzer";
class MyEditor extends React.Component {
    constructor(props) {
        super(props);
        this.defaultDialog = props.defaultDialog;
        this.state = { editorState: EditorState.createEmpty() };
        this.onChange = editorState => this.setState({ editorState });
        this.dialogEngine = new DialogAnalyzer();
        this.previousOptions = [];
    }
    setChild(child) {
        this.editorComponentClass = child
    }

    setupDraggableBar() {
        const editorCore = document.querySelector('.RichEditor-root')
        let movingAllowed = false;
        const divider = document.querySelector(".dividerBar")
        const saveThis = this;
        const changeMouseStatus = function (event) {
            movingAllowed = !movingAllowed;
            saveThis.editorContent.classList.toggle("prohibitSelection")
            saveThis.dialogOutputConent.classList.toggle("prohibitSelection")
        }
        divider.addEventListener("mousedown", changeMouseStatus, false);
        divider.addEventListener("mouseup", changeMouseStatus, false);
        document.addEventListener("mousemove", function (event) {
            if (movingAllowed) {
                editorCore.style.width = (event.clientX - 32).toString() + 'px';
            }
        }, false);
    }

    buttonClicked() {
        for (let i = 0; i < this.previousOptions.length; ++i) {
            this.previousOptions[i].remove();
        }
        this.previousOptions = [];
        let options = this.dialogEngine.getOptions();
        if (options === undefined)
            return
        for (let i = 0; i < options.length; ++i) {
            let optionButton = document.createElement("button");
            optionButton.innerHTML = options[i][0];
            const remOption = options[i];
            const saveThis = this;
            optionButton.addEventListener("click", function () {
                saveThis.dialogEngine.chooseOption(remOption);
                saveThis.buttonClicked();
            })
            this.previousOptions.push(optionButton);
            this.dialogOutputConent.appendChild(optionButton);
        }
        document.querySelector('.actualDialog').innerHTML = this.dialogEngine.getText();
    }

    componentDidMount() {
        this.setupDraggableBar()

        this.dialogOutputConent = document.querySelector(".dialogSide");
        this.editorContent = document.querySelector(".public-DraftEditor-content")

        const saveThis = this;
        document.querySelector('.compileButton').addEventListener("click", () => {
            saveThis.dialogEngine.compile(this.editorComponentClass.state.editorState.getCurrentContent().getPlainText('\u0001'));
            saveThis.buttonClicked();
        })

    }

    render() {
        return (
            <DraftTextEditor parent={this} defaultDialog={this.defaultDialog} />
        );
    }
}


export default MyEditor;