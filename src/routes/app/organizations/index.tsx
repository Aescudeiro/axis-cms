import { createFileRoute } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { Doc } from "convex/_generated/dataModel";
import { Plus } from "lucide-react";
import { useOrganization } from "@/components/organization-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/organizations/")({
	component: RouteComponent,
	loader: () => ({
		crumb: "Organizations",
	}),
});

const columnHelper = createColumnHelper<Doc<"organizations">>();

function RouteComponent() {
	const { organizations, openCreateDialog, openDeleteDialog } =
		useOrganization();

	const columns = [
		columnHelper.accessor("name", {
			header: "Organization",
			cell: (info) => (
				<div className="flex items-center gap-3">
					<Avatar className="size-8 rounded-md">
						<AvatarFallback className="rounded-md text-xs">
							{info.getValue().split(" ")?.[0]?.charAt(0)}
							{info.getValue().split(" ")?.[1]?.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<span className="font-medium">{info.getValue()}</span>
				</div>
			),
		}),
		columnHelper.display({
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: (info) => (
				<div className="flex justify-end">
					<Button
						variant="outline"
						size="sm"
						className="text-destructive hover:text-destructive"
						onClick={() => openDeleteDialog(info.row.original)}
					>
						Leave
					</Button>
				</div>
			),
		}),
	];

	const table = useReactTable({
		data: organizations,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Organizations
					</h1>
					<p className="text-sm text-muted-foreground">
						Manage your organizations and team access.
					</p>
				</div>
				<Button onClick={openCreateDialog} variant="outline">
					<Plus className="size-4" />
					New organization
				</Button>
			</div>

			<div className="rounded-lg border">
				<Table>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
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
									No organizations found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
