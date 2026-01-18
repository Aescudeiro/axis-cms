import {
	Link,
	useRouterState,
	type ValidateToPath,
} from "@tanstack/react-router";
import { Building2, LayoutDashboard, type LucideIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
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

	return (
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
			</SidebarMenu>
		</SidebarGroup>
	);
}
