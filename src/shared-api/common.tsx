import Settings from "@/app/settings";
import { HebrewLetter } from "@/component/utils";
import Api from "@/shared-api/types";

export enum LetterGuessState
{
    Undefined = 'undefined',
    NotInWord = 'not-in-word', // Gray
    WrongPlace = 'wrong-place', // Yellow
    CorrectPlace = 'correct-place', // Green
};
export type LetterGuessEntropyState = Exclude<LetterGuessState, LetterGuessState.Undefined>;
export enum LetterBoxAnimationState
{
    Undefined = 'undefined',
    Idle = 'idle',
    Pop = 'pop',
    FlipIn = 'flip-in',
};
export type WordleGuessLetter = { letter: HebrewLetter, state: LetterGuessState, boxAnimation: LetterBoxAnimationState; };
export type WordleEntropyGuessLetter = { letter: HebrewLetter, state: LetterGuessEntropyState; };
export type WordleGuess = Array<WordleGuessLetter>;

export function isGameOver(guessState: Api.Response.Guess): boolean
{
    return guessState.exactMatch || guessState.guesses.length >= Settings.MAX_GUESS_COUNT;
}
