import { seedTx, seedWallet } from './finance';
import { PLANS0, PLAN_DAYS } from './plans';
import { mulberry, D, iso, addDays, TODAY, DAYS } from '../lib/utils';

export const GYM_INFO = {
  GYM001: {
    addr: '8421 Sunset Blvd, Suite 210',
    zip: '90069',
    area: '310',
    email: 'hello@ironparadise.com',
    lat: 34.0901,
    lng: -118.3617,
    about:
      'Iron Paradise Fitness is a 14,000 sq ft strength-first gym on the Sunset Strip with competition-grade racks, a dedicated powerlifting platform and certified coaches on the floor from open to close.',
  },
  GYM002: {
    addr: '1450 Brickell Ave, Floor 2',
    zip: '33131',
    area: '305',
    email: 'info@peakperformance.fit',
    lat: 25.7617,
    lng: -80.1918,
    about:
      'Peak Performance Center combines athletic conditioning, recovery and sports-science testing in a bright waterfront-district facility built for serious amateurs and weekend competitors.',
  },
  GYM003: {
    addr: '610 Congress Ave, Unit 4',
    zip: '78701',
    area: '512',
    email: 'team@elitestrength.com',
    lat: 30.2672,
    lng: -97.7431,
    about:
      'Elite Strength Studio is a boutique downtown studio offering small-group strength programming, 1:1 coaching and mobility work capped at twelve members per session.',
  },
  GYM004: {
    addr: '2201 Westlake Ave, 3rd Floor',
    zip: '98121',
    area: '206',
    email: 'contact@momentumgymspa.com',
    lat: 47.6062,
    lng: -122.3321,
    about:
      'Momentum Gym & Spa pairs a full training floor with a hydrotherapy spa, infrared sauna and massage rooms, so members can train and recover under one roof.',
  },
  GYM005: {
    addr: '1735 Blake St, Suite 100',
    zip: '80202',
    area: '303',
    email: 'hello@corefithub.com',
    lat: 39.7392,
    lng: -104.9903,
    about:
      'CoreFit Training Hub is a functional-fitness gym in LoDo focused on core strength, mobility and endurance classes, with an outdoor turf yard for sled and sprint work.',
  },
  GYM006: {
    addr: '330 N Wabash Ave, Level 2',
    zip: '60611',
    area: '312',
    email: 'info@titanforge.fit',
    lat: 41.8781,
    lng: -87.6298,
    about:
      'Titan Forge Athletics trains competitive lifters and strongman hopefuls with specialty bars, atlas stones and a coaching staff drawn from regional meets.',
  },
  GYM007: {
    addr: '925 SE Hawthorne Blvd',
    zip: '97214',
    area: '503',
    email: 'hi@pulsecollective.com',
    lat: 45.5152,
    lng: -122.6784,
    about:
      'Pulse Fitness Collective is a neighborhood community gym with cycling, HIIT and yoga studios, a juice bar and a members-first approach to class booking.',
  },
  GYM008: {
    addr: '2850 Pearl St, Unit B',
    zip: '80301',
    area: '720',
    email: 'box@summitcrossfit.com',
    lat: 40.015,
    lng: -105.2705,
    about:
      'Summit CrossFit is an affiliate box at the foot of the Flatirons running daily WODs, Olympic lifting clinics and an on-ramp course for first-time members.',
  },
  GYM009: {
    addr: '77 Seaport Blvd, Floor 3',
    zip: '02210',
    area: '617',
    email: 'hello@harborstrength.com',
    lat: 42.3519,
    lng: -71.0446,
    about: 'Harbor Strength Club is a waterfront strength gym with platforms, strongman gear and small-group coaching.',
  },
  GYM010: {
    addr: '1900 Elm St, Suite 12',
    zip: '75201',
    area: '214',
    email: 'team@lonestarathletics.com',
    lat: 32.7767,
    lng: -96.797,
    about: 'Lone Star Athletics runs athletic performance programs, open gym hours and youth conditioning classes.',
  },
  GYM011: {
    addr: '455 Market St, Level 2',
    zip: '94105',
    area: '415',
    email: 'hi@bayareabodyworks.com',
    lat: 37.7897,
    lng: -122.3987,
    about: 'Bay Area Bodyworks blends mobility, yoga and strength training with on-site physio.',
  },
  GYM012: {
    addr: '300 Camelback Rd, Unit 6',
    zip: '85016',
    area: '602',
    email: 'info@neonfitlab.com',
    lat: 33.5092,
    lng: -112.074,
    about: 'Neon Fit Lab is a boutique HIIT and cycling studio.',
  },
};

export const FACILITIES = [
  'Parking',
  'Showers',
  'Lockers',
  'AC',
  'WiFi',
  'Steam Room',
  'Cafe',
  'Physio Corner',
  'CCTV',
  'Towel Service',
];

export const SERVICE_LIST = [
  'Personal Training',
  'Group Classes',
  'Sauna',
  'Nutrition Coaching',
  'Yoga Studio',
  'Massage Therapy',
];

export const FN = [
  'Aiden',
  'Maya',
  'Liam',
  'Sofia',
  'Noah',
  'Ava',
  'Ethan',
  'Isabella',
  'Lucas',
  'Mia',
  'Mason',
  'Chloe',
  'Logan',
  'Zoe',
  'Elijah',
  'Harper',
  'Owen',
  'Layla',
  'Caleb',
  'Nora',
  'Jordan',
  'Priya',
  'Diego',
  'Hana',
  'Marcus',
  'Tessa',
  'Gabriel',
  'Elena',
  'Rohan',
  'Camila',
];

export const LN = [
  'Carter',
  'Nguyen',
  'Brooks',
  'Patel',
  'Rivera',
  'Hughes',
  'Morgan',
  'Ortiz',
  'Bennett',
  'Kim',
  'Foster',
  'Reyes',
  'Sullivan',
  'Chen',
  'Walker',
  'Diaz',
  'Hayes',
  'Shah',
  'Powell',
  'Murphy',
  'Grant',
  'Lopez',
  'Parker',
  'Ali',
  'Cooper',
  'Ramos',
];

export const SCENES = { floor: 'Free weights floor', racks: 'Dumbbell zone', cardio: 'Cardio deck' };

export const SPECS = [
  'Strength Training',
  'Personal Training',
  'Yoga',
  'Mobility',
  'Weight Loss',
  'CrossFit',
  'Functional Training',
  'Rehabilitation',
  'Nutrition',
  'HIIT Conditioning',
];

export const BIOS = {
  'General Manager': 'Oversees daily operations, staff scheduling and member escalations.',
  'Front Desk': 'Front desk receptionist, customer care, facility management.',
  'Sales Advisor': 'Membership sales, plan consultation and renewals.',
  Housekeeping: 'Floor cleaning, locker rooms and equipment sanitising.',
  Maintenance: 'Equipment servicing, repairs and safety checks.',
};

export const REVIEW_TXT = {
  5: [
    'Spotless equipment and friendly trainers. Best gym I have joined.',
    'Great atmosphere, never too crowded in the mornings.',
    'Staff remembered my name on day two. Love the group classes.',
    'Excellent facilities and very flexible plan options.',
  ],
  4: [
    'Good gym overall. Gets busy after 6 PM but the staff manage it well.',
    'Clean and well equipped. Would like a few more squat racks.',
    'Trainers are helpful. Locker rooms could be cleaned more often.',
  ],
  3: [
    'Decent equipment but the AC was not working on my last visit.',
    'Average experience. Front desk was slow to help during peak hours.',
  ],
  2: [
    'Machines were out of order for two weeks and nobody gave an update.',
    'Too crowded in the evenings and the showers were cold.',
  ],
  1: ['Billing issue took many visits to fix. Very disappointed.'],
};

export const REPLY_TXT = [
  'Thank you for the kind words. We are glad you are enjoying the gym.',
  'Sorry about this. We have shared it with the branch manager and will fix it this week.',
];

export function makeReviews(gymId, gi, members) {
  const r = mulberry(gi * 313 + 7);
  const out = [];
  const n = 8 + Math.floor(r() * 5);
  for (let i = 0; i < n; i++) {
    const roll = r();
    const rating = roll < 0.45 ? 5 : roll < 0.78 ? 4 : roll < 0.9 ? 3 : roll < 0.97 ? 2 : 1;
    const txt = REVIEW_TXT[rating];
    const m = members[Math.floor(r() * members.length)];
    const date = iso(addDays(TODAY, -(1 + Math.floor(r() * 80))));
    const replied = r() < 0.4;
    out.push({
      id: gymId + 'r' + i,
      name: m.name,
      rating,
      date,
      text: txt[Math.floor(r() * txt.length)],
      reply: replied
        ? { by: 'Gym Admin', text: rating >= 4 ? REPLY_TXT[0] : REPLY_TXT[1], when: iso(addDays(D(date), 1)) }
        : null,
    });
  }
  return out.sort((x, y) => y.date.localeCompare(x.date));
}

export const GYM_GALLERY_PHOTOS = [
  {
    name: 'Free weights floor',
    src: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Dumbbell zone',
    src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cardio deck',
    src: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Powerlifting platforms',
    src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Functional training area',
    src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
];

export function makeGym(a, gi) {
  const info = GYM_INFO[a.id];
  const r = mulberry(gi * 977 + 31);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const used = new Set();
  const person = () => {
    let n;
    do {
      n = pick(FN) + ' ' + pick(LN);
    } while (used.has(n));
    used.add(n);
    return n;
  };
  const phone = () => '+1 (' + info.area + ') 555-0' + String(100 + Math.floor(r() * 99));
  const shuffle = (arr) =>
    arr
      .map((v) => [r(), v])
      .sort((x, y) => x[0] - y[0])
      .map((x) => x[1]);
  const from = pick(['05:00', '05:30', '06:00']);
  const hours = DAYS.map((_, d) =>
    d < 5
      ? { open: true, from, to: '22:00' }
      : d === 5
        ? { open: true, from: '07:00', to: '20:00' }
        : { open: r() > 0.4, from: '08:00', to: '16:00' }
  );
  const roles = ['General Manager', 'Front Desk', 'Front Desk', 'Sales Advisor', 'Housekeeping', 'Maintenance'].concat(
    r() > 0.5 ? ['Front Desk'] : []
  );
  const shifts = {
    'General Manager': '09:00 to 18:00',
    'Front Desk': '06:00 to 14:00',
    'Sales Advisor': '10:00 to 19:00',
    Housekeeping: '05:00 to 13:00',
    Maintenance: '08:00 to 16:00',
  };
  const slug = (n) => n.toLowerCase().replace(/[^a-z]+/g, '.');
  const dom = info.email.split('@')[1];
  const wk = (f1, t1) =>
    DAYS.map((_, d) => (d < 5 ? { open: true, from: f1, to: t1 } : { open: false, from: '', to: '' }));
  const staff = roles.map((role, k) => {
    const nm = person();
    const sh = shifts[role].split(' to ');
    return {
      id: a.id + 's' + k,
      name: nm,
      role,
      phone: phone(),
      email: slug(nm) + '@' + dom,
      shift: shifts[role],
      hours: wk(sh[0], sh[1]),
      bio: BIOS[role],
      active: r() < 0.9,
      status: r() < 0.6 ? 'On Shift' : r() < 0.8 ? 'Off Today' : 'On Leave',
      since: iso(addDays(TODAY, -Math.floor(60 + r() * 900))),
    };
  });
  const certs = ['NSCA-CSCS', 'ACE-CPT', 'CrossFit L2', 'NASM-CPT', 'RYT-200', 'ISSA-CPT'];
  const trainers = Array.from({ length: 4 + Math.floor(r() * 3) }, (_, k) => {
    const nm = person();
    const sp = shuffle(SPECS).slice(0, 2 + Math.floor(r() * 3));
    const st = pick([
      ['06:00', '14:00'],
      ['07:00', '15:00'],
      ['12:00', '20:00'],
    ]);
    return {
      id: a.id + 't' + k,
      name: nm,
      exp: 2 + Math.floor(r() * 11),
      phone: phone(),
      email: slug(nm) + '@' + dom,
      specs: sp,
      certs: shuffle(certs)
        .slice(0, 1 + Math.floor(r() * 2))
        .join(', '),
      hours: wk(st[0], st[1]),
      bio: 'Coaches ' + sp[0].toLowerCase() + ' with a focus on safe technique and steady progress.',
      clients: 6 + Math.floor(r() * 19),
      rating: Number((4.3 + r() * 0.7).toFixed(1)),
      active: r() < 0.88,
    };
  });
  const plans = ['Monthly', 'Quarterly', 'Annual', 'Personal Training'];
  const payM = ['UPI (GPay / PhonePe)', 'Credit / Debit Card', 'Cash', 'Net Banking'];
  const goalL = [
    'Muscle building, marathon training',
    'Weight loss and stamina',
    'Strength and mobility',
    'General fitness',
    'Post-injury rehab',
  ];
  const medL = [
    'None reported',
    'Lower back stiffness, knee surgery',
    'Mild asthma',
    'Shoulder impingement',
    'High blood pressure',
  ];
  const noteL = [
    'Prefers morning sessions',
    'Requested trainer follow-up',
    'Referred by existing member',
    'Needs locker allocation',
    'No notes',
  ];
  const addrL = [
    'Apartment 4B, Elm Street',
    '12 Oak Avenue',
    '88 Lakeview Drive',
    '5 Harbor Road, Unit 3',
    '240 Maple Court',
  ];
  const members = Array.from({ length: 12 + Math.floor(r() * 7) }, (_, k) => {
    const nm = person();
    const plan = pick(plans);
    const days = PLAN_DAYS[plan];
    const roll = r();
    const status = roll < 0.7 ? 'Active' : roll < 0.84 ? 'Frozen' : 'Expired';
    const end =
      status === 'Expired'
        ? addDays(TODAY, -(3 + Math.floor(r() * 55)))
        : addDays(TODAY, 6 + Math.floor(r() * (days - 5)));
    const hex = Array.from({ length: 6 }, () => '0123456789ABCDEF'[Math.floor(r() * 16)]).join('');
    const pr = r();
    const pay =
      status === 'Expired' ? (pr < 0.5 ? 'Paid' : 'Pending') : pr < 0.8 ? 'Paid' : pr < 0.9 ? 'Partial' : 'Pending';
    return {
      id: a.id + 'm' + k,
      name: nm,
      phone: phone(),
      email: slug(nm) + '@example.com',
      gender: pick(['Male', 'Female', 'Female', 'Male', 'Other']),
      dob: iso(addDays(TODAY, -Math.floor(365.25 * (19 + r() * 35)))),
      emergency: phone() + ' (' + pick(['Father', 'Mother', 'Spouse', 'Sibling']) + ')',
      address: pick(addrL) + ', ' + a.loc,
      plan,
      fee: PLANS0.find((x) => x.name === plan).price,
      status,
      start: iso(addDays(end, -days)),
      end: iso(end),
      trainer: r() < 0.15 ? 'Unassigned' : pick(trainers).name,
      pay,
      payMethod: pick(payM),
      goals: pick(goalL),
      medical: pick(medL),
      notes: pick(noteL),
      last: iso(status === 'Expired' ? addDays(end, -Math.floor(r() * 4)) : addDays(TODAY, -Math.floor(r() * 6))),
      token: 'FTV-' + (gi + 3) + '-' + (3000 + gi * 100 + k) + '-' + hex,
    };
  });
  const rot = gi % GYM_GALLERY_PHOTOS.length;
  const photos = [
    {
      id: `${a.id}_ph_1`,
      kind: 'upload',
      name: GYM_GALLERY_PHOTOS[rot % GYM_GALLERY_PHOTOS.length].name,
      src: GYM_GALLERY_PHOTOS[rot % GYM_GALLERY_PHOTOS.length].src,
    },
    {
      id: `${a.id}_ph_2`,
      kind: 'upload',
      name: GYM_GALLERY_PHOTOS[(rot + 1) % GYM_GALLERY_PHOTOS.length].name,
      src: GYM_GALLERY_PHOTOS[(rot + 1) % GYM_GALLERY_PHOTOS.length].src,
    },
    {
      id: `${a.id}_ph_3`,
      kind: 'upload',
      name: GYM_GALLERY_PHOTOS[(rot + 2) % GYM_GALLERY_PHOTOS.length].name,
      src: GYM_GALLERY_PHOTOS[(rot + 2) % GYM_GALLERY_PHOTOS.length].src,
    },
  ];
  return {
    id: a.id,
    name: a.name,
    loc: a.loc,
    owner: a.owner,
    submitted: a.on,
    addr: info.addr,
    zip: info.zip,
    phone: phone(),
    email: info.email,
    lat: info.lat,
    lng: info.lng,
    about: info.about,
    facilities: shuffle(FACILITIES).slice(0, 4 + Math.floor(r() * 3)),
    services: shuffle(SERVICE_LIST).slice(0, 2 + Math.floor(r() * 3)),
    hours,
    photos,
    staff,
    trainers,
    members,
    reviews: makeReviews(a.id, gi, members),
    txns: seedTx(),
    wallet: seedWallet(),
  };
}
