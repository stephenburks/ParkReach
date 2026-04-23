'use client';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' }, { code: 'AS', name: 'American Samoa' },
  { code: 'GU', name: 'Guam' }, { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'PR', name: 'Puerto Rico' }, { code: 'VI', name: 'U.S. Virgin Islands' },
];

const DESIGNATIONS = [
  'All',
  'National Park',
  'National Monument',
  'National Historic Park',
  'National Recreation Area',
  'National Seashore',
  'National Battlefield',
  'National Memorial',
  'National Preserve',
  'National Historic Site',
];

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  stateCode: string;
  onStateChange: (v: string) => void;
  designation: string;
  onDesignationChange: (v: string) => void;
}

export default function SearchFilter({
  search, onSearchChange,
  stateCode, onStateChange,
  designation, onDesignationChange,
}: Props) {
  return (
    <div className="sticky top-0 z-40 bg-park-cream/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
        {/* Search + State row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-park-stone text-sm" aria-hidden="true">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search parks by name or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-park-bark placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-park-sage focus:border-transparent text-sm shadow-sm"
            />
          </div>
          <select
            value={stateCode}
            onChange={(e) => onStateChange(e.target.value)}
            className="sm:w-52 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-park-bark focus:outline-none focus:ring-2 focus:ring-park-sage focus:border-transparent text-sm shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All States &amp; Territories</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Designation tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DESIGNATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDesignationChange(d)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                designation === d
                  ? 'bg-park-forest text-white shadow-sm'
                  : 'bg-white text-park-stone border border-stone-200 hover:bg-park-sage/10 hover:text-park-bark hover:border-park-sage/40'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
