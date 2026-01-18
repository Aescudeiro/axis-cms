import { AvatarFallback } from "@radix-ui/react-avatar";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { ChevronsUpDown, LogOut, User2 } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "./ui/sidebar";

export function NavUser() {
	const { user } = useAuth();
	const { isMobile } = useSidebar();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={user?.profilePictureUrl ?? ""}
									alt={`${user?.firstName} ${user?.lastName}`}
								/>
								<AvatarFallback className="rounded-lg">
									<User2 />
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user?.firstName}</span>
								<span className="truncate text-xs">{user?.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={user?.profilePictureUrl ?? ""}
										alt={`${user?.firstName} ${user?.lastName}`}
									/>
									<AvatarFallback className="rounded-lg">
										<User2 />
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{user?.firstName}
									</span>
									<span className="truncate text-xs">{user?.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuItem asChild>
							<Link to="/logout" reloadDocument>
								<LogOut />
								Log out
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
