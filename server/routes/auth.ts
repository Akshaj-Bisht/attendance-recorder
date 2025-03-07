import { Hono } from "hono";
import { kindeClient, createSessionManager } from "../kinde";

export const authRoute = new Hono()
	.get("/login", async (c) => {
		const sessionManager = createSessionManager(c);
		const loginUrl = await kindeClient.login(sessionManager);
		return c.redirect(loginUrl.toString());
	})

	.get("/register", async (c) => {
		const sessionManager = createSessionManager(c);
		const registerUrl = await kindeClient.register(sessionManager);
		return c.redirect(registerUrl.toString());
	})

	.get("/callback", async (c) => {
		const sessionManager = createSessionManager(c);
		await kindeClient.handleRedirectToApp(sessionManager, new URL(c.req.url));
		return c.redirect("/");
	})

	.get("/logout", async (c) => {
		const sessionManager = createSessionManager(c);
		const logoutUrl = await kindeClient.logout(sessionManager);
		return c.redirect(logoutUrl.toString());
	});
