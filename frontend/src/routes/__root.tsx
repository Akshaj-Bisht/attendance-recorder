import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
	component: Root,
});
function NavBar() {
	return (
		<div className="p-2 flex gap-2">
			<Link to="/" className="[&.active]:font-bold">
				Home
			</Link>{" "}
			<Link to="/about" className="[&.active]:font-bold">
				About
			</Link>
			<Link to="/add-subject" className="[&.active]:font-bold">
				Add subject
			</Link>
			<Link to="/profile" className="[&.active]:font-bold">
				profile
			</Link>
		</div>
	);
}
function Root() {
	return (
		<>
			<NavBar />
			<hr />
			<Outlet />
			<TanStackRouterDevtools />
		</>
	);
}
