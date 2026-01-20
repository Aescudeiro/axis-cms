import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import {
	Link,
	useRouterState,
	type ValidateToPath,
} from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import {
	Building2,
	ChevronRight,
	Globe,
	LayoutDashboard,
	type LucideIcon,
	Plus,
} from "lucide-react";
import { useState } from "react";
import { CreateSiteDialog } from "./create-site-dialog";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./ui/collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "./ui/sidebar";

interface NavItem {
	title: string;
	icon: LucideIcon;
	url: ValidateToPath;
}

const items: NavItem[] = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		url: "/app",
	},
	{
		title: "Organizations",
		icon: Building2,
		url: "/app/organizations",
	},
];

export function NavMain() {
	const location = useRouterState({ select: (s) => s.location });
	const { organizationId } = useAuth();
	const [createSiteOpen, setCreateSiteOpen] = useState(false);

	const { data: sites } = useQuery(
		convexQuery(
			api.sites.getSitesByOrganization,
			organizationId ? { organizationWorkosId: organizationId } : "skip",
		),
	);

	const isSitesActive = location.href.startsWith("/app/sites");

	return (
		<>
			<SidebarGroup>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								asChild
								isActive={location.href === item.url}
							>
								<Link to={item.url}>
									<item.icon />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}

					<Collapsible asChild defaultOpen={isSitesActive}>
						<SidebarMenuItem>
							<SidebarMenuButton tooltip="Sites" asChild isActive={isSitesActive}>
								<Link to="/app/sites">
									<Globe />
									<span>Sites</span>
								</Link>
							</SidebarMenuButton>
							<CollapsibleTrigger asChild>
								<SidebarMenuAction className="data-[state=open]:rotate-90">
									<ChevronRight />
									<span className="sr-only">Toggle</span>
								</SidebarMenuAction>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{sites?.map((site) => (
										<SidebarMenuSubItem key={site._id}>
											<SidebarMenuSubButton
												asChild
												isActive={location.href === `/app/sites/${site.slug}`}
											>
												<Link
													to="/app/sites/$slug"
													params={{ slug: site.slug }}
												>
													<span>{site.name}</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
									<SidebarMenuSubItem>
										<SidebarMenuSubButton
											onClick={() => setCreateSiteOpen(true)}
											className="text-muted-foreground"
										>
											<Plus className="size-4" />
											<span>New Site</span>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				</SidebarMenu>
			</SidebarGroup>

			<CreateSiteDialog
				open={createSiteOpen}
				onOpenChange={setCreateSiteOpen}
			/>
		</>
	);
}
