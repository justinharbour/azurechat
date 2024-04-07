import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { Provider } from "next-auth/providers/index";
import { hashValue } from "./helpers";
import OktaProvider from "next-auth/providers/okta";

const configureIdentityProvider = () => {
    const providers: Array<Provider> = [];

    const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map((email) =>
        email.toLowerCase().trim()
    );

    if (
        process.env.AZURE_AD_CLIENT_ID &&
        process.env.AZURE_AD_CLIENT_SECRET &&
        process.env.AZURE_AD_TENANT_ID
    ) {
        providers.push(
            AzureADProvider({
                clientId: process.env.AZURE_AD_CLIENT_ID!,
                clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
                tenantId: process.env.AZURE_AD_TENANT_ID!,
                async profile(profile) {
                    const newProfile = {
                        ...profile,
                        id: profile.sub,
                        isAdmin:
                            adminEmails?.includes(profile.email.toLowerCase()) ||
                            adminEmails?.includes(profile.preferred_username.toLowerCase()),
                    };
                    return newProfile;
                },
            })
        );
    }

    // Add the first Okta provider
    if (
        process.env.OKTA_CLIENT_ID &&
        process.env.OKTA_CLIENT_SECRET &&
        process.env.OKTA_ISSUER
    ) {
        providers.push(
            OktaProvider({
                clientId: process.env.OKTA_CLIENT_ID!,
                clientSecret: process.env.OKTA_CLIENT_SECRET!,
                issuer: process.env.OKTA_ISSUER!,
            })
        );
    }

    // Add the second Okta provider
    if (
        process.env.OKTA_CLIENT_ID_ADMIN &&
        process.env.OKTA_CLIENT_SECRET_ADMIN &&
        process.env.OKTA_ISSUER_ADMIN
    ) {
        providers.push(
            OktaProvider({
                clientId: process.env.OKTA_CLIENT_ID_ADMIN!,
                clientSecret: process.env.OKTA_CLIENT_SECRET_ADMIN!,
                issuer: process.env.OKTA_ISSUER_ADMIN!,
                authorization: {
                    params: {
                        response_mode: 'query',
                        redirect_uri: 'http://chat.loyalsource.com/api/auth/callback/okta-admin',
                    },
                },
            })
        );
    }

    return providers;
};

export const options: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        ...configureIdentityProvider(),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user?.isAdmin) {
                token.isAdmin = user.isAdmin;
            }
            return token;
        },
        async session({ session, token, user }) {
            session.user.isAdmin = token.isAdmin as boolean;
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
};

export const handlers = NextAuth(options);
