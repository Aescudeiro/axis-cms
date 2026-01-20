import { isMatch, Link, useMatches } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs() {
	const matches = useMatches();

	const matchesWithCrumbs = matches.filter((match) =>
		isMatch(match, "loaderData.crumb"),
	);

	const breadcrumbs = matchesWithCrumbs.map(({ pathname, loaderData }) => {
		return {
			href: pathname,
			label: loaderData?.crumb,
		};
	});

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map((breadcrumb, index) => {
					const isLast = index === breadcrumbs.length - 1;

					return (
						<Fragment key={breadcrumb.href}>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link
										to={breadcrumb.href}
										disabled={index === breadcrumbs.length - 1}
									>
										{breadcrumb.label}
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
