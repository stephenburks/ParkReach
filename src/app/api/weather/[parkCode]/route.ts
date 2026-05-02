import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ parkCode: string }> }) {
  const { parkCode } = await params;

  // Placeholder - weather API needs real implementation
  // Could use OpenWeatherMap, WeatherAPI, or NPS alerts
  const weather = {
    parkCode,
    conditions: 'Unknown',
    temperature: null,
    forecast: 'Visit the park website for current conditions.',
  };

  return NextResponse.json(weather);
}