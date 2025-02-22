import { WordleGuess } from "@/app/api/common";
import HEBREW_WORDS from "@/component/hebrew-words";
import assert from "assert";

export function hebrewLetterNormalizer(letter: string): string
{
    const END_LETTERS: { [ x: string ]: string; } = {
        'ן': 'נ',
        'ץ': 'צ',
        'ף': 'פ',
        'ם': 'מ',
        'ך': 'כ',
    };
    return END_LETTERS[ letter ] ?? letter;
}

export function handleEndLetters(text: string): string
{
    const END_LETTERS: { [ x: string ]: string; } = {
        'נ': 'ן',
        'צ': 'ץ',
        'פ': 'ף',
        'מ': 'ם',
        'כ': 'ך',
    };

    const lastLetter = text.slice(text.length - 1);

    return text.slice(0, text.length - 1) + (END_LETTERS[ lastLetter ] ?? lastLetter);
}

export function isValidHebrewWord(word: string): boolean
{
    return HEBREW_WORDS.includes(handleEndLetters(word));
}

export function wordleGuessToString(guess: WordleGuess): string
{
    return guess.map((v) => v.letter).join('');
}


export function CloseButton({ ...props }: React.HTMLAttributes<SVGElement>)
{
    return (
        <svg
            { ...props }
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
        >
            <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                d="M16 4a12 12 0 1 0 0 24 12 12 0 1 0 0-24zm-4.5 7.5 9 9m0-9-9 9"
            ></path>
        </svg>
    );
}

export function isHebrewLetter(key: string): boolean
{
    const HEBREW_LETTERS = [
        'א',
        'ב',
        'ג',
        'ד',
        'ה',
        'ו',
        'ז',
        'ח',
        'ט',
        'י',
        'כ',
        'ל',
        'מ',
        'נ',
        'ס',
        'ע',
        'פ',
        'צ',
        'ק',
        'ר',
        'ש',
        'ת',
    ];
    assert(HEBREW_LETTERS.length === 22);
    return HEBREW_LETTERS.includes(hebrewLetterNormalizer(key));
}
