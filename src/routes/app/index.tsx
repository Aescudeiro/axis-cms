import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/app/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useQuery(convexQuery(api.todos.list, {}));

	console.log("🚀 ~ RouteComponent ~ data:", data);

	return <div>Hello "/app/"!</div>;
}
