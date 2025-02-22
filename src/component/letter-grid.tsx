'use client';
import '@/style/grid.css';
import assert from "assert";
import { useLayoutEffect, useRef } from 'react';
import { handleEndLetters } from '@/component/utils';
import { WordleGuessLetter, LetterBoxAnimationState, WordleGuess, LetterGuessState } from '@/app/api/common';
import { useWordle } from '@/component/wordle-provider';

function LetterBox({ letter, isLastLetter, index }: { letter: WordleGuessLetter, isLastLetter: boolean, index: number; })
{
    const myBox = useRef<HTMLDivElement>(null);
    const LETTER_INDEX_DELAY = 300;

    useLayoutEffect(() =>
    {
        if (typeof window === 'undefined') { return; }
        if (!myBox.current) { return; }
        if (letter.boxAnimation !== LetterBoxAnimationState.FlipIn)
        {
            myBox.current.setAttribute('data-letter-state', letter.state);
            return;
        }

        setTimeout(() =>
        {
            if (!myBox.current) { return; }
            myBox.current.setAttribute('data-letter-state', letter.state);
        }, (index * LETTER_INDEX_DELAY) + 600);
    }, [ letter, index ]);

    return (
        <div
            ref={ myBox }
            className="letter-box"
            data-letter-state='idle'
            data-animation={ letter.boxAnimation }
            style={ { animationDelay: `${(letter.boxAnimation === LetterBoxAnimationState.FlipIn) ? index * LETTER_INDEX_DELAY : 0}ms` } }
        >
            <div>
                { isLastLetter ? handleEndLetters(letter.letter) : letter.letter }
            </div>
        </div>
    );
}

function padGuess(guess: WordleGuess | undefined): WordleGuess
{
    if (typeof guess === 'undefined') { guess = []; }
    while (guess.length < 5)
    {
        guess = [ ...guess, { letter: '', state: LetterGuessState.Undefined, boxAnimation: LetterBoxAnimationState.Idle, } ];
    }
    return guess;
}

function LetterRow({ index, guess }: { index: number, guess: WordleGuess | undefined; })
{
    assert(!guess || guess.length <= 5, `WordleGuess has an invalid value ${guess}`);

    const normalizedGuess = padGuess(guess);
    const letters = normalizedGuess.map((letter, letterIndex) => <LetterBox
        key={ `letter-${index}-${letterIndex}` }
        letter={ letter }
        index={ letterIndex }
        isLastLetter={ letterIndex === 4 }
    />);

    return (
        <div className="letter-row flex flex-row">
            { letters }
        </div>
    );
}

export default function LetterGrid()
{
    const { guesses, liveGuess, currentGuessIndex } = useWordle();

    assert(!guesses[ currentGuessIndex ] || guesses[ currentGuessIndex ].length === 0);

    const letterRows = [ 0, 1, 2, 3, 4, 5 ].map((index) => <LetterRow key={ `letter-row-${index}` } index={ index } guess={ (currentGuessIndex === index) ? liveGuess : guesses[ index ] } />);
    return (
        <div className="letter-grid flex flex-col">
            { letterRows }
        </div>
    );
}