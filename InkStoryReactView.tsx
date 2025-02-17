import * as React from "react";
import {StrictMode, useState, useEffect, useRef} from "react";
import {createRoot} from "react-dom/client"

import { Story, Compiler } from 'inkjs/types';
import { assert } from "console";
export function loadStory(raw_ink_story: string): Story | undefined {
    console.log("Loading story")
	if (raw_ink_story){
		try {
			const ink_story: Story = new Compiler(raw_ink_story).Compile()
			return ink_story

		} catch (e){
			console.log(`Failed to parse Story from ${raw_ink_story}`)
		}
	}
}


export function displayStory(story_string: string, element: HTMLElement, getSectionInfo: () => MarkdownSectionInformation, settings: any, component: MarkdownRenderChild):void {
	const story_view = createRoot(element);
	story_view.render(
		<StrictMode>
            <InkStoryReactCodeView ink_story_string={story_string} />
		</StrictMode>
	);
// Create HTML choices from ink choices
    /* ink_story.currentChoices.forEach(function(choice) {
	   const choice_text = choice.text;


     * }); */


    element.addClass("ink-top-container");





}

interface InkStoryReactCodeViewProps{
    ink_story_string: string
}
interface InkStoryReactCodeViewSubProps{
    inkLevels: InkLevelDatum[],
    inkActiveLevel: InkActiveLevel,
	handleChoiceClick: (choice: number) => void
}


type InkTextDatum = {
    text: string,
    tags: string[],
}

type InkChoiceDatum = {
    choice: string,
    tags: string[],
}

type InkLevelDatum ={
    index: number,
    texts: InkTextDatum[],
}
type InkActiveLevel = InkLevel & {
    choices:  InkChoiceDatum[]
}

export function InkStoryReactCodeView({ink_story_string}: InkStoryReactCodeViewProps){
    const [inkLevels, setInkLevels] = useState<InkLevelDatum[]>([])
    const [inkActiveLevel, setInkActiveLevel] = useState<InkActiveLevel|undefined>(undefined)
    const ink_story_ref = useRef(null);
    if (ink_story_ref.current===null){
        ink_story_ref.current = loadStory(raw_ink_story=ink_story_string);
    }
    const updateStory = () => {
        const ink_story = ink_story_ref.current;
		assert( ink_story !== null);

        console.log("story", ink_story);
        if (typeof inkActiveLevel !== 'undefined'){
            if ( inkActiveLevel.index === ink_story.state.currentTurnIndex) {
				console.log("Already updated");
                return;
            }
            delete inkActiveLevel.choices;
            setInkLevels(prevLevels=>[...prevLevels, inkActiveLevel])
        }
        const textData = []
        if (ink_story.canContinue){
            console.log("Did continue");
            while (ink_story.canContinue) {
                // Get ink to generate the next paragraph
                const paragraphText = ink_story.Continue();
                const tags = ink_story.state.currentTags;
                const textDatum: InkTextDatum = {text: paragraphText, tags: tags}
                textData.push(textDatum);
            }
            console.log("tdd2", textData)
            let newChoices = []
            if (ink_story.currentChoices){
                newChoices = ink_story.currentChoices;
            }
            const newActiveLevel: InkActiveLevel = {texts: textData, choices: newChoices, index: ink_story.state.currentTurnIndex};
            console.log("new active level", newActiveLevel);
            setInkActiveLevel(()=>newActiveLevel);
        }else{
            console.log("CAn't continue")
        }
    };
    useEffect(() => {
		updateStory();
    }, [ink_story_string]);
    const handleChoiceClick = (choice_index: number) => {
        ink_story_ref.current.ChooseChoiceIndex(choice_index);
        updateStory();
        console.log(`clicked ${choice_index}`);
    };

	return  <InkStoryReactCodeSubView inkLevels={inkLevels} inkActiveLevel={inkActiveLevel} handleChoiceClick={handleChoiceClick}/>
}

export function InkStoryReactCodeSubView({inkLevels, inkActiveLevel, handleChoiceClick}: InkStoryReactCodeViewSubProps){
    console.log("ils", inkLevels);
    console.log("ials", inkActiveLevel);
	return (
		<div>
            {inkLevels.map((inkLevel, index)=> {return <InkLevelView datum={inkLevel} />})}
            {inkActiveLevel  && <InkActiveLevelView datum={inkActiveLevel} handleChoiceClick={handleChoiceClick}/> }
		</div>
	);
}
export function InkLevelView({datum}: {datum: InkLevelDatum}){
    return (
        <div >
            {datum.texts.map((item, index)=>{return <InkTextView text_string={item.text} key_postfix={index}/>})}
            <hr/>
        </div>
    )
}

export function InkActiveLevelView({datum, handleChoiceClick}: {datum: InkActiveLevel, handleChoiceClick: (any)=>void}){
    return (
        <div>
            {datum.texts.map((item, index)=>{return <InkTextView text_string={item.text} key_postfix={index}/>})}
            <div
                style={{
                            display: 'flex',
                            flexDirection:'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',

                        }}
            >
            {datum.choices.map((item, index)=>{return <InkChoiceView choice={item} key_postfix={index} handleChoiceClick={handleChoiceClick}/>})}
            </div>
        </div>
    )

    return <div key={`ink_active_level_${datum.index}`}>active_level</div>
}

export function InkTextView({text_string, key_postfix}: {text_string: string, key_postfix: number}){
    return <p key={`text_{key_postfix}`}> {text_string}</p>
}

export function InkChoiceView({choice, key_postfix, handleChoiceClick}: {choice: any, key_postfix: number, handleChoiceClick: (any)=>void}){
    return <button key={`choice_{key_postfix}`} onClick={()=>handleChoiceClick(choice.index)}
                    style={{
                            background: 'none',
                            color: 'inherit',
                            border: 'none',
                            padding: 10,
                            font: 'inherit',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
           >
        {choice.text}
    </button>
}

export const ReactView = () => {
  return <h4>Hello, React!</h4>;
};
