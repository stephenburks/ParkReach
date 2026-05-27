export interface NpsNewsRelease {
	id: string
	url: string
	title: string
	abstract: string
	parkCode: string
	image: {
		url: string
		altText: string
	}
	releasedate: string
	relatedParks: Array<{
		states: string
		fullName: string
		url: string
		parkCode: string
		designation: string
		name: string
	}>
	tags: string[]
}
