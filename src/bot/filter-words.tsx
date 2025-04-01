import { HebrewLetter, hebrewLetterNormalizer, HebrewNormalLetter, stringToArray, stringToNormalizedArray } from "@/component/utils";
import { WordleGuess, LetterGuessState, WordleGuessLetter } from "@/shared-api/common";
import assert from "assert";

// Memoize letter counts to avoid redundant calculation for each guess
const memoizedLetterCounts: Record<string, Record<HebrewLetter, number>> = {};


function countInString(text: string, searchString: string)
{
    return stringToArray(text).reduce((p, x) => p + (hebrewLetterNormalizer(x as HebrewLetter) === hebrewLetterNormalizer(searchString as HebrewLetter) ? 1 : 0), 0);
}

function wordIsPossible(
    { indexKnownLetters, knownLettersInWrongPlace: knownLettersInWord, knownLettersNotInWord, indexKnownNotLetters, letterCounts }
        : {
            indexKnownLetters: Array<HebrewNormalLetter | 'X'>;
            knownLettersInWrongPlace: Array<HebrewNormalLetter>;
            knownLettersNotInWord: Array<HebrewNormalLetter>;
            indexKnownNotLetters: Array<Array<HebrewNormalLetter>>;
            letterCounts: Partial<Record<HebrewNormalLetter, number>>;
        }
): (word: string) => boolean
{
    const hasKnownIndexLetters = indexKnownLetters.filter((x) => x !== 'X').length > 0;

    const DEBUG = false;

    return (word: string): boolean =>
    {
        const normalizedWord = stringToNormalizedArray(word).join('');

        if (hasKnownIndexLetters)
        {
            for (let i = 0; i < indexKnownLetters.length; ++i)
            {
                if (indexKnownLetters.at(i) === 'X') { continue; }
                if (indexKnownLetters.at(i) !== normalizedWord.at(i))
                {
                    if (DEBUG) { console.log(word, 'Known index!'); }
                    return false;
                }
            }
        }

        if (knownLettersInWord.reduce((wordCanceled, currentLetter) =>
        {
            return wordCanceled || !normalizedWord.includes(hebrewLetterNormalizer(currentLetter));
        }, false))
        {
            if (DEBUG) { console.log(word, 'Known letters!'); }
            return false;
        }

        if (knownLettersNotInWord.reduce((wordCanceled, currentLetter) =>
        {
            return wordCanceled || normalizedWord.includes(hebrewLetterNormalizer(currentLetter));
        }, false))
        {
            if (DEBUG) { console.log(word, 'Known not letters!'); }
            return false;
        }

        if (indexKnownNotLetters.reduce((wordCanceled, currentLetters, currentIndex) =>
        {
            const wordLetter = normalizedWord.at(currentIndex);
            return wordCanceled || !wordLetter || currentLetters.includes(hebrewLetterNormalizer(wordLetter as HebrewLetter));
        }, false))
        {
            if (DEBUG) { console.log(word, 'indexKnownNotLetterss'); }
            return false;
        }

        for (const letter in letterCounts)
        {
            const neededCount = letterCounts[ letter as HebrewNormalLetter ] ?? 0;
            if (countInString(normalizedWord, letter) < neededCount)
            {
                if (DEBUG) { console.log(word, letter); }
                return false;
            }
        }


        return true;
    };
}


export function filterRemainingWordsV1(guesses: Array<WordleGuess>, wordlist: Array<string>)
{
    const indexKnownLetters: Array<HebrewNormalLetter | 'X'> = [
        'X', 'X', 'X', 'X', 'X', // Mark letters we do not know with an 'X'
    ];

    // An array of the letters we know for each place that are not there
    const indexKnownNotLetters: Array<Array<HebrewNormalLetter>> = [
        [], [], [], [], [],
    ];
    const knownLettersInWrongPlace: Array<HebrewNormalLetter> = [];
    const knownLettersNotInWordUnfiltered: Array<HebrewNormalLetter> = [];

    // Letters which appear more than once in the word
    const letterCounts: Partial<Record<HebrewNormalLetter, number>> = {};

    guesses.forEach((guess: WordleGuess) =>
    {
        const currentLetterHitCount: Partial<Record<HebrewNormalLetter, number>> = {};
        guess.forEach((guessLetter: WordleGuessLetter, index: number) =>
        {
            const normalizedLetter = hebrewLetterNormalizer(guessLetter.letter);
            switch (guessLetter.state)
            {
                case LetterGuessState.NotInWord:
                    knownLettersNotInWordUnfiltered.push(normalizedLetter);
                    indexKnownNotLetters[ index ].push(normalizedLetter);
                    break;
                case LetterGuessState.WrongPlace:
                    knownLettersInWrongPlace.push(normalizedLetter);
                    indexKnownNotLetters[ index ].push(normalizedLetter);
                    currentLetterHitCount[ normalizedLetter ] = (typeof currentLetterHitCount[ normalizedLetter ] === 'number') ? currentLetterHitCount[ normalizedLetter ] + 1 : 1;
                    break;
                case LetterGuessState.CorrectPlace:
                    indexKnownLetters[ index ] = normalizedLetter;
                    currentLetterHitCount[ normalizedLetter ] = (typeof currentLetterHitCount[ normalizedLetter ] === 'number') ? currentLetterHitCount[ normalizedLetter ] + 1 : 1;
                    break;
                case LetterGuessState.Undefined:
                    return;
            }
        });
        for (const v in currentLetterHitCount)
        {
            const oldLetterCounts = letterCounts[ v as HebrewNormalLetter ] ?? 0;
            const currentLetterCount = currentLetterHitCount[ v as HebrewNormalLetter ];
            assert(typeof currentLetterCount === 'number');
            if (oldLetterCounts < currentLetterCount)
            {
                letterCounts[ v as HebrewNormalLetter ] = currentLetterCount;
            }
        }
    });

    const knownLettersNotInWord = knownLettersNotInWordUnfiltered.filter((x) => !knownLettersInWrongPlace.includes(x) && !indexKnownLetters.includes(x));

    const remainingWords = wordlist.filter(wordIsPossible({
        indexKnownLetters, knownLettersInWrongPlace, knownLettersNotInWord, indexKnownNotLetters, letterCounts
    }));

    return [ ... new Set(remainingWords) ];
}
export function filterRemainingWordsV2(guesses: Array<WordleGuess>, wordlist: Array<string>)
{
    const indexKnownLetters: Array<HebrewNormalLetter | 'X'> = [ 'X', 'X', 'X', 'X', 'X' ]; // 'X' represents unknown letters
    const indexKnownNotLetters: Array<Set<HebrewNormalLetter>> = [ new Set(), new Set(), new Set(), new Set(), new Set() ]; // Set for quick lookups
    const knownLettersInWrongPlace: Set<HebrewNormalLetter> = new Set();
    const knownLettersNotInWord: Set<HebrewNormalLetter> = new Set();

    // Letter counts to track duplicate letters
    const letterCounts: Partial<Record<HebrewNormalLetter, number>> = {};

    guesses.forEach((guess: WordleGuess) =>
    {
        const currentLetterHitCount: Partial<Record<HebrewNormalLetter, number>> = {};

        guess.forEach((guessLetter: WordleGuessLetter, index: number) =>
        {
            const normalizedLetter = hebrewLetterNormalizer(guessLetter.letter);
            switch (guessLetter.state)
            {
                case LetterGuessState.NotInWord:
                    knownLettersNotInWord.add(normalizedLetter);
                    indexKnownNotLetters[ index ].add(normalizedLetter);
                    break;
                case LetterGuessState.WrongPlace:
                    knownLettersInWrongPlace.add(normalizedLetter);
                    indexKnownNotLetters[ index ].add(normalizedLetter);
                    currentLetterHitCount[ normalizedLetter ] = (currentLetterHitCount[ normalizedLetter ] || 0) + 1;
                    break;
                case LetterGuessState.CorrectPlace:
                    indexKnownLetters[ index ] = normalizedLetter;
                    currentLetterHitCount[ normalizedLetter ] = (currentLetterHitCount[ normalizedLetter ] || 0) + 1;
                    break;
                case LetterGuessState.Undefined:
                    break;
            }
        });

        // Update global letter counts with current guess data
        Object.entries(currentLetterHitCount).forEach(([ letter, count ]) =>
        {
            letterCounts[ letter as HebrewNormalLetter ] = Math.max(letterCounts[ letter as HebrewNormalLetter ] || 0, count);
        });
    });

    // Remove wrong place letters from 'NotInWord' list and filter duplicates
    knownLettersNotInWord.forEach(letter =>
    {
        if (knownLettersInWrongPlace.has(letter) || indexKnownLetters.includes(letter))
        {
            knownLettersNotInWord.delete(letter);
        }
    });

    // Filter wordlist based on the possible valid words
    const remainingWords = wordlist.filter(wordIsPossible({
        indexKnownLetters,
        knownLettersInWrongPlace: Array.from(knownLettersInWrongPlace),
        knownLettersNotInWord: Array.from(knownLettersNotInWord),
        indexKnownNotLetters: indexKnownNotLetters.map(set => Array.from(set)),
        letterCounts,
    }));

    // Return unique remaining words
    return [ ...new Set(remainingWords) ];
}


// A function to filter the wordlist based on the guesses, considering multiple occurrences of letters
export function filterRemainingWordsV3(guesses: Array<WordleGuess>, wordlist: Array<string>)
{
    return [ ... new Set(wordlist.filter(word =>
    {
        const staticWordLetterCounts = getLetterCounts(word);
        return guesses.every(guess =>
        {
            const wordLetterCounts = { ...staticWordLetterCounts };
            // Create an array to track the count of each letter in the word
            const guessLetterCounts: Partial<Record<HebrewLetter, number>> = {};

            return guess.every((guessLetter, index) =>
            {
                const letter = guessLetter.letter;
                const state = guessLetter.state;

                // Update guess letter count
                guessLetterCounts[ letter ] = (guessLetterCounts[ letter ] || 0) + 1;

                switch (state)
                {
                    case LetterGuessState.CorrectPlace:
                        // The letter must match the exact position and count in the word
                        if (word[ index ] !== letter)
                        {
                            return false;
                        }
                        wordLetterCounts[ letter ]--; // Reduce the count for that letter
                        return true;

                    case LetterGuessState.WrongPlace:
                        // Letter must be in the word, but not in the current position
                        if (!word.includes(letter) || word[ index ] === letter)
                        {
                            return false;
                        }
                        // Ensure that there are enough instances of the letter in the word
                        if (wordLetterCounts[ letter ] <= 0)
                        {
                            return false;
                        }
                        wordLetterCounts[ letter ]--; // Reduce the count for that letter
                        return true;

                    case LetterGuessState.NotInWord:
                        // Letter must not be in the word at all
                        if (wordLetterCounts[ letter ] > 0)
                        {
                            return false;
                        }
                        return true;

                    case LetterGuessState.Undefined:
                        assert(false, 'Guess state may not be undefined!');

                    default:
                        return true;
                }
            });
        });
    })) ];
}

// Helper function to count the occurrences of each letter in a word
function getLetterCounts(word: string)
{
    if (memoizedLetterCounts[ word ])
    {
        return memoizedLetterCounts[ word ]; // Return cached counts if already computed
    }

    const letterCounts: Record<HebrewLetter, number> = {
        "": 0,
        א: 0,
        ב: 0,
        ג: 0,
        ד: 0,
        ה: 0,
        ו: 0,
        ז: 0,
        ח: 0,
        ט: 0,
        י: 0,
        כ: 0,
        ל: 0,
        מ: 0,
        נ: 0,
        ס: 0,
        ע: 0,
        פ: 0,
        צ: 0,
        ק: 0,
        ר: 0,
        ש: 0,
        ת: 0,
        ן: 0,
        ץ: 0,
        ף: 0,
        ם: 0,
        ך: 0
    };
    for (let i = 0; i < word.length; i++)
    {
        const letter = word[ i ] as HebrewLetter;
        letterCounts[ letter ] = (letterCounts[ letter ] || 0) + 1;
    }
    return letterCounts;
}