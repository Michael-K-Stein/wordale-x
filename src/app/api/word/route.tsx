export const dynamic = "force-dynamic";

import { ApiAccessError, ApiSuccess, isAdmin } from "@/app/api/common";
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

export async function getTodaysWord(): Promise<string>
{
    const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const today = new Date();
    const startDate = new Date(2008, 1, 22);

    const daysSince = Math.round(Math.abs((today.getTime() - startDate.getTime()) / MILLISECONDS_IN_A_DAY));

    return WORDLIST[ daysSince % WORDLIST.length ];
}
