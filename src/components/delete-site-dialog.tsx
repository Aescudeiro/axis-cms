import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface DeleteSiteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	site: Doc<"sites"> | null;
}

export function DeleteSiteDialog({
	open,
	onOpenChange,
	site,
}: DeleteSiteDialogProps) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const deleteSite = useMutation(api.sites.deleteSite);
	const [isDeleting, setIsDeleting] = useState(false);

	const [cachedSite, setCachedSite] = useState<Doc<"sites"> | null>(null);

	useEffect(() => {
		if (site) {
			setCachedSite(site);
		}
	}, [site]);

	const displaySite = site ?? cachedSite;

	const handleDelete = async () => {
		if (!displaySite) return;

		setIsDeleting(true);

		try {
			await deleteSite({ siteId: displaySite._id });

			await queryClient.invalidateQueries();
			router.invalidate();
			onOpenChange(false);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete site</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete{" "}
						<span className="font-medium text-foreground">
							{displaySite?.name}
						</span>
						? This action cannot be undone and all content will be permanently
						lost.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete site"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
