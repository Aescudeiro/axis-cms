import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { env } from "./env";
import { routeTree } from "./routeTree.gen";

function getContext() {
	const convexQueryClient = new ConvexQueryClient(env.VITE_CONVEX_URL);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});

	convexQueryClient.connect(queryClient);

	return {
		queryClient,
		convexQueryClient,
	};
}

export const getRouter = () => {
	const rqContext = getContext();

	const router = createRouter({
		routeTree,
		context: { ...rqContext },
		defaultPreload: "intent",
		Wrap: (props: { children: React.ReactNode }) => {
			return (
				<QueryClientProvider client={rqContext.queryClient}>
					{props.children}
				</QueryClientProvider>
			);
		},
		defaultNotFoundComponent: () => <div>Not Found</div>,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient: rqContext.queryClient,
	});

	return router;
};
