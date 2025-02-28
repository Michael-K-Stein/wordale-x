import { JWTUserData, LastGameTimeData } from "@/server-api/enc";
import databaseController from "@/server-api/mongo-db-controller";

export async function isAllowedAnotherGame(userData: JWTUserData): Promise<boolean>
{
    const userFound = await databaseController.users.findOne({ username: userData.username });
    if (!userFound) { return true; }

    const lastGameTime: Partial<LastGameTimeData> | undefined = userFound.lastGameTime;
    if (!lastGameTime || !('year' in lastGameTime && 'month' in lastGameTime && 'day' in lastGameTime)) { return true; }

    const today = new Date();

    const dayOfMonth = today.getDate();
    const monthOfYear = today.getMonth();
    const currentYear = today.getFullYear();
    if (
        currentYear === lastGameTime.year &&
        dayOfMonth === lastGameTime.day &&
        monthOfYear === lastGameTime.month
    ) { return false; }

    return true;
}

export async function commitGamePlayed(userData: JWTUserData): Promise<LastGameTimeData>
{
    const today = new Date();
    const dayOfMonth = today.getDate();
    const monthOfYear = today.getMonth();
    const currentYear = today.getFullYear();

    const lastGameTime = {
        year: currentYear,
        month: monthOfYear,
        day: dayOfMonth,
    };

    await databaseController.users.updateOne({ username: userData.username }, { $set: { lastGameTime: lastGameTime } });

    return lastGameTime;
}
