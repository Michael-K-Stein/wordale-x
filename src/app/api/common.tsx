export const dynamic = "force-dynamic";

import Settings from "@/app/settings";
import { NextRequest, NextResponse } from "next/server";
import assert from "assert";
import { CACHE_CONTROL_HTTP_HEADER, IMMUTABLE_CACHE_MAX_TTL } from "@/app/settings";
import { cookies, headers } from "next/headers";
import { ClientApiError, UserNotLoggedInError } from "@/shared-api/errors";
import { friendlyRedirectToLogin } from "@/app/api/login/redirect-to-login";
import { getJwtSecret, JWTUserData } from "@/server-api/enc";
import jwt from 'jsonwebtoken';


export async function isAdmin(request: NextRequest): Promise<boolean>
{
    const adminCookie = request.cookies.get('admin')?.value;
    if (adminCookie)
    {
        const utf8 = new TextEncoder().encode(adminCookie);
        return await (crypto.subtle.digest('SHA-256', utf8)
            .then((hashBuffer) =>
            {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray
                    .map((bytes) => bytes.toString(16).padStart(2, '0'))
                    .join('');
                console.log(hashHex);
                return hashHex;
            })
        ) === Settings.ADMIN_COOKIE_HASH;
    }
    return false;
}
export async function getUserData()
{
    const jwtSecret = getJwtSecret();

    const authToken = (await cookies()).get(Settings.USER_AUTH_COOKIE_NAME);
    if (!authToken)
    {
        throw new UserNotLoggedInError('User must be logged in to use this api!');
    }

    // Verify the JWT and get the user data
    try
    {
        try
        {
            const userData = jwt.verify(authToken.value, jwtSecret) as JWTUserData;
            return userData;
        }
        catch (error: unknown)
        {
            console.error(error);
            throw new Error('Error verifying JWT!');
        }
    }
    catch (e: unknown)
    {
        console.error(e);
        throw new Error('Error getting user data!');
    }
}

export async function setUserData(newData: JWTUserData)
{
    // Generate a JWT with the user data and a secret key
    const token = jwt.sign(
        newData,
        getJwtSecret()
    );

    // Set the JWT as a cookie
    (await cookies()).set(Settings.USER_AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: Settings.SECURE_CONTEXT_ONLY, // Use HTTPS in production
        sameSite: 'strict',
        maxAge: 3600 * 24 * 7, // Change this to the desired session duration in seconds
        path: '/',
    });
}

export type ApiResponseHeaders = Record<string, string>;
export type ApiResponseInit = (Omit<ResponseInit, 'status' | 'headers'> & { headers: ApiResponseHeaders; }) | undefined;
export type ApiCacheControl = 'no-cache' | 'no-store' | 'immutable' | 'must-revalidate' | number;
export function ApiResponseMaker(data: unknown, cacheControl?: ApiCacheControl, init?: ApiResponseInit)
{
    const additionalHeaders: ApiResponseHeaders = {};
    if (cacheControl !== undefined)
    {
        assert(!init || !init.headers || !(CACHE_CONTROL_HTTP_HEADER in init.headers));
        if (typeof cacheControl === 'string')
        {
            additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, ${cacheControl}`;
            if (cacheControl === 'immutable')
            {
                additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, max-age=${IMMUTABLE_CACHE_MAX_TTL}, immutable`;
            }
            else if (cacheControl === 'must-revalidate')
            {
                additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, max-age=1, must-revalidate`;
            }
        }
        else if (typeof cacheControl === 'number')
        {
            additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, max-age=${cacheControl}, immutable`;
        }
    }

    if (init === undefined)
    {
        init = { headers: additionalHeaders };
    }
    else if (init !== undefined && init.headers)
    {
        init.headers = { ...init.headers, ...additionalHeaders };
    }

    return new NextResponse(JSON.stringify({ 'status': 0, 'data': data }), { status: 200, ...init });
}
export function ApiErrorMaker(e: unknown)
{
    return new NextResponse(JSON.stringify({ 'status': -1, 'error': e }), { status: 200 });
}

export function ApiError(e: unknown)
{
    return ApiErrorMaker(e);
}

export function ApiAccessError(e: unknown)
{
    return ApiErrorMaker(e);
}

export function ApiSuccess(data?: unknown, cacheControl?: ApiCacheControl, init?: ApiResponseInit)
{
    return ApiResponseMaker(data, cacheControl, init);
}

export async function catchHandler<T extends NextRequest>(request: T, e: unknown)
{
    if (e instanceof UserNotLoggedInError)
    {
        const requestHeaders = headers();
        return friendlyRedirectToLogin(request, (await requestHeaders).get('referer') ?? '/');
    }

    if (e instanceof ClientApiError)
    {
        return ApiErrorMaker(e);
    }

    console.log(e);
    return ApiError(e);
}
