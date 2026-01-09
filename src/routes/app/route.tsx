import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { getAuth, getSignInUrl } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/app")({
	loader: async ({ location }) => {
		const { user } = await getAuth();

		if (!user) {
			const path = location.pathname;

			const href = await getSignInUrl({ data: { returnPathname: path } });

			throw redirect({ href });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			Hello "/app"!
			<Link to="/app/logout" reloadDocument>
				Logout
			</Link>
			<Outlet />
		</div>
	);
}
