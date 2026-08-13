export interface Locality {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  localities: Locality[];
}

export interface State {
  id: string;
  name: string;
  cities: City[];
}

export const INDIAN_STATES: State[] = [
  {
    id: "up",
    name: "Uttar Pradesh",
    cities: [
      {
        id: "kanpur",
        name: "Kanpur",
        localities: [
          { id: "panki", name: "Panki" },
          { id: "swaroop_nagar", name: "Swaroop Nagar" },
          { id: "civil_lines_kanpur", name: "Civil Lines" },
          { id: "kakadeo", name: "Kakadeo" },
          { id: "kidwai_nagar", name: "Kidwai Nagar" },
        ],
      },
      {
        id: "lucknow",
        name: "Lucknow",
        localities: [
          { id: "hazratganj", name: "Hazratganj" },
          { id: "gomti_nagar", name: "Gomti Nagar" },
          { id: "alambagh", name: "Alambagh" },
          { id: "indira_nagar", name: "Indira Nagar" },
        ],
      },
      {
        id: "noida",
        name: "Noida",
        localities: [
          { id: "sector_18", name: "Sector 18" },
          { id: "sector_62", name: "Sector 62" },
          { id: "sector_137", name: "Sector 137" },
          { id: "film_city", name: "Film City" },
        ],
      },
    ],
  },
  {
    id: "delhi",
    name: "Delhi",
    cities: [
      {
        id: "delhi_city",
        name: "Delhi",
        localities: [
          { id: "anand_vihar", name: "Anand Vihar" },
          { id: "connaught_place", name: "Connaught Place" },
          { id: "hauz_khas", name: "Hauz Khas" },
          { id: "saket", name: "Saket" },
          { id: "dwarka", name: "Dwarka" },
          { id: "karol_bagh", name: "Karol Bagh" },
        ],
      },
    ],
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    cities: [
      {
        id: "mumbai",
        name: "Mumbai",
        localities: [
          { id: "bandra", name: "Bandra" },
          { id: "juhu", name: "Juhu" },
          { id: "andheri", name: "Andheri" },
          { id: "powai", name: "Powai" },
          { id: "colaba", name: "Colaba" },
        ],
      },
      {
        id: "pune",
        name: "Pune",
        localities: [
          { id: "koregaon_park", name: "Koregaon Park" },
          { id: "viman_nagar", name: "Viman Nagar" },
          { id: "baner", name: "Baner" },
          { id: "kothrud", name: "Kothrud" },
        ],
      },
    ],
  },
  {
    id: "karnataka",
    name: "Karnataka",
    cities: [
      {
        id: "bengaluru",
        name: "Bengaluru",
        localities: [
          { id: "indiranagar", name: "Indiranagar" },
          { id: "koramangala", name: "Koramangala" },
          { id: "hsr_layout", name: "HSR Layout" },
          { id: "whitefield", name: "Whitefield" },
          { id: "mg_road", name: "MG Road" },
        ],
      },
    ],
  },
  {
    id: "telangana",
    name: "Telangana",
    cities: [
      {
        id: "hyderabad",
        name: "Hyderabad",
        localities: [
          { id: "jubilee_hills", name: "Jubilee Hills" },
          { id: "banjara_hills", name: "Banjara Hills" },
          { id: "gachibowli", name: "Gachibowli" },
          { id: "hitech_city", name: "HITECH City" },
        ],
      },
    ],
  },
];

export function getStates(): State[] {
  return INDIAN_STATES;
}

export function getStateById(stateId?: string): State | undefined {
  if (!stateId) return undefined;
  return INDIAN_STATES.find((s) => s.id === stateId);
}

export function getCitiesForState(stateId?: string): City[] {
  const state = getStateById(stateId);
  return state ? state.cities : [];
}

export function getCityById(stateId?: string, cityId?: string): City | undefined {
  const cities = getCitiesForState(stateId);
  if (!cityId) return undefined;
  return cities.find((c) => c.id === cityId);
}

export function getLocalitiesForCity(stateId?: string, cityId?: string): Locality[] {
  const city = getCityById(stateId, cityId);
  return city ? city.localities : [];
}

export function getLocalityById(stateId?: string, cityId?: string, localityId?: string): Locality | undefined {
  const localities = getLocalitiesForCity(stateId, cityId);
  if (!localityId) return undefined;
  return localities.find((l) => l.id === localityId);
}
