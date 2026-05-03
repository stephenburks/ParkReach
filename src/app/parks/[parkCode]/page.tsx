import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Park } from '@/types/park';
import { DarkModeProvider } from '@/components/DarkModeProvider';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { WishlistButton } from '@/components/WishlistButton';
import { VisitedButton } from '@/components/VisitedButton';
import { AccessibilityInfo } from '@/components/AccessibilityInfo';

interface Props {
  params: Promise<{ parkCode: string }>;
}

async function getPark(parkCode: string): Promise<Park | null> {
  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&fields=images,operatingHours,entranceFees,entrancePasses,activities,topics,directionsUrl,weatherInfo,accessibility`,
    { headers: { 'X-Api-Key': apiKey }, next: { revalidate: 3600 } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0] || null;
}

async function getAmenities(parkCode: string): Promise<string | null> {
  const apiKey = process.env.NPS_API_KEY;
  console.log('[DEBUG] getAmenities called for parkCode:', parkCode);
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://developer.nps.gov/api/v1/amenities/parksplaces?parkCode=${parkCode}&limit=100`,
      { headers: { 'X-Api-Key': apiKey }, next: { revalidate: 3600 } }
    );

    console.log('[DEBUG] amenities API status:', res.status);
    if (!res.ok) return null;
    const data = await res.json();
    console.log('[DEBUG] data.data type:', typeof data.data, Array.isArray(data.data) ? 'array' : 'not array');
    console.log('[DEBUG] data.data length:', data.data?.length);
    console.log('[DEBUG] first item type:', typeof data.data?.[0]);

    // NPS parksplaces returns: { data: [{name, categories, parks}, ...] }
    let amenities = data.data || [];
    console.log('[DEBUG] initial amenities length:', amenities.length);

    // Don't unwrap - the data is already in correct format [{name:..., categories:..., parks:...}, ...]
    console.log('[DEBUG] final amenities length:', amenities.length);
    console.log('[DEBUG] first amenity sample:', JSON.stringify(amenities[0]).slice(0, 200));

    const accessibilityAmenities: string[] = [];

    for (const amenity of amenities) {
      const name = amenity.name || '';
      const categories = amenity.categories || [];
      const parks = amenity.parks || [];

      const isAccessibilityRelated = 
        name.toLowerCase().includes('accessible') ||
        categories.includes('Accessibility');

      if (isAccessibilityRelated) {
        console.log('[DEBUG] found accessibility amenity:', name, 'parks:', parks.length);
        // Find the park in the parks array
        const parkData = parks.find((p: { parkCode: string }) => p.parkCode === parkCode);
        console.log('[DEBUG] parkData:', parkData ? 'found' : 'not found');
        if (parkData?.places && parkData.places.length > 0) {
          const placeNames = parkData.places.map((p: { title: string }) => p.title).join(', ');
          accessibilityAmenities.push(`${name}: ${placeNames}`);
        } else if (parks.length > 0) {
          // Amenity exists but no specific places listed - still worth showing
          accessibilityAmenities.push(`${name}`);
        }
      }
    }

    console.log('[DEBUG] accessibilityAmenities result:', accessibilityAmenities);
    if (accessibilityAmenities.length === 0) return null;
    return accessibilityAmenities.join('\n\n');
  } catch (e) {
    console.log('[DEBUG] error:', e);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { parkCode } = await params;
  const park = await getPark(parkCode);

  if (!park) {
    return { title: 'Park Not Found' };
  }

  return {
    title: `${park.fullName} | National Parks Explorer`,
    description: park.description?.slice(0, 160),
    openGraph: {
      title: park.fullName,
      description: park.description?.slice(0, 160),
      images: park.images?.[0]?.url ? [park.images[0].url] : [],
    },
  };
}

export default async function ParkDetailPage({ params }: Props) {
  const { parkCode } = await params;
  const park = await getPark(parkCode);

  if (!park) {
    notFound();
  }

  const image = park.images[0];
  const states = park.states.split(',').join(', ');
  const amenitiesAccessibility = await getAmenities(parkCode);

  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-park-cream dark:bg-park-bark">
        <header className="bg-park-forest text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-park-cream hover:text-white font-semibold">
                ← Back to Parks
              </Link>
              <DarkModeToggle />
            </div>
          </div>
        </header>

        <div className="relative h-72 sm:h-96">
          {image?.url ? (
            <Image src={image.url} alt={image.altText || park.fullName} fill className="object-cover" priority />
          ) : (
            <div className="flex items-center justify-center h-full bg-park-forest">
              <span className="text-9xl opacity-20">🏔️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-7xl mx-auto">
              {park.designation && (
                <span className="inline-block bg-park-forest/90 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full mb-2">
                  {park.designation}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{park.fullName}</h1>
              <p className="text-park-cream/80 mt-1">{states}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3">
            <WishlistButton parkCode={park.parkCode} />
            <VisitedButton parkCode={park.parkCode} />
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">About</h2>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{park.description}</p>
          </section>

          {(amenitiesAccessibility || park.accessibility) && (
            <AccessibilityInfo accessibility={amenitiesAccessibility || park.accessibility} />
          )}

          {park.weatherInfo && (
            <section>
              <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">Weather</h2>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{park.weatherInfo}</p>
            </section>
          )}

          {park.directionsInfo && (
            <section>
              <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">Getting There</h2>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{park.directionsInfo}</p>
              {park.directionsUrl && (
                <a href={park.directionsUrl} target="_blank" rel="noopener noreferrer" className="text-park-forest hover:underline mt-2 inline-block">
                  Get directions →
                </a>
              )}
            </section>
          )}

          {park.entranceFees?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">Entrance Fees</h2>
              <ul className="space-y-2">
                {park.entranceFees.map((fee, i) => (
                  <li key={i} className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
                    <p className="font-semibold text-park-bark dark:text-park-cream">{fee.title}</p>
                    <p className="text-stone-600 dark:text-stone-400">{fee.description}</p>
                    <p className="text-park-forest font-semibold mt-1">{fee.cost}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {park.operatingHours?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">Hours</h2>
              {park.operatingHours.map((hours, i) => (
                <div key={i} className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700 mb-2">
                  <p className="font-semibold text-park-bark dark:text-park-cream mb-2">{hours.name}</p>
                  {hours.description && <p className="text-stone-600 dark:text-stone-400 mb-2">{hours.description}</p>}
                  {hours.standardHours && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      {Object.entries(hours.standardHours).map(([day, hours]) => (
                        <div key={day} className="capitalize">
                          <span className="font-medium">{day}: </span>
                          <span className="text-stone-600 dark:text-stone-400">{hours}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {park.activities?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">Activities</h2>
              <div className="flex flex-wrap gap-2">
                {park.activities.map((act) => (
                  <span key={act.id} className="bg-park-sage/20 text-park-bark dark:text-park-cream px-3 py-1 rounded-full text-sm">
                    {act.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {park.topics?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {park.topics.map((topic) => (
                  <span key={topic.id} className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-1 rounded-full text-sm">
                    {topic.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {park.url && (
            <section>
              <a href={park.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-park-forest text-white font-semibold rounded-full hover:bg-park-bark transition-colors">
                Visit Official Website →
              </a>
            </section>
          )}
        </main>
      </div>
    </DarkModeProvider>
  );
}