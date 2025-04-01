import { filterRemainingWordsV3 } from "@/bot/filter-words";
import { WordleGuess } from "@/shared-api/common";
import WORDLIST from "@/shared-api/wordlist";

export function filterRemainingWords(guesses: Array<WordleGuess>, wordlist: Array<string>)
{
    return filterRemainingWordsV3(guesses, wordlist);

}

export function possibleWordsRemaining(guesses: Array<WordleGuess>)
{
    // const a = await calculateExpectedEntropy(guesses[ 0 ]);
    return filterRemainingWords(guesses, [ ...new Set(WORDLIST) ]);
}
