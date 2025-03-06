import { HebrewLetter, hebrewLetterNormalizer, HebrewNormalLetter, stringToArray, stringToNormalizedArray } from "@/component/utils";
import { LetterGuessState, WordleGuess, WordleGuessLetter } from "@/shared-api/common";
import HEBREW_WORDS from "@/shared-api/hebrew-words";
import WORDLIST from "@/shared-api/wordlist";
import assert from "assert";

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

export function filterRemainingWords(guesses: Array<WordleGuess>, wordlist: Array<string>)
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

export function possibleWordsRemaining(guesses: Array<WordleGuess>)
{
    // const a = await calculateExpectedEntropy(guesses[ 0 ]);
    return filterRemainingWords(guesses, WORDLIST);
}
