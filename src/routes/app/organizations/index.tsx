import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/app/organizations/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: organizations } = useQuery(
		convexQuery(api.auth.getUserOrganizations, {}),
	);

	return (
		<div>
			Hello "/app/organizations/"!
			<ul>
				{organizations?.map((organization) => (
					<li key={organization._id}>{organization.name}</li>
				))}
			</ul>
		</div>
	);
}
