import { ApiSuccess, catchHandler } from "@/app/api/common";
import { ClientApiError } from "@/shared-api/errors";
import HEBREW_WORDS from "@/shared-api/hebrew-words";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest
)
{
    try
    {
        const word = request.nextUrl.searchParams.get('w');
        if (!word || typeof word !== 'string')
        {
            throw new ClientApiError('Invalid API argument "w"!');
        }
        return ApiSuccess(HEBREW_WORDS.includes(word));
    }
    catch (e: unknown)
    {
        return catchHandler(request, e);
    }
}