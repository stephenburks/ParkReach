import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
	message: string
}

export function ErrorState({ message }: ErrorStateProps) {
	return (
		<div
			role="alert"
			className="flex flex-col items-center justify-center py-24 text-center"
		>
			<AlertTriangle className="mb-4 h-12 w-12 opacity-30 text-park-stone" aria-hidden="true" />
			<p className="text-lg font-medium text-park-bark dark:text-park-cream">
				Something went wrong
			</p>
			<p className="text-sm text-stone-500 mt-2">{message}</p>
		</div>
	)
}
