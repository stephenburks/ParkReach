export interface NpsEventTime {
	datestart: string
	dateend: string
	recurrencerule: string
	sunrisetime: string
	sunsettime: string
	isallday: string
	isbeginningunknown: string
	isendunknown: string
}

export interface NpsEvent {
	id: string
	url: string
	title: string
	description: string
	datestart: string
	dateend: string
	times: NpsEventTime[]
	category: string
	feeinfo: string
	isrecurring: string
	contacttelephonenumber: string
	contactemailaddress: string
	isregresrequired: string
	location: string
	types: string[]
	images: { url: string; altText: string; caption: string }[]
	parkCode: string
}
