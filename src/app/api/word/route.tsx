export const dynamic = "force-dynamic";

import { ApiAccessError, ApiSuccess, isAdmin } from "@/app/api/common";
import WORDLIST from "@/component/wordlist";
import { NextRequest } from "next/server";

/// Get today's word
export async function GET(
    request: NextRequest
)
{
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
