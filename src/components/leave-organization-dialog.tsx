import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useAction } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface LeaveOrganizationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organization: Doc<"organizations"> | null;
}

export function LeaveOrganizationDialog({
	open,
	onOpenChange,
	organization,
}: LeaveOrganizationDialogProps) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { organizationId, switchToOrganization } = useAuth();
	const leaveOrganization = useAction(api.auth.leaveOrganization);
	const [isLeaving, setIsLeaving] = useState(false);

	const handleLeave = async () => {
		if (!organization) return;

		setIsLeaving(true);

		try {
			await leaveOrganization({ organizationId: organization.workosId });

			// If we're leaving the active organization, switch to another one
			if (organization.workosId === organizationId) {
				await switchToOrganization("");
			}

			await queryClient.invalidateQueries();
			router.invalidate();
			onOpenChange(false);
		} finally {
			setIsLeaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Leave organization</DialogTitle>
					<DialogDescription>
						Are you sure you want to leave{" "}
						<span className="font-medium text-foreground">
							{organization?.name}
						</span>
						? You will lose access to all resources in this organization.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleLeave}
						disabled={isLeaving}
					>
						{isLeaving ? "Leaving..." : "Leave organization"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
