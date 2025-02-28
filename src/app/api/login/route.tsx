export const dynamic = "force-dynamic";

import jwt from 'jsonwebtoken';
import { getJwtSecret, JWTUserData } from "@/server-api/enc";
import { verifyUser } from "@/server-api/ldap";
import Api from "@/shared-api/types";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import Settings from '@/app/settings';
import { catchHandler } from '@/app/api/common';
import databaseController from '@/server-api/mongo-db-controller';

export async function POST(
    request: NextRequest
)
{
    try
    {
        const { username, password }: Api.Request.LoginData = await request.json();

        await verifyUser(username, password);

        databaseController.users.updateOne({ 'username': username }, {
            $set: {
                'username': username
            }
        }, { upsert: true });

        const userJWTData: JWTUserData = {
            username: username,
            guesses: [],
            gameOver: false,
            lastGameTime: {}
        };

        // Generate a JWT with the user data and a secret key
        const token = jwt.sign(
            userJWTData,
            getJwtSecret(), { expiresIn: '7d' }
        );

        // Set the JWT as a cookie
        (await cookies()).set(Settings.USER_AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: Settings.SECURE_CONTEXT_ONLY, // Use HTTPS in production
            sameSite: 'strict',
            maxAge: 3600 * 24 * 7, // Change this to the desired session duration in seconds
            path: '/',
        });

        const url = request.nextUrl;
        url.pathname = '/';
        return NextResponse.redirect(url);
    }
    catch (e: unknown)
    {
        return catchHandler(request, e);
    }
}