'use client';

import { possibleWordsRemaining } from "@/bot/common";
import { calculateExpectedEntropy } from "@/bot/entropy";
import { stringToNormalizedArray } from "@/component/utils";
import { useWordle } from "@/component/wordle-provider";
import { Typography } from "@mui/material";
import { useMemo, useState } from "react";

export default function BotPanel()
{
    return (<div></div>);
    const { guesses } = useWordle();
    const [ words, setWords ] = useState<Array<{ word: string, entropy: number; }>>([]);

    useMemo(() =>
    {
        const wordsRemaining = possibleWordsRemaining(guesses);
        console.debug(`There are ${wordsRemaining.length} words still viable.`);

        console.time('calculateExpectedEntropy');
        const calculatedWords = wordsRemaining.map((word) =>
        {
            return {
                word, entropy: calculateExpectedEntropy(stringToNormalizedArray(word), wordsRemaining)
            };
        });
        console.timeEnd('calculateExpectedEntropy');
        calculatedWords.sort((a, b) => a.entropy - b.entropy).reverse();

        setWords(calculatedWords);
    }, [ guesses ]);

    const wordTiles = words.slice(0, 100).map((wordData, index) => <li key={ `${index}-${wordData.word}` }><Typography>{ wordData.word } : { wordData.entropy }</Typography></li>);

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