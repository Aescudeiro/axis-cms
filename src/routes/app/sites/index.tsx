import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreateSiteDialog } from "@/components/create-site-dialog";
import { DeleteSiteDialog } from "@/components/delete-site-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/sites/")({
	component: RouteComponent,
});

const columnHelper = createColumnHelper<Doc<"sites">>();

function RouteComponent() {
	const { organizationId } = useAuth();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [siteToDelete, setSiteToDelete] = useState<Doc<"sites"> | null>(null);

	const { data: sites } = useQuery(
		convexQuery(
			api.sites.getSitesByOrganization,
			organizationId ? { organizationWorkosId: organizationId } : "skip",
		),
	);

	const openDeleteDialog = (site: Doc<"sites">) => {
		setSiteToDelete(site);
		setDeleteDialogOpen(true);
	};

	const columns = [
		columnHelper.accessor("name", {
			header: "Site",
			cell: (info) => (
				<Item size="sm" className="p-0">
					<Avatar className="size-10 rounded-md">
						<AvatarFallback className="rounded-md text-xs">
							<Globe className="size-4" />
						</AvatarFallback>
					</Avatar>
					<Link
						to="/app/sites/$slug"
						params={{ slug: info.row.original.slug }}
						className="hover:underline"
					>
						<ItemContent className="gap-0">
							<ItemTitle>{info.getValue()}</ItemTitle>
							<ItemDescription>/{info.row.original.slug}</ItemDescription>
						</ItemContent>
					</Link>
				</Item>
			),
		}),
		columnHelper.accessor("status", {
			header: "Status",
			cell: (info) => (
				<Badge
					variant={info.getValue() === "published" ? "default" : "secondary"}
				>
					{info.getValue() === "published" ? "Published" : "Draft"}
				</Badge>
			),
		}),
		columnHelper.display({
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: (info) => (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						size="icon"
						className="text-destructive hover:text-destructive"
						onClick={() => openDeleteDialog(info.row.original)}
					>
						<Trash2 className="size-4" />
						<span className="sr-only">Delete</span>
					</Button>
				</div>
			),
		}),
	];

	const table = useReactTable({
		data: sites ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Sites</h1>
					<p className="text-sm text-muted-foreground">
						Manage your sites and content.
					</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)} variant="outline">
					<Plus className="size-4" />
					New site
				</Button>
			</div>

			<div className="rounded-lg border">
				<Table>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="hover:bg-transparent">
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No sites found. Create your first site to get started.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<CreateSiteDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
			<DeleteSiteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				site={siteToDelete}
			/>
		</div>
	);
}
