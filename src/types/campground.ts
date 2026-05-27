export interface NpsCampgroundAccessibility {
	wheelchairAccess: string
	fireStovePolicy: string
	rVAllowed: string
	rVInfo: string
	additionalInfo: string
	numberOfSitesReservable: string
}

export interface NpsCampgroundAmenities {
	trashRecyclingCollection: string
	toilets: string[]
	internetConnectivity: string
	showers: string[]
	cellPhoneReception: string
	laundry: string
	amphitheater: string
	dumpStation: string
	campStore: string
	staffOrVolunteerHostOnsite: string
	potableWater: string[]
	iceAvailableForSale: string
	firewoodForSale: string
	foodStorageLockers: string
}

export interface NpsCampground {
	id: string
	url: string
	name: string
	parkCode: string
	description: string
	numberOfSitesReservable: string
	numberOfSitesFirstComeFirstServe: string
	reservationUrl: string
	accessibility: NpsCampgroundAccessibility
	amenities: NpsCampgroundAmenities
	directionsOverview: string
	directionsUrl: string
	images: { url: string; altText: string; caption: string }[]
	latitude: string
	longitude: string
}
