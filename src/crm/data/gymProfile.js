/**
 * ==============================================================================
 * Fitaval CRM — Gym Profile UI Constants & Mock Data
 * ==============================================================================
 */

export const SERVICE_AMENITIES = [
  "Personal Training",
  "Nutrition & Diet Consultation",
  "Group Fitness Classes",
  "Body Composition / InBody Analysis",
  "Physiotherapy & Sports Rehab",
  "Steam & Sauna Recovery",
  "Yoga & Meditation Sessions",
  "Zumba & Dance Fitness",
  "HIIT & Cross-Training",
  "Boxing & Martial Arts",
  "Swimming Coaching",
  "Spa & Sports Massage",
  "Towel Service",
  "Locker Rental Service",
  "Guest & Buddy Passes",
];

export const FACILITY_AMENITIES = [
  "Air Conditioning",
  "Free High-Speed WiFi",
  "Free Parking & Valet",
  "Showers & Changing Rooms",
  "Secure Digital Lockers",
  "24/7 Biometric Access",
  "Cafeteria & Juice Bar",
  "RO Purified Drinking Water",
  "Cardio Cinema Zone",
  "CCTV Surveillance",
  "Supplement Store / Pro Shop",
  "Clean Restrooms & Vanity",
];

export const COMMON_AMENITIES = [
  ...SERVICE_AMENITIES,
  ...FACILITY_AMENITIES,
];

export const SERVICE_KEYWORDS = [
  "personal training",
  "nutrition",
  "diet",
  "group fitness",
  "group class",
  "classes",
  "inbody",
  "body composition",
  "physiotherapy",
  "rehab",
  "sauna",
  "steam",
  "yoga",
  "zumba",
  "dance",
  "hiit",
  "cross-training",
  "crossfit",
  "boxing",
  "martial arts",
  "swimming",
  "spa",
  "massage",
  "towel",
  "coaching",
  "pass",
  "induction",
  "therapy",
];

export const isServiceAmenity = (name) => {
  const lower = (name || "").toLowerCase();
  return SERVICE_KEYWORDS.some((k) => lower.includes(k));
};

export const MOCK_GYM_IMAGES = {
  logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
  floor: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80",
  weights: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80",
  cardio: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80",
};

export const MOCK_GYM_PROFILE = {
  id: "profile_1",
  name: "Fitaval Health & Fitness Club",
  logo_url: MOCK_GYM_IMAGES.logo,
  address: "Sector 18, Commercial Plaza, 3rd Floor",
  city: "Gurugram, Haryana",
  latitude: 28.4815,
  longitude: 77.0818,
  phone: "+91 98765 43210",
  email: "info@fitaval.com",
  operating_hours: "Monday – Saturday: 5:30 AM – 10:30 PM | Sunday: Closed",
  weekly_schedule: {
    monday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
    tuesday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
    wednesday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
    thursday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
    friday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
    saturday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
    sunday: { enabled: false, open: "7:00 AM", close: "8:00 PM" },
  },
  description:
    "Fitaval is a state-of-the-art fitness community offering cutting-edge equipment, world-class personal coaching, luxury recovery amenities, and holistic health tracking.",
  amenities: [
    "Personal Training",
    "Nutrition & Diet Consultation",
    "Group Fitness Classes",
    "Body Composition / InBody Analysis",
    "Steam & Sauna Recovery",
    "Air Conditioning",
    "Free High-Speed WiFi",
    "Free Parking & Valet",
    "Showers & Changing Rooms",
    "Secure Digital Lockers",
  ],
  gallery: [
    MOCK_GYM_IMAGES.floor,
    MOCK_GYM_IMAGES.weights,
    MOCK_GYM_IMAGES.cardio,
  ],
  created_date: "2025-01-01T00:00:00Z",
};
