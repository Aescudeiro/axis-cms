import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import { useConvexAuth } from "convex/react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function OrganizationSwitcher() {
	const router = useRouter();
	const { organizationId, switchToOrganization } = useAuth();
	const { isLoading } = useConvexAuth();
	const { data: organizations } = useQuery(
		convexQuery(api.auth.getUserOrganizations, {}),
	);

	const handleChange = async (newOrganizationId: string) => {
		await switchToOrganization(newOrganizationId);
		router.invalidate();
	};

	return (
		<Select
			onValueChange={handleChange}
			value={organizationId}
			disabled={isLoading}
		>
			<SelectTrigger>
				<SelectValue placeholder="Select an organization" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{organizations?.map((organization) => (
						<SelectItem
							key={organization.workosId}
							value={organization.workosId}
						>
							{organization.name}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
