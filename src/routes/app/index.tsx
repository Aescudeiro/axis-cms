import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
	component: RouteComponent,
	loader: () => ({
		crumb: "Dashboard",
	}),
});

function RouteComponent() {
	return <div>Hello "/app/"!</div>;
}
