'use client';

import Settings from '@/app/settings';
import { safeApiFetcher } from '@/client-api/common-utils';
import { usePopup } from '@/component/popup-provider';
import { enqueueApiErrorSnackbar } from '@/component/snackbar-utils';
import { chooseTauntMessage } from '@/component/taunt-message';
import { handleEndLetters, HebrewLetter, hebrewLetterNormalizer, isHebrewLetter, wordleGuessToString } from '@/component/utils';
import { isGameOver, LetterBoxAnimationState, LetterGuessState, WordleGuess, WordleGuessLetter } from '@/shared-api/common';
import Api from '@/shared-api/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
        if (Settings.FREE_PLAY)
        {
            if (!window.localStorage.getItem('wordIndex'))
            {
                window.localStorage.setItem('wordIndex', '0');
            }
        }

        safeApiFetcher(`/api/word${Settings.FREE_PLAY ? `?i=${window.localStorage.getItem('wordIndex')}` : ''}`)
            .then(setWord)
            .catch(console.error);
    }, [ setWord ]);

    const invalidWordEnteredCallback = useCallback((word: string) =>
    {
        if (typeof window === 'undefined') { return; }
        showPopup(`המילה '${handleEndLetters(word)}' אינה מוכרת.`);
    }, [ showPopup ]);

    const endGame = useCallback((didWin: boolean) =>
    {
        if (typeof window === 'undefined') { return; }

        if (Settings.FREE_PLAY)
        {
            window.localStorage.setItem('wordIndex', (parseInt(window.localStorage.getItem('wordIndex') ?? '0') + 1).toString(10));
        }
        window.localStorage.setItem('wins', (parseInt(window.localStorage.getItem('wins') ?? '0') + (didWin ? 1 : 0)).toString(10));

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
                if (word)
                {

                    showPopup(
                        `המילה היא "${word}"`
                    );
                } else
                {
                    showPopup(`לא נורא, אולי מחר :)`);
                }
            }, 800);
        }

        setGameOver(true);
    }, [ word, setGameOver, showPopup, currentGuessIndex ]);

    const commitGuess = useCallback((guess: WordleGuess) =>
    {
        if (guess.length < Settings.WORD_LENGTH) { return; }
        if (guess.length > Settings.WORD_LENGTH) { setLiveGuess([]); return; }


        safeApiFetcher(`/api/guess`, {
            method: 'POST',
            body: JSON.stringify(
                Settings.FREE_PLAY ? { guess: wordleGuessToString(guess), word } : wordleGuessToString(guess)
            )
        })
            .then((data: Api.Response.Guess) =>
            {
                if (data.wordInvalid) { return invalidWordEnteredCallback(wordleGuessToString(guess)); }
                setGuesses(data.guesses);
                setLiveGuess([]);

                if (isGameOver(data))
                {
                    endGame(data.exactMatch);
                }

                data.guesses.map((g) =>
                {
                    g.map((e) =>
                    {
                        if (e.state === LetterGuessState.NotInWord)
                        {
                            setLettersBurned(v => [ ...v, e.letter ]);
                        }
                    });
                });

                setCurrentGuessIndex(data.guesses.length);
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(`הפעולה נכשלה`, error);
            });
    }, [ word, invalidWordEnteredCallback, endGame ]);

    const appendLetterToGuess = useCallback((letter: string) =>
    {
        const newGuessLetter: WordleGuessLetter = { letter: letter as HebrewLetter, state: LetterGuessState.Undefined, boxAnimation: LetterBoxAnimationState.Pop, };
        setLiveGuess(oldGuess => (oldGuess.length < Settings.WORD_LENGTH) ? [ ...oldGuess, newGuessLetter ] : oldGuess);
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
            appendLetterToGuess(hebrewLetterNormalizer(event.key as HebrewLetter));
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

    // useEffect(() =>
    // {
    //     if (!isAllowedAnotherGame())
    //     {
    //         setGameOver(true);
    //         showPopup(`כבר שחקת היום.`);
    //     }
    // }, [ setGameOver, showPopup ]);

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
