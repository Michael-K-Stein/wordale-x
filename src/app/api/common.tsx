import Settings from "@/app/settings";
import { NextRequest } from "next/server";

export interface GuessApiResponse
{
    wordInvalid: boolean;
    guesses: Array<WordleGuess>;
    exactMatch: boolean;
}


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

export function isGameOver(guessState: GuessApiResponse): boolean
{
    return guessState.exactMatch || guessState.guesses.length >= Settings.MAX_GUESS_COUNT;
}

export async function isAdmin(request: NextRequest): Promise<boolean>
{
    const adminCookie = request.cookies.get('admin')?.value;
    console.log(adminCookie);
    if (adminCookie)
    {
        const utf8 = new TextEncoder().encode(adminCookie);
        return await (crypto.subtle.digest('SHA-256', utf8)
            .then((hashBuffer) =>
            {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray
                    .map((bytes) => bytes.toString(16).padStart(2, '0'))
                    .join('');
                console.log(hashHex);
                return hashHex;
            })
        ) === Settings.ADMIN_COOKIE_HASH;
    }
    return false;
}
