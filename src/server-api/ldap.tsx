/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";

import { ClientApiError } from '@/shared-api/errors';
import ldap, { SearchOptions } from 'ldapjs';

// Define a whitelist of allowed username patterns
const usernameWhitelist = /^[a-zA-Z0-9\._\-]+$/;

// Configuration for the LDAP client
const LDAP_URL = process.env.LDAP_URL ?? 'ldap://ldap.forumsys.com';
const LDAP_SEARCH_BY = 'uid';
const LDAP_DC = 'dc=example,dc=com';

/**
 * Asynchronously verifies a user's credentials.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<any>} The user's information if the user exists and the password is correct.
 * @throws {Error} If the user does not exist or the password is incorrect.
 */
export async function verifyUser(username: string, password: string)
{
    if (!LDAP_URL)
    {
        throw new Error(`LDAP_URL environment variables must be configured!`);
    }

    // Validate the input
    if (!usernameWhitelist.test(username) || !username || !password)
    {
        throw new ClientApiError('Invalid username or password!');
    }

    const client = ldap.createClient({
        url: LDAP_URL,
    });

    // The user's DN in the LDAP server
    const userDN = `${LDAP_SEARCH_BY}=${username},${LDAP_DC}`;

    // Promise to handle the user verification
    const userVerified = new Promise<ldap.SearchEntryObject>((resolve, reject) =>
    {
        client.bind(userDN, password, (error: unknown) =>
        {
            if (error)
            {
                console.log(error);
                reject(new ClientApiError('Invalid username or password!'));
            }
            else
            {
                // Search for the user's information
                const opts: SearchOptions = {
                    filter: `(${LDAP_SEARCH_BY}=${username})`,
                    scope: 'sub',
                    attributes: [
                        'dn',
                        'sn',
                        'cn',
                        'ou',
                        'uid',
                        'dc',
                        'mail',
                        'objectclass',
                    ]
                };

                client.search(LDAP_DC, opts, (err: any, res: { on: (arg0: string, arg1: (entry: ldap.SearchEntry) => void) => void; }) =>
                {
                    if (err)
                    {
                        reject(new Error('Failed to retrieve user information!'));
                    }
                    else
                    {
                        res.on('searchEntry', (entry) =>
                        {
                            resolve(entry.pojo);
                        });
                    }
                });
            }
        });
    });

    const userInfo = await userVerified;

    // Unbind the client
    client.unbind((err: any) =>
    {
        if (err)
        {
            console.error('Failed to unbind the client!');
        }
    });

    return userInfo;
}
