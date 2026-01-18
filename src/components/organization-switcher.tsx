import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import type { Doc } from "convex/_generated/dataModel";
import { useConvexAuth } from "convex/react";
import { ChevronsUpDown, Plus } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useOrganization } from "./organization-provider";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useSidebar } from "./ui/sidebar";

export function OrganizationSwitcher() {
	const router = useRouter();
	const { isMobile } = useSidebar();
	const { isLoading } = useConvexAuth();
	const { organizationId, switchToOrganization } = useAuth();
	const { organizations, activeOrganization, openCreateDialog } =
		useOrganization();

	const handleChange = async (newOrganization: Doc<"organizations">) => {
		await switchToOrganization(newOrganization.workosId).then(() => {
			router.invalidate();
		});
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild disabled={isLoading}>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="rounded-lg">
								<AvatarFallback className="rounded-lg">
									{activeOrganization?.name.split(" ")?.[0]?.charAt(0)}
									{activeOrganization?.name.split(" ")?.[1]?.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{activeOrganization?.name}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Organizations
						</DropdownMenuLabel>
						{organizations.map((organization) => (
							<DropdownMenuItem
								key={organization.name}
								onClick={() => handleChange(organization)}
								className="gap-2 p-2"
								disabled={organization.workosId === organizationId}
							>
								<Avatar className="rounded-lg">
									<AvatarFallback className="rounded-lg">
										{organization?.name.split(" ")?.[0]?.charAt(0)}
										{organization?.name.split(" ")?.[1]?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								{organization.name}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className="gap-2 p-2" onClick={openCreateDialog}>
							<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<Plus className="size-4" />
							</div>
							<div className="text-muted-foreground font-medium">
								Add Organization
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
