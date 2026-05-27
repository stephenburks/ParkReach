import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Park } from "@/types/park";
import { fetchPark } from "@/lib/nps";
import { formatStates } from "@/components/park-card-utils";

import { WishlistButton } from "@/components/WishlistButton";
import { VisitedButton } from "@/components/VisitedButton";
import { AccessibilityInfo } from "@/components/AccessibilityInfo";
import { WeatherWidget } from "@/components/WeatherWidget";
import { DistanceBadge } from "@/components/DistanceBadge";
import { AlertBanner } from "@/components/AlertBanner";
import { ThingsToDo } from "@/components/ThingsToDo";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { Campgrounds } from "@/components/Campgrounds";
import { VisitorCenters } from "@/components/VisitorCenters";
import { HeaderControls } from "@/components/HeaderControls";
import { NewsSection } from "@/components/NewsSection";
import { Mountain } from "lucide-react";

const BASE_URL = "https://parkreach.app";

interface Props {
  params: Promise<{ parkCode: string }>;
}

async function getAmenities(parkCode: string): Promise<string | null> {
  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://developer.nps.gov/api/v1/amenities/parksplaces?parkCode=${parkCode}&limit=100`,
      { headers: { "X-Api-Key": apiKey }, next: { revalidate: 3600 } },
    );

    if (!res.ok) return null;
    const data = await res.json();

    // NPS parksplaces returns: { data: [{name, categories, parks}, ...] }
    const amenities: Array<{
      name: string;
      categories: string[];
      parks: Array<{ parkCode: string; places: Array<{ title: string }> }>;
    }> = data.data ?? [];

    const accessibilityAmenities: string[] = [];

    for (const amenity of amenities) {
      const name = amenity.name ?? "";
      const categories = amenity.categories ?? [];
      const parks = amenity.parks ?? [];

      const isAccessibilityRelated =
        name.toLowerCase().includes("accessible") ||
        categories.includes("Accessibility");

      if (isAccessibilityRelated) {
        const parkData = parks.find((park) => park.parkCode === parkCode);
        if (parkData?.places && parkData.places.length > 0) {
          const placeNames = parkData.places.map((place) => place.title).join(", ");
          accessibilityAmenities.push(`${name}: ${placeNames}`);
        } else if (parks.length > 0) {
          accessibilityAmenities.push(name);
        }
      }
    }

    return accessibilityAmenities.length > 0
      ? accessibilityAmenities.join("\n\n")
      : null;
  } catch {
    return null;
  }
}

interface ParkHeroProps {
  park: Park;
  states: string;
}

function ParkHero({ park, states }: ParkHeroProps) {
  const image = park.images[0];
  return (
    <div className="relative h-72 sm:h-96">
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.altText || park.fullName}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-park-forest">
          <Mountain className="h-16 w-16 text-white/20" aria-hidden="true" />
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {park.fullName}
          </h1>
          <p className="text-park-cream/80 mt-1">{states}</p>
        </div>
      </div>
    </div>
  );
}

interface ParkActionsProps {
  parkCode: string;
  npsUrl: string;
}

function ParkActions({ parkCode, npsUrl }: ParkActionsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <WishlistButton parkCode={parkCode} />
        <VisitedButton parkCode={parkCode} />
        {npsUrl && (
          <a
            href={npsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-park-forest text-white font-semibold rounded-full hover:bg-park-bark transition-colors text-sm"
          >
            Visit Official Website →
          </a>
        )}
      </div>
    </div>
  );
}

function FeesSection({ park }: { park: Park }) {
  if (!park.entranceFees?.length) {
    return (
      <section>
        <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
          Entrance Fees
        </h2>
        <p className="text-stone-600 dark:text-stone-400">Free to Visit</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
        Entrance Fees
      </h2>
      <ul className="space-y-2">
        {park.entranceFees.map((fee, index) => (
          <li
            key={index}
            className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700"
          >
            <p className="font-semibold text-park-bark dark:text-park-cream">
              {fee.title}
            </p>
            <p className="text-stone-600 dark:text-stone-400">
              {fee.description}
            </p>
            <p className="text-park-forest font-semibold mt-1">
              {fee.cost}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HoursSection({ hours }: { hours: Park['operatingHours'] }) {
  if (!hours?.length) return null;
  return (
    <section>
      <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
        Hours
      </h2>
      {hours.map((entry, index) => (
        <div
          key={index}
          className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700 mb-2"
        >
          <p className="font-semibold text-park-bark dark:text-park-cream mb-2">
            {entry.name}
          </p>
          {entry.description && (
            <p className="text-stone-600 dark:text-stone-400 mb-2">
              {entry.description}
            </p>
          )}
          {entry.standardHours && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.entries(entry.standardHours).map(([day, val]) => (
                <div key={day} className="capitalize">
                  <span className="font-medium">{day}: </span>
                  <span className="text-stone-600 dark:text-stone-400">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

interface ParkInfoGridProps {
  park: Park;
  amenitiesAccessibility: string | null;
  parkCode: string;
}

function ParkInfoGrid({ park, amenitiesAccessibility, parkCode }: ParkInfoGridProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
          About
        </h2>
        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
          {park.description}
        </p>
      </section>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <WeatherWidget parkCode={park.parkCode} />
        </div>
        <DistanceBadge
          parkCode={park.parkCode}
          latitude={park.latitude}
          longitude={park.longitude}
        />
      </div>

      {(amenitiesAccessibility || park.accessibility) && (
        <AccessibilityInfo
          accessibility={amenitiesAccessibility || park.accessibility}
        />
      )}

      {park.directionsInfo && (
        <section>
          <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
            Getting There
          </h2>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            {park.directionsInfo}
          </p>
          {park.directionsUrl && (
            <a
              href={park.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-park-forest hover:underline mt-2 inline-block"
            >
              Get directions →
            </a>
          )}
        </section>
      )}

      <FeesSection park={park} />
      <HoursSection hours={park.operatingHours} />
		<ThingsToDo parkCode={parkCode} />

			{park.activities?.length > 0 && (
				<section>
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
						Activities
					</h2>
					<div className="flex flex-wrap gap-2">
						{park.activities.map((activity) => (
							<span
								key={activity.id}
								className="bg-park-sage/20 text-park-bark dark:text-park-cream px-3 py-1 rounded-full text-sm"
							>
								{activity.name}
							</span>
						))}
					</div>
				</section>
			)}

			<UpcomingEvents parkCode={parkCode} />
			<Campgrounds parkCode={parkCode} />
			<VisitorCenters parkCode={parkCode} />
			<NewsSection parkCode={parkCode} />

			{park.topics?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
            Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {park.topics.map((topic) => (
              <span
                key={topic.id}
                className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-1 rounded-full text-sm"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { parkCode } = await params;
  const park = await fetchPark(parkCode);

  if (!park) {
    return { title: "Park Not Found | ParkReach" };
  }

  const description = park.description?.slice(0, 160);
  const canonicalUrl = `${BASE_URL}/parks/${parkCode}`;

  return {
    title: `${park.fullName} | ParkReach`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: park.fullName,
      description,
      url: canonicalUrl,
      // opengraph-image.tsx generates the OG image — no static images needed here
    },
  };
}

export default async function ParkDetailPage({ params }: Props) {
  const { parkCode } = await params;
  const park = await fetchPark(parkCode);

  if (!park) notFound();

  const states = formatStates(park.states);
  const amenitiesAccessibility = await getAmenities(parkCode);

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: park.fullName,
    description: park.description,
    url: `${BASE_URL}/parks/${parkCode}`,
    image: park.images?.[0]?.url,
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
      addressRegion: park.states,
    },
  };

return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-park-cream dark:bg-park-bark">
        <header className="bg-park-forest text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-park-cream hover:text-white font-semibold"
              >
                ← Back to Parks
              </Link>
              <HeaderControls />
            </div>
          </div>
        </header>

        <ParkHero park={park} states={states} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AlertBanner parkCode={park.parkCode} />
        </div>
        <ParkActions parkCode={park.parkCode} npsUrl={park.url} />

        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <ParkInfoGrid park={park} amenitiesAccessibility={amenitiesAccessibility} parkCode={parkCode} />
        </main>
      </div>
    </>
  );
}
