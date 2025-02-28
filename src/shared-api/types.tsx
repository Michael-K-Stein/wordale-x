import { WordleGuess } from "@/shared-api/common";

/* eslint-disable @typescript-eslint/no-namespace */
namespace Api
{
    export namespace Request
    {
        export type LoginData = { username: string, password: string; };
    }
    export namespace Response
    {
        export interface Guess
        {
            wordInvalid: boolean;
            guesses: Array<WordleGuess>;
            exactMatch: boolean;
        }
    }
}

export default Api;

export interface ApiResponseJson
{
    status: number;
    data?: unknown;
    error?: unknown;
}