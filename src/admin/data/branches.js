export const BR = {
  kochi: {
    id: 'kochi',
    no: 1,
    name: 'Fitaval Kochi Central',
    short: 'Kochi Central',
    addr: '2nd Floor, Marine Plaza, MG Road, Ernakulam, Kochi 682016',
    cap: 60,
    lat: 9.9816,
    lng: 76.2999,
    phone: '+91 484 400 1200',
    amen: ['Sauna', 'Steam Room', 'Functional Rig', 'Locker Rooms', 'Smoothie Bar', 'Car Parking', 'Wi-Fi'],
    rooms: ['Studio A', 'Studio B', 'Strength Floor', 'Cardio Deck'],
  },
  tvm: {
    id: 'tvm',
    no: 2,
    name: 'Fitaval Trivandrum Hub',
    short: 'Trivandrum Hub',
    addr: 'Ground Floor, Kowdiar Square, Vellayambalam, Thiruvananthapuram 695003',
    cap: 40,
    lat: 8.5241,
    lng: 76.9366,
    phone: '+91 471 400 2400',
    amen: ['Cardio Loft', 'Free Weights Zone', 'Locker Rooms', 'Physio Corner', 'Wi-Fi'],
    rooms: ['Studio 1', 'Weights Zone', 'Cardio Loft'],
  },
};

export const BRANCH_OPTS = [
  { id: 'all', name: 'All Branches (Global)' },
  { id: 'kochi', name: BR.kochi.name },
  { id: 'tvm', name: BR.tvm.name },
];

export const ROOM_BRANCH = {};
Object.values(BR).forEach((b) => b.rooms.forEach((r) => (ROOM_BRANCH[r] = b.id)));

export const ALL_ROOMS = [...BR.kochi.rooms, ...BR.tvm.rooms];
