'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Shortcut {
	keys: string;
	description: string;
}

const SHORTCUTS: Shortcut[] = [
	{ keys: '?', description: 'Show/hide this help' },
	{ keys: 'Tab / Shift+Tab', description: 'Navigate between elements' },
	{ keys: 'Enter / Space', description: 'Activate buttons and cards' },
	{ keys: 'Escape', description: 'Close modals and dialogs' },
	{ keys: 'C', description: 'Switch to card view' },
	{ keys: 'M', description: 'Switch to minimal/list view' },
];

const HEADING_ID = 'keyboard-help-heading';

export function KeyboardHelp() {
	const [open, setOpen] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	useFocusTrap(modalRef, open);

	// Global ? key listener — only when no input/textarea/select is focused
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== '?') return;

			const tag = document.activeElement?.tagName?.toLowerCase();
			if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

			// Don't intercept ? inside a contenteditable element
			const editable = document.activeElement as HTMLElement | null;
			if (editable?.isContentEditable) return;

			event.preventDefault();
			setOpen((prev) => !prev);
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	// Close on Escape when modal is open
	useEffect(() => {
		if (!open) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				setOpen(false);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [open]);

	// Focus management: save previous, focus close button, lock scroll
	useEffect(() => {
		if (open) {
			previousFocusRef.current = document.activeElement as HTMLElement | null;
			// Small delay ensures modal is in the DOM before focusing
			requestAnimationFrame(() => {
				closeButtonRef.current?.focus();
			});
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			// Restore focus to the element that was focused before the modal opened
			previousFocusRef.current?.focus();
			previousFocusRef.current = null;
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	const handleBackdropClick = useCallback(() => setOpen(false), []);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby={HEADING_ID}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={handleBackdropClick}
				aria-hidden="true"
			/>

			{/* Modal panel */}
			<div
				ref={modalRef}
				className="relative z-10 w-full max-w-md bg-park-cream dark:bg-stone-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-5">
					<div className="flex items-center gap-2.5">
						<Keyboard
							className="h-5 w-5 text-park-forest dark:text-park-sage"
							aria-hidden="true"
						/>
						<h2
							id={HEADING_ID}
							className="text-lg font-bold text-park-bark dark:text-park-cream"
						>
							Keyboard Shortcuts
						</h2>
					</div>
					<button
						ref={closeButtonRef}
						onClick={() => setOpen(false)}
						className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-park-forest"
						aria-label="Close keyboard shortcuts"
					>
						<X className="h-4 w-4 text-stone-600 dark:text-stone-400" />
					</button>
				</div>

				{/* Shortcuts list */}
				<ul className="space-y-1" role="list">
					{SHORTCUTS.map((shortcut) => (
						<li
							key={shortcut.keys}
							className="flex items-center justify-between gap-4 py-2.5 border-b border-stone-200 dark:border-stone-700 last:border-b-0"
						>
							<span className="text-sm text-stone-700 dark:text-stone-300">
								{shortcut.description}
							</span>
							<kbd className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-xs font-mono font-medium text-park-bark dark:text-park-cream whitespace-nowrap flex-shrink-0">
								{shortcut.keys}
							</kbd>
						</li>
					))}
				</ul>

				<p className="mt-4 text-xs text-stone-500 dark:text-stone-400 text-center">
					Press <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-700 font-mono text-[10px]">?</kbd> or <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-700 font-mono text-[10px]">Esc</kbd> to close
				</p>
			</div>
		</div>
	);
}
