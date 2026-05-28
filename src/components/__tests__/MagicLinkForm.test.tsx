/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MagicLinkForm } from '@/components/MagicLinkForm'

const mockUseAuth = vi.fn()
vi.mock('@/context/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}))

describe('MagicLinkForm', () => {
	const onSent = vi.fn()
	beforeEach(() => {
		onSent.mockClear()
		mockUseAuth.mockReturnValue({
			supabase: {
				auth: {
					signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
				},
			},
		})
		// Stub location.origin for redirectTo URL
		Object.defineProperty(window, 'location', {
			value: { origin: 'http://localhost:3000' },
			writable: true,
		})
	})

	function getForm(): HTMLFormElement {
		return document.querySelector('form') as HTMLFormElement
	}

	function getEmailInput() {
		return screen.getByPlaceholderText('your@email.com')
	}

	it('renders email input and submit button', () => {
		render(<MagicLinkForm onSent={onSent} />)
		expect(getEmailInput()).toBeInTheDocument()
		expect(screen.getByText('Send Email Code')).toBeInTheDocument()
	})

	it('has email input with correct attributes', () => {
		render(<MagicLinkForm onSent={onSent} />)
		const input = getEmailInput()
		expect(input).toHaveAttribute('id', 'magic-link-email')
		expect(input).toHaveAttribute('type', 'email')
		expect(input).toBeRequired()
	})

	it('has a screen-reader label on the input', () => {
		render(<MagicLinkForm onSent={onSent} />)
		const label = document.querySelector('label[for="magic-link-email"]')
		expect(label).toBeInTheDocument()
		expect(label).toHaveTextContent('Email address')
	})

	it('shows error for invalid email', () => {
		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.change(getEmailInput(), { target: { value: 'not-an-email' } })
		fireEvent.submit(getForm())
		expect(
			screen.getByText('Please enter a valid email address.'),
		).toBeInTheDocument()
	})

	it('shows error with role alert', () => {
		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.change(getEmailInput(), { target: { value: 'invalid' } })
		fireEvent.submit(getForm())
		expect(screen.getByRole('alert')).toBeInTheDocument()
	})

	it('calls onSent with valid email', async () => {
		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.change(getEmailInput(), { target: { value: 'test@example.com' } })
		fireEvent.submit(getForm())
		await waitFor(() => {
			expect(onSent).toHaveBeenCalledWith('test@example.com')
		})
	})

	it('shows loading state when submitting', async () => {
		mockUseAuth.mockReturnValue({
			supabase: {
				auth: {
					signInWithOtp: () =>
						new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)),
				},
			},
		})

		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.change(getEmailInput(), { target: { value: 'test@example.com' } })
		fireEvent.submit(getForm())

		// The button text "Send Email Code" should be replaced by spinner
		await waitFor(() => {
			expect(screen.queryByText('Send Email Code')).toBeNull()
		})
	})

	it('handles Supabase error', async () => {
		mockUseAuth.mockReturnValue({
			supabase: {
				auth: {
					signInWithOtp: vi
						.fn()
						.mockResolvedValue({ error: { message: 'Rate limited' } }),
				},
			},
		})

		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.change(getEmailInput(), { target: { value: 'test@example.com' } })
		fireEvent.submit(getForm())
		expect(
			await screen.findByText('Failed to send email — please try again.'),
		).toBeInTheDocument()
	})

	it('handles network error', async () => {
		mockUseAuth.mockReturnValue({
			supabase: {
				auth: {
					signInWithOtp: vi
						.fn()
						.mockRejectedValue(new Error('Network error')),
				},
			},
		})

		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.change(getEmailInput(), { target: { value: 'test@example.com' } })
		fireEvent.submit(getForm())
		expect(
			await screen.findByText('Failed to send email — please try again.'),
		).toBeInTheDocument()
	})

	it('clears error when email changes', () => {
		render(<MagicLinkForm onSent={onSent} />)
		const input = getEmailInput()
		fireEvent.change(input, { target: { value: 'invalid' } })
		fireEvent.submit(getForm())
		expect(screen.getByRole('alert')).toBeInTheDocument()

		fireEvent.change(input, { target: { value: 'test@example.com' } })
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('uses custom inputId', () => {
		render(<MagicLinkForm onSent={onSent} inputId="custom-id" />)
		expect(screen.getByPlaceholderText('your@email.com')).toHaveAttribute(
			'id',
			'custom-id',
		)
	})

	it('does not call onSent when supabase is not available', () => {
		mockUseAuth.mockReturnValue({ supabase: null })

		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.change(getEmailInput(), { target: { value: 'test@example.com' } })
		fireEvent.submit(getForm())
		expect(onSent).not.toHaveBeenCalled()
	})

	it('does nothing on submit with empty email', () => {
		render(<MagicLinkForm onSent={onSent} />)
		fireEvent.submit(getForm())
		expect(onSent).not.toHaveBeenCalled()
	})
})
