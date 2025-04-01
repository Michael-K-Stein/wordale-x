import WORDLIST from "@/shared-api/wordlist";

export async function getTodaysWord(): Promise<string>
{
    const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const today = new Date();
    const startDate = new Date(2008, 1, 22);

    const daysSince = Math.round(Math.abs((today.getTime() - startDate.getTime()) / MILLISECONDS_IN_A_DAY));

    return WORDLIST[ daysSince % WORDLIST.length ];
}
