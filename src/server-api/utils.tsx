import { handleEndLetters } from "@/component/utils";
import HEBREW_WORDS from "@/shared-api/hebrew-words";

export function isValidHebrewWord(word: string): boolean
{
    return HEBREW_WORDS.includes(handleEndLetters(word));
}
