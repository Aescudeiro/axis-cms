import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { useConvexAuth } from "convex/react";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";

export const Route = createFileRoute("/app")({
	ssr: false,
	loader: async ({ location }) => {
		const url = await getSignInUrl({
			data: {
				returnPathname: location.pathname,
				organizationId: env.VITE_WORKOS_DEFAULT_ORG_ID,
			},
		});

		return { url };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { url } = Route.useLoaderData();
	const navigate = useNavigate();
	const { isLoading, isAuthenticated } = useConvexAuth();

	if (isLoading) {
		return <Spinner className="size-9" />;
	}

	if (!isAuthenticated) {
		return navigate({
			href: url,
			reloadDocument: true,
		});
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
				<OrganizationSwitcher />
			</header>
			<Outlet />
		</div>
	);
}
