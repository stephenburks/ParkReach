/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthModal } from '@/components/AuthModal'

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/context/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}))

// Mock MagicLinkForm
vi.mock('@/components/MagicLinkForm', () => ({
	MagicLinkForm: ({ onSent, inputId }: { onSent: (email: string) => void; inputId?: string }) => (
		<form
			data-testid="magic-link-form"
			onSubmit={(e) => {
				e.preventDefault()
				onSent('test@example.com')
			}}
		>
			<input id={inputId} data-testid="email-input" />
			<button type="submit">Send Email Code</button>
		</form>
	),
}))

// Mock useFocusTrap
vi.mock('@/hooks/useFocusTrap', () => ({
	useFocusTrap: () => {},
}))

// Mock next/link
vi.mock('next/link', () => ({
	default: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
		<a href={href}>{children}</a>
	),
}))

describe('AuthModal', () => {
	const onClose = vi.fn()

	beforeEach(() => {
		onClose.mockClear()
		mockUseAuth.mockReturnValue({ supabase: {}, user: null, loading: false })
		Object.defineProperty(document.body, 'style', { value: { overflow: '' }, writable: true })
	})

	it('renders nothing when not open', () => {
		const { container } = render(<AuthModal isOpen={false} onClose={onClose} />)
		expect(container.innerHTML).toBe('')
	})

	it('renders modal when open', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		expect(screen.getByText('Welcome to ParkReach')).toBeInTheDocument()
		expect(
			screen.getByText('Sign in to save parks and plan your visits'),
		).toBeInTheDocument()
	})

	it('renders magic link form when open', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		expect(screen.getByTestId('magic-link-form')).toBeInTheDocument()
	})

	it('shows sent confirmation after submitting email', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		fireEvent.click(screen.getByText('Send Email Code'))
		expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
		expect(screen.getByText('Use different email')).toBeInTheDocument()
	})

	it('can go back to email form from confirmation', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		fireEvent.click(screen.getByText('Send Email Code'))
		fireEvent.click(screen.getByText('Use different email'))
		expect(screen.getByTestId('magic-link-form')).toBeInTheDocument()
	})

	it('calls onClose when close button clicked', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		fireEvent.click(screen.getByLabelText('Close sign in dialog'))
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('calls onClose when backdrop clicked', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		// The backdrop is the first div inside the dialog
		const backdrop = screen.getByRole('dialog').firstElementChild
		if (backdrop) fireEvent.click(backdrop)
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('calls onClose on Escape key', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('has correct ARIA attributes', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		const dialog = screen.getByRole('dialog')
		expect(dialog).toHaveAttribute('aria-modal', 'true')
		expect(dialog).toHaveAttribute('aria-labelledby', 'auth-modal-title')
	})

	it('does not have Google sign-in button', () => {
		render(<AuthModal isOpen={true} onClose={onClose} />)
		expect(screen.queryByText('Continue with Google')).toBeNull()
	})

	it('restores body overflow on close', () => {
		const { rerender } = render(
			<AuthModal isOpen={true} onClose={onClose} />,
		)
		expect(document.body.style.overflow).toBe('hidden')

		rerender(<AuthModal isOpen={false} onClose={onClose} />)
		expect(document.body.style.overflow).toBe('')
	})
})
