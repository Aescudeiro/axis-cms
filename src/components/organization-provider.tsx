import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { createContext, type ReactNode, useContext, useState } from "react";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { LeaveOrganizationDialog } from "./leave-organization-dialog";

type OrganizationAction =
	| { type: "create" }
	| { type: "delete"; organization: Doc<"organizations"> };

interface OrganizationContextValue {
	organizations: Doc<"organizations">[];
	activeOrganization: Doc<"organizations"> | undefined;
	isLoading: boolean;
	openCreateDialog: () => void;
	openDeleteDialog: (organization: Doc<"organizations">) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(
	null,
);

export function useOrganization() {
	const context = useContext(OrganizationContext);

	if (!context) {
		throw new Error("useOrganization must be used within OrganizationProvider");
	}

	return context;
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
	const { organizationId } = useAuth();
	const { data: organizations, isLoading } = useQuery(
		convexQuery(api.auth.getUserOrganizations, {}),
	);

	const [action, setAction] = useState<OrganizationAction | null>(null);

	const activeOrganization = organizations?.find(
		(org) => org.workosId === organizationId,
	);

	const openCreateDialog = () => setAction({ type: "create" });

	const openDeleteDialog = (organization: Doc<"organizations">) =>
		setAction({ type: "delete", organization });

	const closeDialog = () => setAction(null);

	return (
		<OrganizationContext.Provider
			value={{
				organizations: organizations ?? [],
				activeOrganization,
				isLoading,
				openCreateDialog,
				openDeleteDialog,
			}}
		>
			{children}

			<CreateOrganizationDialog
				open={action?.type === "create"}
				onOpenChange={(open) => !open && closeDialog()}
			/>

			<LeaveOrganizationDialog
				open={action?.type === "delete"}
				organization={action?.type === "delete" ? action.organization : null}
				onOpenChange={(open) => !open && closeDialog()}
			/>
		</OrganizationContext.Provider>
	);
}
