import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api";
export const Route = createFileRoute("/profile")({
	component: Profile,
});

function Profile() {
	const { isPending, error, data } = useQuery(userQueryOptions);
	if (isPending) return "loading";
	if (error) return "not logged in";

	return (
		<div>
			Hello "/profile"!
			<p>Hello {data.user.family_name}</p>
		</div>
	);
}
