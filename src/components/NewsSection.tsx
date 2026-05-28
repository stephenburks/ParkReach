'use client';

import { useQuery } from '@tanstack/react-query';
import { Newspaper } from 'lucide-react';
import type { NpsNewsRelease } from '@/types/news';

function NewsSkeleton() {
	return (
		<>
			<p className="sr-only" role="status">
				Loading recent news…
			</p>
			<div
				className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
				aria-hidden="true"
			>
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 motion-safe:animate-pulse"
					>
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-full w-3/4 mb-3" />
						<div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full w-1/3 mb-3" />
						<div className="space-y-1.5">
							<div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full" />
							<div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full w-5/6" />
							<div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full w-2/3" />
						</div>
					</div>
				))}
			</div>
		</>
	);
}

function formatDate(dateStr: string): string {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return '';
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

const HEADING_ID = 'recent-news-heading';

export function NewsSection({ parkCode }: { parkCode: string }) {
	const { data, isLoading, isError } = useQuery<NpsNewsRelease[]>({
		queryKey: ['news', parkCode],
		queryFn: async () => {
			const res = await fetch(`/api/news?parkCode=${parkCode}`);
			if (!res.ok) throw new Error('Failed to fetch news');
			const json = await res.json();
			return json.data ?? [];
		},
		staleTime: 6 * 60 * 60 * 1000,
		enabled: Boolean(parkCode),
	});

	if (isLoading) {
		return (
			<section id="news" aria-labelledby={HEADING_ID} className="scroll-mt-24">
				<div className="flex items-center gap-2 mb-4">
					<Newspaper
						className="h-5 w-5 text-park-forest dark:text-park-sage"
						aria-hidden="true"
					/>
					<h2
						id={HEADING_ID}
						className="text-xl font-bold text-park-bark dark:text-park-cream"
					>
						Recent News
					</h2>
				</div>
				<NewsSkeleton />
			</section>
		);
	}

	if (isError || !data?.length) return null;

	return (
		<section id="news" aria-labelledby={HEADING_ID} className="scroll-mt-24">
			<div className="flex items-center gap-2 mb-4">
				<Newspaper
					className="h-5 w-5 text-park-forest dark:text-park-sage"
					aria-hidden="true"
				/>
				<h2
					id={HEADING_ID}
					className="text-xl font-bold text-park-bark dark:text-park-cream"
				>
					Recent News
				</h2>
			</div>
			<ul
				className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
				role="list"
			>
				{data.slice(0, 6).map((newsItem) => {
					const releaseDate = formatDate(newsItem.releasedate);

					return (
						<li
							key={newsItem.id}
							className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 hover:shadow-md transition-shadow"
						>
							<a
								href={newsItem.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-park-forest dark:text-park-sage hover:underline font-semibold text-sm"
							>
								{newsItem.title}
							</a>
							{releaseDate && (
								<p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
									{releaseDate}
								</p>
							)}
							{newsItem.abstract && (
								<p className="mt-2 text-sm text-stone-700 dark:text-stone-300 line-clamp-3">
									{newsItem.abstract}
								</p>
							)}
						</li>
					);
				})}
			</ul>
		</section>
	);
}
