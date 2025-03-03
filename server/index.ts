import app from "./app";
const server = Bun.serve({
	port: process.env.PORT || 3000,
	fetch: app.fetch,
});
console.log("server is running", server.port);
