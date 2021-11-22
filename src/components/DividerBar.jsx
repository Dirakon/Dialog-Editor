import React from "react";
const DividerBar = React.memo(function(props) {
    let movingAllowed = false;
    function move(event) {
        if (movingAllowed) {
            props.onDividerMoved.Start(event.clientX - 32)
        }
    }
    function changeMouseStatus() {
        movingAllowed = !movingAllowed;
        props.onProhibitSelectionStateChanged.Start()
    }
    document.addEventListener("mousemove", move, false)
    return <div onMouseDown={changeMouseStatus} onMouseUp={changeMouseStatus} className={'dividerBar'} />
})

export default DividerBar