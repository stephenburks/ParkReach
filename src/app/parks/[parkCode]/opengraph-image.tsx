import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

interface Props {
	params: Promise<{ parkCode: string }>
}

async function getParkForOg(parkCode: string) {
	const apiKey = process.env.NPS_API_KEY
	if (!apiKey) return null

	try {
		const res = await fetch(
			`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&fields=images`,
			{ headers: { 'X-Api-Key': apiKey }, next: { revalidate: 86400 } },
		)
		if (!res.ok) return null
		const data = await res.json()
		return data.data?.[0] ?? null
	} catch {
		return null
	}
}

export default async function OgImage({ params }: Props) {
	const { parkCode } = await params
	const park = await getParkForOg(parkCode)

	const name = park?.fullName ?? 'National Park'
	const designation = park?.designation ?? ''
	const heroUrl = park?.images?.[0]?.url ?? null

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
				fontFamily: 'sans-serif',
				backgroundColor: '#1c1917',
			}}
		>
			{/* Hero image */}
			{heroUrl && (
				<img
					src={heroUrl}
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						opacity: 0.45,
					}}
				/>
			)}

			{/* Dark gradient overlay */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%)',
				}}
			/>

			{/* Content */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					padding: '48px 56px',
					display: 'flex',
					flexDirection: 'column',
					gap: '12px',
				}}
			>
				{/* Brand */}
				<div
					style={{
						fontSize: 18,
						fontWeight: 600,
						color: '#86efac',
						letterSpacing: '0.05em',
						textTransform: 'uppercase',
					}}
				>
					ParkReach
				</div>

				{/* Designation badge */}
				{designation && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<span
							style={{
								fontSize: 16,
								fontWeight: 600,
								color: '#fff',
								backgroundColor: 'rgba(134,239,172,0.2)',
								border: '1px solid rgba(134,239,172,0.4)',
								borderRadius: 999,
								padding: '4px 14px',
							}}
						>
							{designation}
						</span>
					</div>
				)}

				{/* Park name */}
				<div
					style={{
						fontSize: name.length > 40 ? 52 : 64,
						fontWeight: 700,
						color: '#fff',
						lineHeight: 1.1,
						letterSpacing: '-0.02em',
					}}
				>
					{name}
				</div>
			</div>
		</div>,
		size,
	)
}
