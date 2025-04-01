/* eslint-disable @typescript-eslint/no-namespace */
namespace Settings
{
    export const MAX_GUESS_COUNT = 6;
    export const WORD_LENGTH = 5;
    export const ADMIN_COOKIE_HASH = '927c6df8ef57050e277ab54d7f5294ab955a784d53d2b9428788ccb2245bc503';
    export const USER_AUTH_COOKIE_NAME = 'auth';
    export const SECURE_CONTEXT_ONLY = false; //process.env.NODE_ENV !== 'development' && (!process.env.HTTP_ONLY);
    export const FREE_PLAY = false;
};
export default Settings;


const SECONDS_IN_AN_HOUR = 3600;
const HOURS_IN_A_DAY = 24;
const SECONDS_IN_A_DAY = SECONDS_IN_AN_HOUR * HOURS_IN_A_DAY;
const DAYS_IN_A_WEEK = 7;

// HTTP Caching
export const CACHE_CONTROL_HTTP_HEADER = 'Cache-Control';
// 28 days
export const IMMUTABLE_CACHE_MAX_TTL = SECONDS_IN_A_DAY * DAYS_IN_A_WEEK * 4;
