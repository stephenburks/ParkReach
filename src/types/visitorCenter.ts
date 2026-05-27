export interface NpsVisitorCenterHours {
	monday: string
	tuesday: string
	wednesday: string
	thursday: string
	friday: string
	saturday: string
	sunday: string
}

export interface NpsVisitorCenterOperatingHours {
	name: string
	description: string
	standardHours: NpsVisitorCenterHours
	exceptions: { name: string; startDate: string; endDate: string; exceptionHours: Partial<NpsVisitorCenterHours> }[]
}

export interface NpsVisitorCenterAddress {
	postalCode: string
	city: string
	stateCode: string
	line1: string
	type: string
	line3: string
	line2: string
}

export interface NpsVisitorCenter {
	id: string
	url: string
	name: string
	parkCode: string
	description: string
	directionsInfo: string
	directionsUrl: string
	operatingHours: NpsVisitorCenterOperatingHours[]
	addresses: NpsVisitorCenterAddress[]
	images: { url: string; altText: string; caption: string }[]
	latitude: string
	longitude: string
}
