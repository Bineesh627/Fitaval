export const PLANS0 = [
  {
    id: 'p1',
    name: 'Monthly',
    days: 30,
    price: 1999,
    popular: false,
    subs: 182,
    perks: ['Unlimited gym floor access', '2 group classes per week', 'Locker access', 'Flutter app check-in'],
  },
  {
    id: 'p2',
    name: 'Quarterly',
    days: 90,
    price: 5299,
    popular: true,
    subs: 241,
    perks: [
      'Unlimited gym floor access',
      'Unlimited group classes',
      'Free body composition scan',
      'One freeze up to 14 days',
      'Priority class booking',
    ],
  },
  {
    id: 'p3',
    name: 'Annual',
    days: 365,
    price: 17999,
    popular: false,
    subs: 158,
    perks: [
      'Unlimited gym floor and classes',
      'Two freezes up to 30 days each',
      'Quarterly progress review',
      '2 guest passes every month',
      'Free towel service',
    ],
  },
  {
    id: 'p4',
    name: 'Personal Training',
    days: 30,
    price: 7499,
    popular: false,
    subs: 61,
    perks: [
      '12 one-on-one sessions',
      'Custom training and nutrition plan',
      'Weekly progress tracking',
      'Gym floor access included',
    ],
  },
];

export const PLAN_DAYS = { Monthly: 30, Quarterly: 90, Annual: 365, 'Personal Training': 30 };
