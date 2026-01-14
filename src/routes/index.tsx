import { createFileRoute, Link } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { Authenticated, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/")({
	loader: async () => {
		const url = await getSignInUrl({
			data: {
				returnPathname: "/app",
			},
		});

		return { url };
	},
	component: App,
});

function App() {
	const { url } = Route.useLoaderData();

	return (
		<div>
			Hello "/"!
			<p>
				<Authenticated>
					<Link to="/app">Dashboard</Link>
				</Authenticated>
				<Unauthenticated>
					<a href={url}>Sign In</a>
				</Unauthenticated>
			</p>
		</div>
	);
}
