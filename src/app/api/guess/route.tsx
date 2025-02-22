import { GuessApiResponse, LetterBoxAnimationState, LetterGuessState, WordleGuess, WordleGuessLetter } from "@/app/api/common";
import { getTodaysWord } from "@/app/api/word/route";
import { hebrewLetterNormalizer, isValidHebrewWord } from "@/component/utils";
import { NextRequest, NextResponse } from "next/server";

async function getUserData()
{
    return {
        guesses: [],
        gameOver: false,
    };
}

function checkGuessLetterState(todaysWord: string, guessLetterValue: string, index: number): LetterGuessState 
{
    if (hebrewLetterNormalizer(guessLetterValue) === hebrewLetterNormalizer(todaysWord[ index ])) { return LetterGuessState.CorrectPlace; }
    if (todaysWord.includes(hebrewLetterNormalizer(guessLetterValue))) { return LetterGuessState.WrongPlace; }
    return LetterGuessState.NotInWord;
};

async function processGuess(todaysWord: string, guess: string)
{
    return stringToWordleGuess(guess)
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
}

function isGuessExact(todaysWord: string, guess: WordleGuess): boolean 
{
    const guessIsExact = guess.reduce(
        (correctSoFar, currentLetter, letterIndex) =>
        {
            return correctSoFar && hebrewLetterNormalizer(currentLetter.letter) === hebrewLetterNormalizer(todaysWord[ letterIndex ]);
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
                letter: guess.charAt(i),
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
        const guess: string = await request.json();
        const userData = await getUserData();
        const todaysWord = await getTodaysWord();

        const response: GuessApiResponse = {
            wordInvalid: false,
            guesses: userData.guesses,
            exactMatch: false,
        };

        if (!isValidHebrewWord(guess))
        {
            response.wordInvalid = true;
            return NextResponse.json(response);
        }

        if (userData.guesses.length < 6 && !userData.gameOver)
        {
            response.guesses = [
                ...userData.guesses,
                await processGuess(todaysWord, guess),
            ];
            response.exactMatch = isGuessExact(todaysWord, stringToWordleGuess(guess));
        }
        console.log(response.guesses);
        return NextResponse.json(response);
    }
    catch (e: unknown)
    {
        console.error(e);
        return NextResponse.json({ error: 'Error' });
    }
}
