import React from 'react';
import {Editor, EditorState, getDefaultKeyBinding, RichUtils} from 'draft-js';
import './RichText.css'
let rem;
const stateFromHTML = require('draft-js-import-html').stateFromHTML;

class DraftTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createWithText(sampleDialog)};

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({editorState});

        this.handleKeyCommand = this._handleKeyCommand.bind(this);
        this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
        this.toggleBlockType = this._toggleBlockType.bind(this);
        this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    }

    getInitialState() {
        let contentState = stateFromHTML('<p>Hello</p>');
        return {
            editorState: EditorState.createWithContent(contentState)
        };
    }

    componentDidMount() {
        const button = document.querySelector('.compiler');
        rem = this;
        const editorCore = document.querySelector('.RichEditor-root')
        var DialogAnalyzer = require('../DialogAnalyzer');
        const dialoger = new DialogAnalyzer();
        document.addEventListener("drag", function(event) {
            if (event.clientX !== 0) {
                editorCore.style.width = (event.clientX-32).toString() + 'px';
            }
        }, false);
        let previousOptions = [];
        const updateIt = function(){
            for (let i = 0; i < previousOptions.length;++i){
                previousOptions[i].remove();
            }
            previousOptions = [];
            let options = dialoger.getOptions();
            let papa =  document.getElementsByClassName("dialogSide")[0]
            for (let i = 0; i < options.length;++i){
                let element = document.createElement("button");
                element.innerHTML=options[i][0];
                const remOption = options[i];
                element.addEventListener("click",function () {
                    dialoger.chooseOption(remOption);
                    updateIt();
                })
                previousOptions.push(element);
                papa.appendChild(element);
            }
            document.querySelector('.actualDialog').innerHTML= dialoger.getText();
        }
        button.addEventListener("click", function () {
            dialoger.compile(rem.state.editorState.getCurrentContent().getPlainText('\u0001'))
            updateIt();
        });

    }

    _handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _mapKeyToEditorCommand(e) {
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(
                e,
                this.state.editorState,
                4, /* maxDepth */
            );
            if (newEditorState !== this.state.editorState) {
                this.onChange(newEditorState);
            }
            return;
        }
        return getDefaultKeyBinding(e);
    }

    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    render() {
        const {editorState} = this.state;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        return (
            <div className="RichEditor-root">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <div className={className} onClick={this.focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={this.mapKeyToEditorCommand}
                        onChange={this.onChange}
                        placeholder="Tell a story..."
                        ref="editor"
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }
}

// Custom overrides for "code" style.
const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};

function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote':
            return 'RichEditor-blockquote';
        default:
            return null;
    }
}

class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }

    render() {
        let className = 'RichEditor-styleButton';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

        return (
            <span className={className} onMouseDown={this.onToggle}>
              {this.props.label}
            </span>
        );
    }
}

const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'},
    {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

var INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();

    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};
const sampleDialog = `
\t//What you see now is an example dialog!

(

\t:"Good day, sir actor!"
\t\\"Where am I?"/
\t(
\t\t:"I would say that you are in the theatre. You won't hear more from me."
\t\t\\"..."/
\t\t(
\t\t\t:load.0
\t\t)
\t)
\t\\"Where am I?"/
\t(
\t\t:"I already said that you, mister actor, are an actor. Why would you want to know more?"
\t\t\\"..."/
\t\t(
\t\t\t:load.0
\t\t)
\t)
\t\\"Who are you?"/
\t(
\t\t:"Wow, that's an interesting question... I'm the owner of this theatre. My name will be a mystery for now."
\t\t\\"..."/
\t\t(
\t\t\t:load.0
\t\t)
\t)
\t\\"Where is the exit here?"/
\t(
\t\t:"There, first turn left."
\t\t\\"Thanks, now I will go"/
\t\t(
\t\t\t:exit
\t\t)
\t\t\\"Alright, I'll remember that. You can continue now"/
\t\t(
\t\t\t:load.0
\t\t)
\t)
\t:save.1.0
\t\\"..."/
\t(
\t\t:"Who do you want to play? I see real talent in you."
\t\t:var."jobs".=.0
\t\t:hasTag."nonAustro"
\t\t(
\t\t\t:var."jobs".+=.1
\t\t)
\t\t:else
\t\t(
\t\t\\"I wouldn't mind being an astronaut"/
\t\t(
\t\t\t:"I'm sorry but that role is already taken."
\t\t\t\\"..."/
\t\t\t(
\t\t\t\t:addTag."nonAustro"
\t\t\t\t:up.3
\t\t\t)
\t\t)
\t\t)
\t\t
\t\t:hasTag."nonDragon"
\t\t(
\t\t\t:var."jobs".+=.1
\t\t)
\t\t:else
\t\t(
\t\t\\"Fantasy dragon please!"/
\t\t(
\t\t\t:"I'm sorry but that role is already taken."
\t\t\t\\"..."/
\t\t\t(
\t\t\t\t:addTag."nonDragon"
\t\t\t\t:up.3
\t\t\t)
\t\t)
\t\t)
\t\t:hasTag."nonDetective"
\t\t(
\t\t\t:var."jobs".+=.1
\t\t)
\t\t:else
\t\t(
\t\t\\"I would like to play detective!"/
\t\t(
\t\t\t:"I'm sorry but that role is already taken."
\t\t\t\\"..."/
\t\t\t(
\t\t\t\t:addTag."nonDetective"
\t\t\t\t:up.3
\t\t\t)
\t\t)
\t\t)
\t\t:var."jobs".==.3
\t\t(
\t\t\t\\"WHO CAN I EVEN PLAY!?"/
\t\t\t(
\t\t\t\t:"Hmmm... Let me check..."
\t\t\t\t\t\\"..."/
\t\t\t\t\t(
\t\t\t\t\t\t:"Yes, I'm very sorry... Apparently, only one role is vacant..."
\t\t\t\t\t\t\\"Which one???"/
\t\t\t\t\t\t(
\t\t\t\t\t\t\t:load.0
\t\t\t\t\t\t)
\t\t\t\t\t\t\\"Tell me!"/
\t\t\t\t\t\t(
\t\t\t\t\t\t\t:load.0
\t\t\t\t\t\t)
\t\t\t\t\t\t:save.1.0
\t\t\t\t\t\t\\"Speak!!!"/
\t\t\t\t\t\t(
\t\t\t\t\t\t\t:"Yes... A simple man."
\t\t\t\t\t\t\t\t\\"Huh?"/
\t\t\t\t\t\t\t\t(
\t\t\t//The game start here...

:"You wake up in your bed and stare into the rotten ceiling."
\\I want to sleep just a little bit more.../
(
\t:"Unfortunately, you still have to wake up."
\t\\What a shame.../
\t(
\t\t:up.2
\t)
)
\\"What time is it?"/
(
\t:" - you ask... You can't really hear an answer though."
\t\\I will tell them.../
\t(
\t\t:up.2
\t)
)
\\Time to rise from the bed.../
(
\t:exit
)
\t\t\t//The game ends here...
\t\t\t\t\t\t\t\t)
\t\t\t\t\t\t)
\t\t\t\t\t)
\t\t\t)
\t\t)
\t)
)`
export default DraftTextEditor;
