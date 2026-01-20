import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/app/sites/$slug")({
	loader: async ({ params, context }) => {
		const auth = await getAuth();
		const organizationId = auth.user ? auth.organizationId : undefined;

		const site = await context.queryClient.ensureQueryData(
			convexQuery(
				api.sites.getSiteBySlug,
				organizationId
					? { organizationWorkosId: organizationId, slug: params.slug }
					: "skip",
			),
		);

		return { crumb: site?.name || params.slug };
	},
});
