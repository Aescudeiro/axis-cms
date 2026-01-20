import { useForm } from "@tanstack/react-form";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import slugify from "slugify";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const siteStatusSchema = z.union([z.literal("draft"), z.literal("published")]);

type Status = z.infer<typeof siteStatusSchema>;

const createSiteSchema = z.object({
	name: z.string().min(1, "Site name is required"),
	slug: z
		.string()
		.min(1, "Slug is required")
		.regex(
			/^[a-z0-9-]+$/,
			"Slug must be lowercase letters, numbers, and hyphens only",
		),
	description: z.string(),
	status: siteStatusSchema,
});

interface CreateSiteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateSiteDialog({
	open,
	onOpenChange,
}: CreateSiteDialogProps) {
	const router = useRouter();
	const navigate = useNavigate();
	const { organizationId } = useAuth();
	const createSite = useMutation(api.sites.createSite);

	const form = useForm({
		validators: {
			onChange: createSiteSchema,
		},
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			status: "draft" as Status,
		},
		onSubmit: async ({ value }) => {
			if (!organizationId) return;

			await createSite({
				organizationWorkosId: organizationId,
				name: value.name,
				slug: value.slug,
				description: value.description || undefined,
				status: value.status,
			});

			router.invalidate();

			onOpenChange(false);

			form.reset();

			navigate({ to: "/app/sites/$slug", params: { slug: value.slug } });
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Site</DialogTitle>
					<DialogDescription>
						Create a new site to start building your content.
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
										Site Name
									</label>
									<Input
										id={field.name}
										placeholder="My Blog"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => {
											field.handleChange(e.target.value);

											form.setFieldValue(
												"slug",
												slugify(e.target.value, {
													lower: true,
												}),
											);
										}}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="slug">
							{(field) => (
								<div className="grid gap-2">
									<label htmlFor={field.name} className="text-sm font-medium">
										Slug
									</label>
									<Input
										id={field.name}
										placeholder="my-blog"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">
										URL-friendly identifier for your site
									</p>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div className="grid gap-2">
									<label htmlFor={field.name} className="text-sm font-medium">
										Description{" "}
										<span className="text-muted-foreground">(optional)</span>
									</label>
									<Input
										id={field.name}
										placeholder="A brief description of your site"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="status">
							{(field) => (
								<div className="grid gap-2">
									<label htmlFor={field.name} className="text-sm font-medium">
										Status
									</label>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as "draft" | "published")
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="published">Published</SelectItem>
										</SelectContent>
									</Select>
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
