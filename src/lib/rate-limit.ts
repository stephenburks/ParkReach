import { Redis } from '@upstash/redis'

const redis = new Redis({
	url: process.env.KV_REST_API_URL!,
	token: process.env.KV_REST_API_TOKEN!,
})

export async function checkRateLimit(
	ip: string,
	limit: number = 10,
	windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number }> {
	const key = `rl:${ip}`
	const windowSecs = Math.ceil(windowMs / 1000)

	const count = await redis.incr(key)
	if (count === 1) {
		await redis.expire(key, windowSecs)
	}

	const remaining = Math.max(0, limit - count)
	return { allowed: count <= limit, remaining }
}
