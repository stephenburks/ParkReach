import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
	className,
	...props
}: CheckboxPrimitive.Root.Props) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				'peer inline-flex size-4 shrink-0 items-center justify-center rounded border',
				'border-stone-300 dark:border-stone-600',
				'bg-white dark:bg-stone-800',
				'text-park-cream',
				'transition-colors',
				'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-park-sage/50',
				'data-[checked]:border-park-forest data-[checked]:bg-park-forest',
				'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				'aria-[invalid]:border-destructive aria-[invalid]:ring-3 aria-[invalid]:ring-destructive/20',
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				className="flex items-center justify-center text-current transition-all data-[starting-style]:scale-0 data-[ending-style]:scale-100"
			>
				<Check className="size-3" strokeWidth={3} />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	)
}

export { Checkbox }
