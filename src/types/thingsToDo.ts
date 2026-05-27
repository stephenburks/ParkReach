export interface NpsThingToDo {
	id: string
	url: string
	title: string
	shortDescription: string
	longDescription: string
	duration: string
	fee: string
	feeDescription: string
	doFeesApply: string
	arePetsPermittedWithRestrictions: string
	arePetsPermitted: string
	isReservationRequired: string
	season: string[]
	ages: string[]
	activityDescription: string
	locationDescription: string
	accessibilityInformation: string
	images: { url: string; altText: string; caption: string }[]
	relatedParks: { parkCode: string; fullName: string; url: string }[]
	tags: string[]
}
