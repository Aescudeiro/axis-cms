import type { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProviderWithAuthKit } from "@convex-dev/workos";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import {
	AuthKitProvider,
	useAccessToken,
	useAuth,
} from "@workos/authkit-tanstack-react-start/client";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
	convexQueryClient: ConvexQueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootComponent,
});

function App() {
	const { user, loading: isLoading } = useAuth();
	const { getAccessToken: getWorkOSAccessToken } = useAccessToken();
	const { convexQueryClient } = useRouteContext({ from: "__root__" });

	const getAccessToken = async (): Promise<string | null> => {
		const token = await getWorkOSAccessToken();

		if (!token) return null;

		return token;
	};

	return (
		<ConvexProviderWithAuthKit
			client={convexQueryClient.convexClient}
			useAuth={() => ({
				user,
				isLoading,
				getAccessToken,
			})}
		>
			<Outlet />
		</ConvexProviderWithAuthKit>
	);
}

function RootComponent() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<AuthKitProvider>
					<App />
				</AuthKitProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						{
							name: "Tanstack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
