export const ROUTE_CONFIG = {
  'Route A': {
    color: '#2563EB', // Blue
    border: '#1D4ED8',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-blue-600 text-white',
    badgeMuted: 'bg-blue-50 text-blue-700 border border-blue-200',
    name: 'Route A',
    subtitle: 'KP ⇋ Centre Point (via Jalan Amal)',
    driverBuses: ['A1'],
    stops: ['KP1', 'KTC_A', 'P19A', 'CP', 'JA1', 'JA2', 'JA3', 'JA4', 'UI']
  },
  'Route B': {
    color: '#059669', // Emerald
    border: '#047857',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    badge: 'bg-emerald-600 text-white',
    badgeMuted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    name: 'Route B',
    subtitle: 'KP - K9/10 ⇋ Cluster (T02-T08)',
    driverBuses: ['B1', 'B2', 'B3'],
    stops: ['KP1', 'K9', 'K10', 'T02', 'T06', 'T08']
  },
  'Route C': {
    color: '#D97706', // Amber
    border: '#B45309',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-600 text-white',
    badgeMuted: 'bg-amber-50 text-amber-800 border border-amber-200',
    name: 'Route C',
    subtitle: 'College 9/10 ⇋ Lingkaran Ilmu (CP)',
    driverBuses: ['C1', 'C2', 'C3'],
    stops: ['K9', 'K10', 'KTC_B2W', 'KTC_B1E', 'UI', 'P19A', 'CP', 'JA1', 'JA2', 'JA3', 'JA4']
  },
  'Route D': {
    color: '#7C3AED', // Purple
    border: '#6D28D9',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    badge: 'bg-purple-600 text-white',
    badgeMuted: 'bg-purple-50 text-purple-700 border border-purple-200',
    name: 'Route D',
    subtitle: 'Centre Point ⇋ FKT (N29)',
    driverBuses: ['D1'],
    stops: ['CP', 'PGT', 'N24', 'FKT', 'P19', 'P19A']
  },
  'Route E(N24)': {
    color: '#DB2777', // Pink
    border: '#BE185D',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    badge: 'bg-pink-600 text-white',
    badgeMuted: 'bg-pink-50 text-pink-700 border border-pink-200',
    name: 'Route E (via N24)',
    subtitle: 'KDOJ / KLG / KDSE ⇋ Cluster (via N24)',
    driverBuses: ['E1', 'E3', 'E5', 'E1_WEEKEND', 'E2_WEEKEND'],
    stops: ['KDOJ_XB2', 'KDOJ', 'KLG_E', 'KDSE_E', 'PKU_E', 'K6', 'KTF', 'H01', 'CP', 'PGT', 'N24', 'P19', 'P19A2', 'UI', 'KTC_B1E', 'T02', 'K9', 'K10']
  },
  'Route E(JA)': {
    color: '#E11D48', // Rose
    border: '#BE123C',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    badge: 'bg-rose-600 text-white',
    badgeMuted: 'bg-rose-50 text-rose-700 border border-rose-200',
    name: 'Route E (via Jln Amal)',
    subtitle: 'KDOJ / KLG / KDSE ⇋ Cluster (via Jalan Amal)',
    driverBuses: ['E2', 'E4', 'E6'],
    stops: ['KDOJ_XB2', 'KDOJ', 'KLG_E', 'KDSE_E', 'PKU_E', 'K6', 'KTF', 'H01', 'CP', 'JA1', 'JA2', 'JA3', 'JA4', 'P19A2', 'UI', 'KTC_B1E', 'T02']
  },
  'Route E(CP)': {
    color: '#9F1239', // Deep Rose
    border: '#881337',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    badge: 'bg-rose-700 text-white',
    badgeMuted: 'bg-rose-50 text-rose-800 border border-rose-200',
    name: 'Route E (Night)',
    subtitle: 'KDOJ / KLG ⇋ Centre Point (FABU) Night Shuttle',
    driverBuses: ['E6'],
    stops: ['KDOJ_XB2', 'KDOJ', 'KLG_E', 'KDSE_E', 'PKU_E', 'K6', 'KTF', 'H01', 'CP']
  },
  'Route F': {
    color: '#0891B2', // Cyan
    border: '#0E7490',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    badge: 'bg-cyan-600 text-white',
    badgeMuted: 'bg-cyan-50 text-cyan-800 border border-cyan-200',
    name: 'Route F',
    subtitle: 'KTR (K01) ⇋ Lingkaran Ilmu / FKE (P19a)',
    driverBuses: ['F1', 'F2'],
    stops: ['K19', 'K20', 'K21', 'K22', 'K23', 'K26', 'K25', 'K28', 'K31', 'K30', 'K29', 'JA1', 'JA2', 'JA3', 'JA4', 'P19A', 'CP', 'K17']
  },
  'Route G': {
    color: '#0D9488', // Teal
    border: '#0F766E',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    badge: 'bg-teal-600 text-white',
    badgeMuted: 'bg-teal-50 text-teal-800 border border-teal-200',
    name: 'Route G',
    subtitle: 'KTR / KTHO / KTDI ⇋ FKT (N29)',
    driverBuses: ['G1', 'G2'],
    stops: ['K19', 'K20', 'K21', 'K22', 'K23', 'K26', 'K25', 'K28', 'K31', 'K30', 'K29', 'PGT', 'N24', 'FKT', 'P19', 'P19A', 'CP', 'K17']
  },
  'Route H': {
    color: '#CA8A04', // Yellow
    border: '#A16207',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    badge: 'bg-amber-500 text-slate-950 font-bold',
    badgeMuted: 'bg-amber-50 text-amber-900 border border-amber-200',
    name: 'Route H',
    subtitle: 'Centre Point ⇋ V01 (Taman Universiti)',
    driverBuses: ['H1'],
    stops: ['CP', 'JA1', 'JA2', 'JA3', 'JA4', 'P19A', 'V01']
  },
  'Route J': {
    color: '#4F46E5', // Indigo
    border: '#4338CA',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    badge: 'bg-indigo-600 text-white',
    badgeMuted: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    name: 'Route J',
    subtitle: 'Centre Point ⇋ UTM Stadium (Sports / Co-Curricular)',
    driverBuses: ['J1'],
    stops: ['CP', 'JA1', 'JA2', 'JA3', 'JA4', 'P19A2', 'UI', 'KTC_B1E', 'STADIUM', 'KTC_B1W', 'KTC_B2W', 'P19A']
  }
};

export const UTM_CENTER = [1.5600, 103.6380]; // Center of UTM Skudai campus
export const UTM_BOUNDS = [
  [1.5350, 103.6100],
  [1.5850, 103.6650]
];

export const FRIDAY_PRAYER_START = '12:40';
export const FRIDAY_PRAYER_END = '14:00';

export const LOCATION_CATEGORIES = {
  faculty: { label: 'Faculties', icon: 'GraduationCap', color: '#2563EB' },
  hostel: { label: 'Colleges / Hostels', icon: 'Home', color: '#059669' },
  library: { label: 'Libraries', icon: 'BookOpen', color: '#D97706' },
  food: { label: 'Dining & Cafés', icon: 'Utensils', color: '#DB2777' },
  admin: { label: 'Administration', icon: 'Building2', color: '#7C3AED' },
  facility: { label: 'Sports & Amenities', icon: 'Activity', color: '#0891B2' },
  bus_stop: { label: 'Bus Stops', icon: 'Bus', color: '#E11D48' }
};
