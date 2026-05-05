// NPS park codes are 2–5 lowercase letters (e.g. "yose", "grca", "zion")
export function isValidParkCode(parkCode: string): boolean {
	return /^[a-z]{2,5}$/.test(parkCode)
}
