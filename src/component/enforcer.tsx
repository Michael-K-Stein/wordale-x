interface LastGameTimeData
{
    year: number;
    month: number;
    day: number;
}
export function isAllowedAnotherGame(): boolean
{
    if (typeof window === 'undefined') { return false; }

    const lastGameTime: LastGameTimeData = JSON.parse(window.localStorage.getItem('lastGameTime') ?? '{}');
    if (!('year' in lastGameTime && 'month' in lastGameTime && 'day' in lastGameTime)) { return true; }

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

export function commitGamePlayed(): void
{
    if (typeof window === 'undefined') { return; }

    const today = new Date();
    const dayOfMonth = today.getDate();
    const monthOfYear = today.getMonth();
    const currentYear = today.getFullYear();

    const lastGameTime = {
        year: currentYear,
        month: monthOfYear,
        day: dayOfMonth,
    };

    window.localStorage.setItem('lastGameTime', JSON.stringify(lastGameTime));
}
