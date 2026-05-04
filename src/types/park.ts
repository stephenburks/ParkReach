export interface ParkImage {
  credit: string;
  title: string;
  altText: string;
  caption: string;
  url: string;
}

export interface ParkActivity {
  id: string;
  name: string;
}

export interface ParkFee {
  cost: string;
  description: string;
  title: string;
}

export interface ParkHours {
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

export interface ParkOperatingHours {
  exceptions: Array<{ startDate: string; endDate: string; description: string; name: string; exceptionHours: Partial<ParkHours> }>;
  description: string;
  standardHours: ParkHours;
  name: string;
}

export interface Park {
  id: string;
  url: string;
  fullName: string;
  parkCode: string;
  description: string;
  latitude: string;
  longitude: string;
  activities: ParkActivity[];
  topics: ParkActivity[];
  states: string;
  entranceFees: ParkFee[];
  entrancePasses: ParkFee[];
  operatingHours: ParkOperatingHours[];
  images: ParkImage[];
  weatherInfo: string;
  name: string;
  designation: string;
  directionsInfo: string;
  directionsUrl: string;
  accessibility?: string;
}

export interface NpsApiResponse {
  total: string;
  limit: string;
  start: string;
  data: Park[];
}
