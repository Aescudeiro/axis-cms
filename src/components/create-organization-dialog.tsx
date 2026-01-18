import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const createOrganizationSchema = z.object({
	name: z.string().min(1, "Organization name is required"),
});

interface CreateOrganizationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({
	open,
	onOpenChange,
}: CreateOrganizationDialogProps) {
	const router = useRouter();
	const { switchToOrganization } = useAuth();
	const createOrganization = useAction(api.auth.createOrganization);

	const form = useForm({
		defaultValues: {
			name: "",
		},
		onSubmit: async ({ value }) => {
			const org = await createOrganization({ name: value.name });

			await switchToOrganization(org.id);

			router.invalidate();

			onOpenChange(false);

			form.reset();
		},
		validators: {
			onChange: createOrganizationSchema,
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Organization</DialogTitle>
					<DialogDescription>
						Create a new organization to collaborate with your team.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<div className="grid gap-4 py-4">
						<form.Field name="name">
							{(field) => (
								<div className="grid gap-2">
									<label htmlFor={field.name} className="text-sm font-medium">
										Organization Name
									</label>
									<Input
										id={field.name}
										placeholder="Acme Inc."
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={form.state.isSubmitting}>
							{form.state.isSubmitting ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
