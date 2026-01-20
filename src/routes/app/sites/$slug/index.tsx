import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import { Globe } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/sites/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { organizationId } = useAuth();
	const navigate = useNavigate();

	const { data: site, isLoading } = useQuery(
		convexQuery(
			api.sites.getSiteBySlug,
			organizationId ? { organizationWorkosId: organizationId, slug } : "skip",
		),
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!site) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<p className="text-muted-foreground">Site not found.</p>
				<button
					type="button"
					onClick={() => navigate({ to: "/app/sites" })}
					className="text-sm text-primary hover:underline"
				>
					Back to sites
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start gap-4">
				<Avatar className="size-12 rounded-lg">
					<AvatarFallback className="rounded-lg">
						<Globe className="size-6" />
					</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold tracking-tight">
							{site.name}
						</h1>
						<Badge
							variant={site.status === "published" ? "default" : "secondary"}
						>
							{site.status === "published" ? "Published" : "Draft"}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">/{site.slug}</p>
					{site.description && (
						<p className="mt-2 text-sm text-muted-foreground">
							{site.description}
						</p>
					)}
				</div>
			</div>

			<div className="rounded-lg border p-6">
				<p className="text-center text-muted-foreground">
					Site content and settings will be displayed here.
				</p>
			</div>
		</div>
	);
}
