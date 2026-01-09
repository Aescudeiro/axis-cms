import { createFileRoute, Link } from "@tanstack/react-router";
import { getAuth, getSignInUrl } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/")({
	loader: async () => {
		const { user } = await getAuth();

		const url = await getSignInUrl({
			data: {
				returnPathname: "/app",
			},
		});

		return { url, user };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { url, user } = Route.useLoaderData();

	return (
		<div>
			Hello "/"!
			{user ? <Link to="/app">Sign In</Link> : <a href={url}>Sign In</a>}
		</div>
	);
}
