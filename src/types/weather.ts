export interface NwsPoint {
	properties: {
		forecast: string;
	};
}

export interface NwsForecastPeriod {
	name: string;
	temperature: number;
	shortForecast: string;
	detailedForecast: string;
}

export interface NwsForecast {
	properties: {
		periods: NwsForecastPeriod[];
	};
}

export interface WeatherData {
	parkCode: string;
	conditions: string;
	temperature: string;
	forecast: string;
}