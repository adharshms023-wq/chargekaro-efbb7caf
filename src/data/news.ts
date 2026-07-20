export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  image: string;
  url: string;
}

export const news: NewsItem[] = [
  {
    id: "n1",
    title: "India crosses 25,000 public EV chargers milestone",
    source: "EV India Today",
    date: "Mar 2025",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=70",
    url: "#",
  },
  {
    id: "n2",
    title: "Tata Power unveils 240 kW ultra-fast highway chargers",
    source: "Auto Pulse",
    date: "Feb 2025",
    image: "https://images.unsplash.com/photo-1558425244-4b3c8c65b31c?auto=format&fit=crop&w=800&q=70",
    url: "#",
  },
  {
    id: "n3",
    title: "Kerala rolls out EV-friendly hotel certification",
    source: "Charge Kerala",
    date: "Jan 2025",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=70",
    url: "#",
  },
];

export interface Brand {
  id: string;
  name: string;
  tagline: string;
}

export const brands: Brand[] = [
  { id: "b1", name: "Tata Power EZ", tagline: "Nation-wide fast charging" },
  { id: "b2", name: "Statiq", tagline: "AC + DC charging network" },
  { id: "b3", name: "Ather Grid", tagline: "Two-wheeler chargers" },
  { id: "b4", name: "ChargeZone", tagline: "Highway ultra-fast" },
  { id: "b5", name: "Zeon", tagline: "Curated EV network" },
  { id: "b6", name: "Jio-bp", tagline: "Fuel + charge" },
];

export const popularCities = [
  { name: "Kochi", state: "Kerala", chargers: 12 },
  { name: "Bengaluru", state: "Karnataka", chargers: 320 },
  { name: "Mumbai", state: "Maharashtra", chargers: 280 },
  { name: "Delhi NCR", state: "Delhi", chargers: 410 },
  { name: "Hyderabad", state: "Telangana", chargers: 190 },
  { name: "Chennai", state: "Tamil Nadu", chargers: 210 },
];