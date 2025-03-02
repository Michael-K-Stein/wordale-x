'use client';

import { possibleWordsRemaining } from "@/bot/common";
import { useWordle } from "@/component/wordle-provider";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function BotPanel()
{
    // return (<div></div>);
    const { guesses } = useWordle();
    const [ words, setWords ] = useState<Array<string>>([]);

    useEffect(() =>
    {
        possibleWordsRemaining(guesses).then(setWords);
    }, [ guesses ]);

    const wordTiles = words.slice(0, 100).map((word, index) => <li key={ `${index}-${word}` }><Typography>{ word }</Typography></li>);

    return (

        <div className="absolute w-full flex flex-col items-end content-end justify-end p-4 top-0 right-0 h-full rtl">
            <div className="flex flex-col items-start  h-full rtl" >
                <Typography variant="h3" fontWeight={ 600 }>אפשרויות</Typography>
                <div className="overflow-y-scroll max-h-full rtl w-full">
                    <div className="relative flex flex-row items-start justify-start top-0 h-full rtl">
                        <ul className="rtl max-h-full px-2">
                            { wordTiles }
                            { (words.length > 100) && <li><Typography>...</Typography></li> }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}