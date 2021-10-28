import React, {useEffect} from 'react';
import DraftTextEditor from './components/DraftTextEditor'
import MyEditor from './components/MyEditor';


function App() {
    useEffect(() => {
        document.title = "Dialog Editor"
    }, []);
    return (
        <div className="App" style={{height : '100%'}}>
            <div style ={{height:'100%'}}>
                <div className={'flexer'}>
                    <MyEditor defaultDialog = {sampleDialog}/>
                    <div className={'dividerBar'}>
                    </div>
                    <div className={ 'dialogSide'}>
                        <div className={'actualDialog'}>
                        Dialog will be visible here!
                        </div>
                    </div>
                </div>

                <button className={'compileButton'}> Compile!</button>
            </div>
        </div>


    );
}

export default App;



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
\t\\"Who am I?"/
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
