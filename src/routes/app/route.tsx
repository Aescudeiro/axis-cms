import {
	createFileRoute,
	Link,
	Navigate,
	Outlet,
} from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { useConvexAuth } from "convex/react";

export const Route = createFileRoute("/app")({
	ssr: false,
	loader: async ({ location }) => {
		const url = await getSignInUrl({
			data: {
				returnPathname: location.pathname,
			},
		});

		return { url };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { url } = Route.useLoaderData();
	const { isLoading, isAuthenticated } = useConvexAuth();

	if (isLoading) {
		return <div>Loading page</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/app" href={url} />;
	}

	return (
		<div>
			<header>
				<h1>axis cms</h1>
				<nav>
					<ul>
						<li>
							<Link to="/app">Dashboard</Link>
						</li>
						<li>
							<Link to="/app/organizations">Organizations</Link>
						</li>
						<li>
							<Link to="/logout" reloadDocument>
								Logout
							</Link>
						</li>
					</ul>
				</nav>
			</header>
			<Outlet />
		</div>
	);
}
