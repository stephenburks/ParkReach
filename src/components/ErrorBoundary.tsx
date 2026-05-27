'use client'

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(): State {
		return { hasError: true }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, info)
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}
			return (
				<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
					<p className="text-lg font-semibold text-park-bark dark:text-park-cream">
						Something went wrong
					</p>
					<button
						onClick={() => {
							this.setState({ hasError: false })
							window.location.reload()
						}}
						className="px-6 py-2.5 bg-park-forest text-white font-semibold rounded-full text-sm hover:bg-park-bark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest"
					>
						Reload page
					</button>
				</div>
			)
		}

		return this.props.children
	}
}
