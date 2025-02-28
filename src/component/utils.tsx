
import HEBREW_WORDS from "@/component/hebrew-words";
import { WordleGuess } from "@/shared-api/common";
import assert from "assert";

export type HebrewNormalLetter = 'א' | 'ב' | 'ג' | 'ד' | 'ה' | 'ו' | 'ז' | 'ח' | 'ט' | 'י' | 'כ' | 'ל' | 'מ' | 'נ' | 'ס' | 'ע' | 'פ' | 'צ' | 'ק' | 'ר' | 'ש' | 'ת';
export type HebrewEndLetter = 'ן' | 'ץ' | 'ף' | 'ם' | 'ך';
export type HebrewLetter = HebrewNormalLetter | HebrewEndLetter | '';

export function hebrewLetterNormalizer(letter: HebrewLetter): HebrewNormalLetter
{
    const END_LETTERS: Record<HebrewEndLetter, HebrewNormalLetter> = {
        'ן': 'נ',
        'ץ': 'צ',
        'ף': 'פ',
        'ם': 'מ',
        'ך': 'כ',
    };
    return END_LETTERS[ letter as HebrewEndLetter ] ?? letter;
}

export function handleEndLetters(text: string): string
{
    const END_LETTERS: Partial<Record<HebrewNormalLetter, HebrewEndLetter>> = {
        'נ': 'ן',
        'צ': 'ץ',
        'פ': 'ף',
        'מ': 'ם',
        'כ': 'ך',
    };

    const lastLetter = text.slice(text.length - 1);

    return text.slice(0, text.length - 1) + (END_LETTERS[ lastLetter as HebrewNormalLetter ] ?? lastLetter);
}

export function isValidHebrewWord(word: string): boolean
{
    return HEBREW_WORDS.includes(handleEndLetters(word));
}

export function wordleGuessToString(guess: WordleGuess): string
{
    return guess.map((v) => v.letter).join('');
}

export function stringToArray(text: string): Array<string>
{
    const arr = text.split('');
    assert(arr.length === text.length, 'stringToArray did not split text into individual characters!');
    return arr;
}

export function stringToNormalizedArray(text: string): Array<HebrewNormalLetter>
{
    return (stringToArray(text) as Array<HebrewLetter>).map((x: HebrewLetter) => hebrewLetterNormalizer(x));
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
    return HEBREW_LETTERS.includes(hebrewLetterNormalizer(key as HebrewLetter));
}
