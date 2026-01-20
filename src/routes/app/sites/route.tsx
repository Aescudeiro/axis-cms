import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/sites")({
	loader: () => ({
		crumb: "Sites",
	}),
});
