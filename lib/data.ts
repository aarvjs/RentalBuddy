export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  aspect: "aspect-[3/4]" | "aspect-square" | "aspect-[4/5]" | "aspect-[9/16]" | "aspect-[4/3]";
  caption: string;
  tag: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Sunset Yacht Riviera",
    category: "Travel & Luxury",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    aspect: "aspect-[3/4]",
    caption: "Private charter along the Amalfi coastline",
    tag: "Riviera",
  },
  {
    id: "gal-2",
    title: "Parisian Morning Coffee",
    category: "Lifestyle",
    imageUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200",
    aspect: "aspect-[4/5]",
    caption: "Charming cafe conversations overlooking Saint-Germain",
    tag: "Lifestyle",
  },
  {
    id: "gal-3",
    title: "Gala Evening Splendor",
    category: "Events",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
    aspect: "aspect-square",
    caption: "Red carpet elegance at the annual opera benefit gala",
    tag: "High Society",
  },
  {
    id: "gal-4",
    title: "Romantic Vineyard Retreat",
    category: "Couples & Romance",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200",
    aspect: "aspect-[3/4]",
    caption: "Tasting vintage reserve wines in Tuscany",
    tag: "Romance",
  },
  {
    id: "gal-5",
    title: "Bespoke Shopping Escapade",
    category: "Shopping & Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200",
    aspect: "aspect-[4/5]",
    caption: "Private salon shopping on Milan's Via Montenapoleone",
    tag: "Fashion",
  },
  {
    id: "gal-6",
    title: "Cozy Fireside Conversation",
    category: "Support & Connection",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1200",
    aspect: "aspect-square",
    caption: "Meaningful dialogues by the fireplace in St. Moritz",
    tag: "Warmth",
  },
  {
    id: "gal-7",
    title: "Private Helicopter Escape",
    category: "Travel & Luxury",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200",
    aspect: "aspect-[3/4]",
    caption: "Panoramic flight over Swiss Alpine peaks",
    tag: "Adventure",
  },
  {
    id: "gal-8",
    title: "Michelin Dining Experience",
    category: "Fine Dining",
    imageUrl:
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1200",
    aspect: "aspect-[4/5]",
    caption: "An 8-course culinary masterpiece in Tokyo",
    tag: "Gastronomy",
  },
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  avatarUrl: string;
  rating: number;
  quote: string;
  occasion: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Alexander V.",
    role: "Private Equity Partner",
    city: "London & Zurich",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    quote:
      "Hosting diplomatic dinners requires flawless poise and intellectual charm. My companion from RentasBuddy was articulate, multilingual, and radiated warmth. Exceptional discretion from start to finish.",
    occasion: "Diplomatic Gala",
  },
  {
    id: "t-2",
    name: "Sophia L.",
    role: "Art Curator & Collector",
    city: "New York & Paris",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    quote:
      "As a woman leading high-profile gallery openings, having a handsome, well-read companion who truly appreciated contemporary art made the Venice Biennale completely extraordinary.",
    occasion: "Art Biennale",
  },
  {
    id: "t-3",
    name: "Marcus & Elena H.",
    role: "Tech Founders",
    city: "San Francisco",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    quote:
      "We needed a charming social host for our annual Monaco yacht weekend. The concierge team understood our exact vibe and provided an unforgettable companion experience.",
    occasion: "Yacht Escape",
  },
  {
    id: "t-4",
    name: "David K.",
    role: "Managing Director",
    city: "Singapore",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    quote:
      "Beyond beauty, what touched me was the genuine emotional intelligence and empathy. During a difficult personal week, having an attentive, comforting partner was priceless.",
    occasion: "Emotional Support Retreat",
  },
];

export interface FeaturedStory {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  imageUrl: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
}

export const FEATURED_STORIES: FeaturedStory[] = [
  {
    id: "story-1",
    title: "Navigating High-Society Galas: The Art of Social Grace",
    excerpt:
      "Discover how subtle body language, cultural etiquette, and effortless poise elevate high-profile evening receptions across Mayfair and Manhattan.",
    readTime: "5 min read",
    category: "High Society",
    imageUrl:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=1000",
    date: "July 28, 2026",
    author: {
      name: "Victoria St. Clair",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    },
  },
  {
    id: "story-2",
    title: "Weekend in Lake Como: Designing Romantic Escapes",
    excerpt:
      "From private Riva boat tours to hidden trattorias with panoramic alpine views, here is how to curate an idyllic weekend for two.",
    readTime: "7 min read",
    category: "Travel & Leisure",
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1000",
    date: "July 20, 2026",
    author: {
      name: "Julian Mercier",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    },
  },
  {
    id: "story-3",
    title: "The Power of Authentic Empathy in Modern Companionship",
    excerpt:
      "Why high-performing executives are turning to professional companions for stress relief, active listening, and judgment-free companionship.",
    readTime: "4 min read",
    category: "Wellness & Connection",
    imageUrl:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1000",
    date: "July 12, 2026",
    author: {
      name: "Dr. Elena Rostova",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    },
  },
];

export const FAQS = [
  {
    question: "How does RentasBuddy ensure strict confidentiality for clients?",
    answer:
      "Confidentiality is our highest priority. All client records, booking histories, and communications are secured using Swiss 256-bit encryption. We never release member details to third parties, and all companions sign legally binding, non-disclosure agreements prior to joining our roster.",
  },
  {
    question: "What is the vetting process for companions?",
    answer:
      "Our multi-stage verification includes government-issued identity verification, criminal background checks, education & background verification, in-person behavioral interviews, and social etiquette assessments. Only 3% of applicants pass our rigorous selection criteria.",
  },
  {
    question: "Can I book a companion for international travel or yacht charters?",
    answer:
      "Yes. Our Prestige and Royal Privé members regularly arrange international companions for multi-week European tours, Caribbean yacht charters, and private island retreats. Our concierge team manages all visa, flight, and accommodation logistics seamlessly.",
  },
  {
    question: "What happens if there is no mutual chemistry during a booking?",
    answer:
      "We offer pre-booking video introductions for our members to establish mutual rapport. If an unexpected mismatch occurs, our 24/7 concierge team will immediately coordinate a replacement companion or offer an instant booking credit without hassle.",
  },
  {
    question: "Are custom requests and specialized event dress codes accommodated?",
    answer:
      "Absolutely. Whether you require black-tie gown attire for a opera premiere, tennis resort wear for a Monte Carlo weekend, or specific language capabilities (e.g., French, Italian, Mandarin), our concierge tailors every single detail to your instructions.",
  },
  {
    question: "How do payments and billing appear on financial statements?",
    answer:
      "All membership transactions appear under a discreet, neutral holding company name (e.g., 'AL Management Services LLC') with no mention of companionship or social hosting services.",
  },
];

export const TEAM_MEMBERS = [
  {
    name: "Genevieve DeWitt",
    role: "Founder & Chief Executive Officer",
    bio: "Former luxury hospitality director in Paris & London with 15+ years experience in high-society event management.",
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Maximilian Sterling",
    role: "Head of VIP Concierge & Security",
    bio: "Specialist in private aviation logistics, diplomatic protocol, and high-net-worth client confidentiality.",
    imageUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Camilla Vance",
    role: "Director of Companion Vetting & Etiquette",
    bio: "Etiquette consultant and former international fashion stylist ensuring our companions exude flawless charm.",
    imageUrl:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Julian Thorne",
    role: "Global Client Relations Officer",
    bio: "Dedicated to personalizing member experiences across North America, Europe, and the Middle East.",
    imageUrl:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600",
  },
];

export const COMPARISON_DATA = [
  {
    feature: "Companion Verification Protocol",
    rentasBuddy: "Triple-Layer Verification & Background Screening",
    others: "Basic Self-Reported Profiles or Unverified",
  },
  {
    feature: "Discretion & Legal Protection",
    rentasBuddy: "Legally Binding Non-Disclosure Agreement (NDA)",
    others: "No NDA Standard",
  },
  {
    feature: "24/7 Dedicated Concierge",
    rentasBuddy: "Live Senior Concierge Officer Available 24/7",
    others: "Automated Bot or Slow Email Response",
  },
  {
    feature: "Pre-Event Video Meeting",
    rentasBuddy: "Included for Chemistry Check",
    others: "Rarely Offered or Extra Fee",
  },
  {
    feature: "Global Travel & Yacht Logistics",
    rentasBuddy: "Full International Visa & Flight Curation",
    others: "Self-Managed by Client",
  },
  {
    feature: "Discreet Neutral Billing",
    rentasBuddy: "Neutral Corporate Holding Descriptor",
    others: "Explicit Brand Names on Statements",
  },
];
