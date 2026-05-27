const requests = new Map<string, { count: number; resetAt: number }>()

const CLEANUP_INTERVAL = 5 * 60 * 1000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function startCleanup() {
	if (cleanupTimer) return
	cleanupTimer = setInterval(() => {
		const now = Date.now()
		for (const [key, record] of requests) {
			if (now > record.resetAt) requests.delete(key)
		}
	}, CLEANUP_INTERVAL)
}

export function checkRateLimit(
	ip: string,
	limit: number = 10,
	windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
	startCleanup()

	const now = Date.now()
	const record = requests.get(ip)

	if (!record || now > record.resetAt) {
		requests.set(ip, { count: 1, resetAt: now + windowMs })
		return { allowed: true, remaining: limit - 1 }
	}

	if (record.count >= limit) {
		return { allowed: false, remaining: 0 }
	}

	record.count++
	return { allowed: true, remaining: limit - record.count }
}
