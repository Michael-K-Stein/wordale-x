'use client';

import { commitGamePlayed, isAllowedAnotherGame } from '@/component/enforcer';
import { usePopup } from '@/component/popup-provider';
import { chooseTauntMessage } from '@/component/taunt-message';
import { handleEndLetters, hebrewLetterNormalizer, isHebrewLetter, isValidHebrewWord, wordleGuessToString } from '@/component/utils';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export enum LetterGuessState
{
    Undefined = 'undefined',
    NotInWord = 'not-in-word', // Gray
    WrongPlace = 'wrong-place', // Yellow
    CorrectPlace = 'correct-place', // Green
};
export enum LetterBoxAnimationState
{
    Undefined = 'undefined',
    Idle = 'idle',
    Pop = 'pop',
    FlipIn = 'flip-in',
};
export type WordleGuessLetter = { letter: string, state: LetterGuessState, boxAnimation: LetterBoxAnimationState; };
export type WordleGuess = Array<WordleGuessLetter>;
export type WordleContext = {
    default: boolean;
    word: string;
    guesses: Array<WordleGuess>;
    gameOver: boolean;
    enterGuessClickCallback: () => void;
    liveGuess: WordleGuess;
    appendLetterToGuess: (x: string) => void;
    removeLetterFromGuess: () => void;
    currentGuessIndex: number;
    lettersBurned: Array<string>;
};


const WordleContextProvider = createContext<WordleContext>({
    default: true,
    word: '',
    guesses: [],
    gameOver: false,
    enterGuessClickCallback: () => { },
    liveGuess: [],
    appendLetterToGuess: () => { },
    removeLetterFromGuess: () => { },
    currentGuessIndex: 0,
    lettersBurned: [],
});

export const WordleProvider = ({ children }: { children: React.ReactNode; }) =>
{
    const [ word, setWord ] = useState<string>('');
    const [ guesses, setGuesses ] = useState<Array<WordleGuess>>([]);
    const [ liveGuess, setLiveGuess ] = useState<WordleGuess>([]);
    const [ currentGuessIndex, setCurrentGuessIndex ] = useState<number>(0);
    const [ gameOver, setGameOver ] = useState(false);
    const [ lettersBurned, setLettersBurned ] = useState<Array<string>>([]);

    const { showPopup } = usePopup();

    useMemo(() =>
    {
        if (typeof window === 'undefined') { return; }
        if (!window.localStorage.getItem('wordIndex'))
        {
            window.localStorage.setItem('wordIndex', '0');
        }

        fetch(`/api/word`)
            .then((res) => res.json())
            .then(setWord)
            .catch(console.log);
    }, [ setWord ]);

    const invalidWordEnteredCallback = useCallback((word: string) =>
    {
        if (typeof window === 'undefined') { return; }
        showPopup(`המילה '${handleEndLetters(word)}' אינה מוכרת.`);
    }, [ showPopup ]);

    const endGame = useCallback((didWin: boolean) =>
    {
        if (typeof window === 'undefined') { return; }

        window.localStorage.setItem('wordIndex', (parseInt(window.localStorage.getItem('wordIndex') ?? '0') + 1).toString(10));
        window.localStorage.setItem('wins', (parseInt(window.localStorage.getItem('wins') ?? '0') + (didWin ? 1 : 0)).toString(10));

        commitGamePlayed();

        if (didWin)
        {
            showPopup(
                <div className='flex flex-col items-center justify-center content-center'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                        width="4rem"
                        height="4rem"
                    >
                        <path
                            fill="none"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            d="M11 19v9l5-2 5 2v-9M16 9a4 4 0 1 0 0 8 4 4 0 1 0 0-8z"
                        ></path>
                        <path
                            fill="none"
                            stroke="#FFF"
                            strokeLinecap="round"
                            strokeWidth="1.5"
                            d="m17.989 5.768 2.563-.533.786 2.497 2.486.82-.567 2.555L25 13.059l-1.768 1.93.533 2.563-2.497.786-.82 2.486-2.555-.567L15.941 22l-1.93-1.768-2.563.533-.786-2.497-2.486-.82.567-2.555L7 12.941l1.768-1.93-.533-2.563 2.497-.786.82-2.486 2.555.567L16.059 4z"
                        ></path>
                    </svg>
                    { chooseTauntMessage(currentGuessIndex) }
                </div>
            );
        }
        else
        {
            setTimeout(() =>
            {
                showPopup(
                    `המילה היא "${word}"`
                );
            }, 800);
        }

        setGameOver(true);
    }, [ word, setGameOver, showPopup, currentGuessIndex ]);

    const checkGuessLetterState = useCallback((guessLetterValue: string, index: number): LetterGuessState =>
    {
        if (hebrewLetterNormalizer(guessLetterValue) === hebrewLetterNormalizer(word[ index ])) { return LetterGuessState.CorrectPlace; }
        if (word.includes(hebrewLetterNormalizer(guessLetterValue))) { return LetterGuessState.WrongPlace; }
        setLettersBurned(v => [ ...v, guessLetterValue ]);
        return LetterGuessState.NotInWord;
    }, [ word, setLettersBurned ]);

    const isGuessExact = useCallback((guess: WordleGuess): boolean =>
    {
        const guessIsExact = guess.reduce(
            (correctSoFar, currentLetter, letterIndex) =>
            {
                return correctSoFar && hebrewLetterNormalizer(currentLetter.letter) === hebrewLetterNormalizer(word[ letterIndex ]);
            }, true);

        return guessIsExact;
    }, [ word ]);

    const processGuess = useCallback((guess: WordleGuess): WordleGuess =>
    {
        return guess.map((currentGuessLetter, index): WordleGuessLetter =>
        {
            return {
                letter: hebrewLetterNormalizer(currentGuessLetter.letter),
                state: checkGuessLetterState(hebrewLetterNormalizer(currentGuessLetter.letter), index),
                boxAnimation: LetterBoxAnimationState.FlipIn,
            };
        });
    }, [ checkGuessLetterState ]);

    const commitGuess = useCallback((guess: WordleGuess) =>
    {
        if (guess.length < 5) { return; }
        if (guess.length > 5) { setLiveGuess([]); return; }
        if (!isValidHebrewWord(guess)) { return invalidWordEnteredCallback(wordleGuessToString(guess)); }
        if (guesses.length < 6 && !gameOver)
        {
            setGuesses([ ...guesses, processGuess(guess) ]);
            setLiveGuess([]);

            if (isGuessExact(guess))
            {
                endGame(true);
            }
            else if (guesses.length === 5)
            {
                endGame(false);
            }
            setCurrentGuessIndex(v => v + 1);
        }
    }, [
        gameOver,
        guesses,
        processGuess,
        endGame,
        setGuesses,
        invalidWordEnteredCallback,
        isGuessExact
    ]);

    const appendLetterToGuess = useCallback((letter: string) =>
    {
        const newGuessLetter: WordleGuessLetter = { letter, state: LetterGuessState.Undefined, boxAnimation: LetterBoxAnimationState.Pop, };
        setLiveGuess(oldGuess => (oldGuess.length < 5) ? [ ...oldGuess, newGuessLetter ] : oldGuess);
    }, [ setLiveGuess ]);

    const removeLetterFromGuess = useCallback(() =>
    {
        setLiveGuess(oldGuess => oldGuess.slice(0, oldGuess.length - 1));
    }, [ setLiveGuess ]);

    const enterGuessClickCallback = useCallback(() =>
    {
        if (typeof window === 'undefined') { return; }
        commitGuess(liveGuess);
    }, [ liveGuess, commitGuess ]);

    const keyDownCallback = useCallback((event: KeyboardEvent) =>
    {
        if (isHebrewLetter(event.key))
        {
            appendLetterToGuess(hebrewLetterNormalizer(event.key));
        }
        else if (event.key === 'Enter')
        {
            enterGuessClickCallback();
        }
        else if (event.key === 'Backspace')
        {
            removeLetterFromGuess();
        }
    }, [ appendLetterToGuess, enterGuessClickCallback, removeLetterFromGuess ]);

    useEffect(() =>
    {
        document.addEventListener('keydown', keyDownCallback);

        return () =>
        {
            document.removeEventListener('keydown', keyDownCallback);
        };
    }, [ keyDownCallback ]);

    useEffect(() =>
    {
        if (!isAllowedAnotherGame())
        {
            setGameOver(true);
            showPopup(`כבר שחקת היום.`);
        }
    }, [ setGameOver, showPopup ]);

    return (
        <WordleContextProvider.Provider value={ {
            default: false,
            word,
            guesses,
            gameOver,
            enterGuessClickCallback,
            liveGuess,
            appendLetterToGuess,
            removeLetterFromGuess,
            currentGuessIndex,
            lettersBurned,
        } } >
            { children }
        </WordleContextProvider.Provider>
    );
};

export const useWordle = () => useContext(WordleContextProvider);
