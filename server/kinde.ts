import {
	createKindeServerClient,
	GrantType,
	type SessionManager,
} from "@kinde-oss/kinde-typescript-sdk";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

// Client for authorization code flow
export const kindeClient = createKindeServerClient(
	GrantType.AUTHORIZATION_CODE,
	{
		authDomain: process.env.KINDE_DOMAIN!,
		clientId: process.env.KINDE_CLIENT_ID!,
		clientSecret: process.env.KINDE_CLIENT_SECRET!,
		redirectURL: process.env.KINDE_REDIRECT_URL!,
		logoutRedirectURL: process.env.KINDE_LOGOUT_REDIRECT_URL!,
	}
);

// Cookie-based session manager using Hono
export const createSessionManager = (c: Context): SessionManager => {
	return {
		async getSessionItem(key: string) {
			const value = getCookie(c, key);
			if (!value) return undefined;
			try {
				return JSON.parse(value);
			} catch {
				return value;
			}
		},
		async setSessionItem(key: string, value: unknown) {
			const stringValue =
				typeof value === "string" ? value : JSON.stringify(value);
			setCookie(c, key, stringValue, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "Lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 1 week
			});
		},
		async removeSessionItem(key: string) {
			deleteCookie(c, key, { path: "/" });
		},
		async destroySession() {
			// Get all cookies and remove them
			const cookies = c.req.raw.headers.get("cookie");
			if (!cookies) return;

			cookies.split(";").forEach((cookie) => {
				const [name] = cookie.trim().split("=");
				deleteCookie(c, name, { path: "/" });
			});
		},
	};
};
