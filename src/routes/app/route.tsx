import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { useConvexAuth } from "convex/react";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OrganizationProvider } from "@/components/organization-provider";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
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
		return (
			<div className="w-screen h-screen flex justify-center items-center">
				<Spinner className="size-20" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return navigate({
			href: url,
			reloadDocument: true,
		});
	}

	return (
		<OrganizationProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-[orientation=vertical]:h-4"
							/>
							<Breadcrumbs />
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4 px-4 py-10">
						<div className="mx-auto h-24 w-full max-w-3xl rounded-xl">
							<Outlet />
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</OrganizationProvider>
	);
}
