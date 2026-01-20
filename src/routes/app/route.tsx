import {
	createFileRoute,
	isMatch,
	Link,
	Outlet,
	useMatches,
	useNavigate,
} from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { OrganizationProvider } from "@/components/organization-provider";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

const SIDEBAR_STORAGE_KEY = "sidebar_state";

function RouteComponent() {
	const { url } = Route.useLoaderData();
	const navigate = useNavigate();
	const { isLoading, isAuthenticated } = useConvexAuth();
	const matches = useMatches();
	const [sidebarOpen, setSidebarOpen] = useState(() => {
		const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);

		return stored !== null ? stored === "true" : true;
	});

	const handleSidebarChange = (open: boolean) => {
		setSidebarOpen(open);

		localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
	};

	const matchesWithCrumbs = matches.filter((match) =>
		isMatch(match, "loaderData.crumb"),
	);

	const items = matchesWithCrumbs.map(({ pathname, loaderData }) => {
		return {
			href: pathname,
			label: loaderData?.crumb,
		};
	});

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
			<SidebarProvider open={sidebarOpen} onOpenChange={handleSidebarChange}>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-[orientation=vertical]:h-4"
							/>
							<Breadcrumb>
								<BreadcrumbList>
									{items.map((item, index) => (
										<BreadcrumbItem key={item.href} className="hidden md:block">
											<BreadcrumbLink asChild>
												<Link to={item.href} disabled={index === 0}>
													{item.label}
												</Link>
											</BreadcrumbLink>
											{index < items.length - 1 && <BreadcrumbSeparator />}
										</BreadcrumbItem>
									))}
								</BreadcrumbList>
							</Breadcrumb>
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
