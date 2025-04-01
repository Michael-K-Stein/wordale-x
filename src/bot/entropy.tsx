import Settings from "@/app/settings";
import { filterRemainingWords } from "@/bot/common";
import { HebrewLetter } from "@/component/utils";
import { LetterBoxAnimationState, LetterGuessEntropyState, LetterGuessState, WordleGuess } from "@/shared-api/common";
import assert from "assert";
type Permutation = Array<LetterGuessEntropyState>;
function allPossiblePermutations(): Array<Permutation>
{
    const permutations: Array<Permutation> = [];

    const permutationCount = Math.pow(3, Settings.WORD_LENGTH);

    const GUESS_STATES: Permutation = [ LetterGuessState.NotInWord, LetterGuessState.WrongPlace, LetterGuessState.CorrectPlace ];
    for (let permutationIndexValue = 0; permutationIndexValue < permutationCount; ++permutationIndexValue)
    {
        let value = permutationIndexValue;
        const currentPermutation: Permutation = [];
        for (let index = 0; index < Settings.WORD_LENGTH; ++index)
        {
            currentPermutation.push(GUESS_STATES[ value % 3 ]);
            value = Math.floor(value / 3);
        }
        permutations.push(currentPermutation);
    }

    return permutations;
}

function getRemainingWordsForPermutation({ guess, permutation, wordlist }: { guess: Array<HebrewLetter>; permutation: Permutation; wordlist: Array<string>; })
{
    const guesses: Array<WordleGuess> = [ [] ];
    assert(guess.length === permutation.length, 'Guess and permutation length must match!');
    for (let i = 0; i < guess.length; ++i)
    {
        guesses[ 0 ].push({ letter: guess[ i ], state: permutation[ i ], boxAnimation: LetterBoxAnimationState.Undefined });
    }

    return filterRemainingWords(guesses, wordlist);
}

function getPermutationProbability(args: { guess: Array<HebrewLetter>; permutation: Permutation; wordlist: Array<string>; })
{
    // Takes about as long as filterRemainingWordsV3 +- 0.05ms
    return getRemainingWordsForPermutation(args).length / args.wordlist.length;
}

function calculateInformationBitsScore(probability: number)
{
    // Takes about 0.0015ms
    return (probability === 0) ? 0 : -Math.log2(probability);
}

const possiblePermutations = allPossiblePermutations();
export function calculateExpectedEntropy(nextGuess: Array<HebrewLetter>, wordlist: Array<string>): number
{
    const probabilityOfPermutation: Array<{ probability: number, permutation: Permutation, informationBits: number; }> =
        possiblePermutations.map((permutation) =>
        {
            const probability = getPermutationProbability({
                guess: nextGuess, wordlist, permutation
            });
            const informationBits = calculateInformationBitsScore(probability);
            return {
                probability,
                permutation,
                informationBits,
            };
        });

    if (0)
    {
        const total = probabilityOfPermutation.reduce((sum, permutationData) => sum + permutationData.probability, 0);
        console.debug(`The total probability is ${total}`);
    }

    const entropy = probabilityOfPermutation.reduce((sum, permutationData) => sum + (permutationData.probability * permutationData.informationBits), 0);
    console.log(`[${nextGuess.join('')}] Entropy: ${entropy}`);

    return entropy;
};
