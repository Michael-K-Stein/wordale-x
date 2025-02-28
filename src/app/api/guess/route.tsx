
import { ApiSuccess, catchHandler, getUserData, isAdmin, setUserData } from "@/app/api/common";
import { commitGamePlayed, isAllowedAnotherGame } from "@/app/api/enforcer";
import { getTodaysWord } from "@/app/api/word/route";
import Settings from "@/app/settings";
import { HebrewLetter, hebrewLetterNormalizer, HebrewNormalLetter, isValidHebrewWord, stringToNormalizedArray } from "@/component/utils";
import { LetterGuessState, WordleGuessLetter, LetterBoxAnimationState, WordleGuess, isGameOver } from "@/shared-api/common";
import { ClientApiError } from "@/shared-api/errors";
import Api from "@/shared-api/types";
import assert from "assert";
import { NextRequest } from "next/server";


function checkGuessLetterState(todaysWord: string, guessLetterValue: HebrewLetter, index: number): LetterGuessState 
{
    if (hebrewLetterNormalizer(guessLetterValue) === hebrewLetterNormalizer(todaysWord[ index ] as HebrewLetter)) { return LetterGuessState.CorrectPlace; }
    if (todaysWord.includes(hebrewLetterNormalizer(guessLetterValue))) { return LetterGuessState.WrongPlace; }
    return LetterGuessState.NotInWord;
};

function normalizeGuessForRepeatLetters(todaysWord: string, guess: WordleGuess)
{
    // Letters which appear more than once in the actual word need to be marked as either "CorrectPlace" or "WrongPlace" at the same count as they appear in the actual word.
    const todaysWordLetterCountMap: Partial<Record<HebrewNormalLetter, number>> = {};
    stringToNormalizedArray(todaysWord).forEach((l) =>
    {
        if (!todaysWordLetterCountMap[ l ]) { todaysWordLetterCountMap[ l ] = 0; }
        todaysWordLetterCountMap[ l ]++;
    });

    // First reduce for letters which are in the correct place
    guess.forEach((letter) =>
    {
        if (letter.state !== LetterGuessState.CorrectPlace) { return; }

        const remainingCount = todaysWordLetterCountMap[ letter.letter as HebrewNormalLetter ];
        if (typeof remainingCount !== 'number') { return; }

        if (remainingCount > 0)
        {
            todaysWordLetterCountMap[ letter.letter as HebrewNormalLetter ] = remainingCount - 1;
        }
        else
        {
            assert(false, 'More letters in correct place than places?!');
        }
    });

    guess.forEach((letter) =>
    {
        if (letter.state === LetterGuessState.CorrectPlace) { return; }

        const remainingCount = todaysWordLetterCountMap[ letter.letter as HebrewNormalLetter ];
        if (typeof remainingCount !== 'number') { return; }
        if (remainingCount > 0)
        {
            if (letter.state === LetterGuessState.NotInWord) { letter.state = LetterGuessState.WrongPlace; }
            todaysWordLetterCountMap[ letter.letter as HebrewNormalLetter ] = remainingCount - 1;
        }
        else
        {
            if (letter.state === LetterGuessState.WrongPlace) { letter.state = LetterGuessState.NotInWord; }
        }
    });

    return guess;
}

async function processGuess(todaysWord: string, guess: string)
{
    const guessedLetters = stringToWordleGuess(guess)
        .map(
            (currentGuessLetter, index): WordleGuessLetter =>
            {
                return {
                    letter: hebrewLetterNormalizer(currentGuessLetter.letter),
                    state: checkGuessLetterState(todaysWord, hebrewLetterNormalizer(currentGuessLetter.letter), index),
                    boxAnimation: LetterBoxAnimationState.FlipIn,
                };
            }
        );

    return normalizeGuessForRepeatLetters(todaysWord, guessedLetters);
}

function isGuessExact(todaysWord: string, guess: WordleGuess): boolean 
{
    const guessIsExact = guess.reduce(
        (correctSoFar, currentLetter, letterIndex) =>
        {
            return correctSoFar && hebrewLetterNormalizer(currentLetter.letter) === hebrewLetterNormalizer(todaysWord[ letterIndex ] as HebrewLetter);
        }, true);

    return guessIsExact;
};

function stringToWordleGuess(guess: string): Array<WordleGuessLetter>
{
    const result: Array<WordleGuessLetter> = [];
    for (let i = 0; i < guess.length; i++)
    {
        result.push(
            {
                letter: guess.charAt(i) as HebrewLetter,
                state: LetterGuessState.Undefined,
                boxAnimation: LetterBoxAnimationState.Pop,
            }
        );
    }
    return result;
}

export async function POST(
    request: NextRequest
)
{
    try
    {
        const userData = await getUserData();
        if (!isAdmin(request))
        {
            if (!(await isAllowedAnotherGame(userData))) { throw new ClientApiError(`כבר שחקת היום.`); }
        }

        const guess: string = await request.json();
        const todaysWord = await getTodaysWord();

        const response: Api.Response.Guess = {
            wordInvalid: false,
            guesses: userData.guesses,
            exactMatch: false,
        };

        if (!isValidHebrewWord(guess))
        {
            response.wordInvalid = true;
            return ApiSuccess(response);
        }

        if (userData.guesses.length < Settings.MAX_GUESS_COUNT && !userData.gameOver)
        {
            response.guesses = [
                ...userData.guesses,
                await processGuess(todaysWord, guess),
            ];
            response.exactMatch = isGuessExact(todaysWord, stringToWordleGuess(guess));
        }

        userData.guesses = response.guesses;
        userData.gameOver = isGameOver(response);

        await setUserData(userData);
        if (userData.gameOver)
        {
            commitGamePlayed(userData);
        }

        return ApiSuccess(response);
    }
    catch (e: unknown)
    {
        return catchHandler(request, e);
    }
}
