import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Park } from "@/types/park";
import { fetchPark, fetchParkAccessibility } from "@/lib/nps";
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
import { SiteFooter } from "@/components/SiteFooter";
import { SectionNav } from "@/components/SectionNav";
import { Mountain } from "lucide-react";

const BASE_URL = "https://parkreach.app";

interface Props {
  params: Promise<{ parkCode: string }>;
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
    <div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap items-start justify-start gap-3">
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
      <section id="fees" className="scroll-mt-24">
        <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
          Entrance Fees
        </h2>
        <p className="text-stone-700 dark:text-stone-300">Free to Visit</p>
      </section>
    );
  }
  return (
    <section id="fees" className="scroll-mt-24">
      <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
        Entrance Fees
      </h2>
      <ul className="space-y-2">
        {park.entranceFees.map((fee, index) => (
          <li
            key={index}
            className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 shadow-sm"
          >
            <p className="font-semibold text-park-bark dark:text-park-cream">
              {fee.title}
            </p>
            <p className="text-stone-700 dark:text-stone-300">
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
    <section id="hours" className="scroll-mt-24">
      <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
        Hours
      </h2>
      {hours.map((entry, index) => (
        <div
          key={index}
          className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 shadow-sm mb-2"
        >
          <p className="font-semibold text-park-bark dark:text-park-cream mb-2">
            {entry.name}
          </p>
          {entry.description && (
            <p className="text-stone-700 dark:text-stone-300 mb-2">
              {entry.description}
            </p>
          )}
          {entry.standardHours && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.entries(entry.standardHours).map(([day, val]) => (
                <div key={day} className="capitalize">
                  <span className="font-medium">{day}: </span>
                  <span className="text-stone-700 dark:text-stone-300">
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
    <div className="space-y-8" id="park-info-grid">
      <section id="about" className="scroll-mt-24">
        <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
          About
        </h2>
        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
          {park.description}
        </p>
      </section>

      <div id="weather" className="flex flex-col sm:flex-row gap-4 scroll-mt-24">
        <div className="flex-1">
          <WeatherWidget parkCode={park.parkCode} />
        </div>
        <DistanceBadge
          parkCode={park.parkCode}
          latitude={park.latitude}
          longitude={park.longitude}
        />
      </div>

      {(amenitiesAccessibility || park.accessibility || park.has_wheelchair_access || park.has_braille || park.has_asl || park.has_audio_description) && (
        <AccessibilityInfo
          accessibility={amenitiesAccessibility || park.accessibility}
          park={park}
        />
      )}

      {park.directionsInfo && (
        <section id="directions" className="scroll-mt-24">
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
				<section id="activities" className="scroll-mt-24">
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
        <section id="topics" className="scroll-mt-24">
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
  const apiKey = process.env.NPS_API_KEY ?? '';
  const amenitiesAccessibility = apiKey ? await fetchParkAccessibility(parkCode, apiKey) : null;

  // Compute section IDs for SectionNav — only include sections we know exist server-side.
  // Data-dependent sections (things-to-do, events, campgrounds, visitor-centers, news)
  // are detected dynamically by SectionNav when their content loads client-side.
  const sectionIds: string[] = [
    'about',
    'weather',
    'fees',
  ];
  if (amenitiesAccessibility || park.accessibility || park.has_wheelchair_access || park.has_braille || park.has_asl || park.has_audio_description) sectionIds.push('accessibility');
  if (park.directionsInfo) sectionIds.push('directions');
  if (park.operatingHours?.length) sectionIds.push('hours');
  if (park.activities?.length > 0) sectionIds.push('activities');
  if (park.topics?.length > 0) sectionIds.push('topics');

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
       <div className="flex flex-col min-h-screen bg-park-cream dark:bg-park-bark overflow-x-hidden">
        <header className="bg-park-forest text-white">
          <div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        <div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AlertBanner parkCode={park.parkCode} />
        </div>
        <ParkActions parkCode={park.parkCode} npsUrl={park.url} />

        <SectionNav sections={sectionIds} />

        <main id="main-content" className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <ParkInfoGrid park={park} amenitiesAccessibility={amenitiesAccessibility} parkCode={parkCode} />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
