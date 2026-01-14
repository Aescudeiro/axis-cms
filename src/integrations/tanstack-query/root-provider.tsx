import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProviderWithAuthKit } from "@convex-dev/workos";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	useAccessToken,
	useAuth as useWorkOSAuth,
} from "@workos/authkit-tanstack-react-start/client";
import { env } from "@/env";

const useAuth = () => {
	const { user, loading } = useWorkOSAuth();
	const { getAccessToken: getWorkOSAccessToken } = useAccessToken();

	const getAccessToken = async (): Promise<string | null> => {
		const token = await getWorkOSAccessToken();

		if (!token) return null;

		return token;
	};

	return { user, isLoading: loading, getAccessToken };
};

export function getContext() {
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

export function Provider({
	children,
	queryClient,
	convexQueryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
	convexQueryClient: ConvexQueryClient;
}) {
	return (
		<ConvexProviderWithAuthKit
			client={convexQueryClient.convexClient}
			useAuth={useAuth}
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ConvexProviderWithAuthKit>
	);
}
