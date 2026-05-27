export interface NpsAlert {
	id: string
	url: string
	title: string
	parkCode: string
	description: string
	category: 'Danger' | 'Caution' | 'Information' | 'Park Closure'
	lastIndexedDate: string
}
