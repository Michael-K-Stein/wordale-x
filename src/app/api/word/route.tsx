export const dynamic = "force-dynamic";

import { ApiAccessError, ApiSuccess, isAdmin } from "@/app/api/common";
import { getTodaysWord } from "@/app/api/get-word";
import Settings from "@/app/settings";
import WORDLIST from "@/shared-api/wordlist";
import { NextRequest } from "next/server";

/// Get today's word
export async function GET(
    request: NextRequest
)
{
    if (Settings.FREE_PLAY)
    {
        return ApiSuccess(WORDLIST[ parseInt(request.nextUrl.searchParams.get('i') ?? '0') % WORDLIST.length ]);
    }
    if (await isAdmin(request))
    {
        return ApiSuccess(await getTodaysWord());
    }
    else
    {
        return ApiAccessError('Good luck!');
    }
}
