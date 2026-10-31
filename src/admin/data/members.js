import { BR } from './branches';
import { CRM_TEXT } from './crm';
import { PLAN_DAYS } from './plans';
import { D, iso, addDays, uid } from '../lib/utils';

export const M_RAW = [
  ['Aarav Krishnan', '98470 10421', 'kochi', 'Quarterly', 'Active', '2026-12-02', 148, 'Today 14:12', '9A8F3C', 1042],
  ['Sneha Pillai', '94470 55120', 'tvm', 'Annual', 'Active', '2027-03-14', 312, 'Today 09:05', '4B21E7', 2087],
  ['Rohit Varma', '98950 77231', 'kochi', 'Monthly', 'Frozen', '2026-11-05', 64, '08 Oct 2026, 19:15', 'C0D5A9', 1119],
  ['Anagha Nair', '99461 20388', 'kochi', 'Annual', 'Active', '2027-01-22', 276, 'Today 06:48', '7F3E12', 1076],
  [
    'Mohammed Faris',
    '97460 88142',
    'kochi',
    'Quarterly',
    'Expired',
    '2026-09-28',
    91,
    '27 Sep 2026, 18:02',
    '2A9C84',
    1033,
  ],
  ['Devika Menon', '98470 33019', 'tvm', 'Monthly', 'Active', '2026-11-09', 22, 'Yesterday 18:40', 'E61B05', 2101],
  [
    'Joseph Mathew',
    '98950 41277',
    'kochi',
    'Personal Training',
    'Active',
    '2026-11-12',
    37,
    'Today 07:30',
    '5D7A3F',
    1128,
  ],
  ['Neha Suresh', '94960 17654', 'tvm', 'Quarterly', 'Frozen', '2026-12-20', 58, '11 Oct 2026, 07:10', 'B8C402', 2064],
  ['Abhijith Raj', '97781 90216', 'tvm', 'Monthly', 'Expired', '2026-10-02', 18, '01 Oct 2026, 17:55', '13F9DE', 2130],
  ['Keerthana Das', '99460 62810', 'kochi', 'Annual', 'Active', '2027-02-08', 203, 'Today 13:02', '8E26B1', 1054],
  ['Sreejith Kumar', '98470 71563', 'tvm', 'Quarterly', 'Active', '2026-12-11', 84, 'Yesterday 06:15', 'A47D60', 2072],
  ['Fathima Noor', '97460 22395', 'kochi', 'Monthly', 'Active', '2026-11-02', 29, 'Today 10:40', '3C5E98', 1141],
  ['Adithya Varghese', '94470 83902', 'tvm', 'Annual', 'Active', '2027-04-30', 355, 'Today 05:52', 'F20A7B', 2018],
  [
    'Lakshmi Priya',
    '98950 12984',
    'kochi',
    'Personal Training',
    'Active',
    '2026-11-18',
    41,
    '14 Oct 2026, 20:05',
    '6B1D43',
    1135,
  ],
  ['Arun Gopinath', '99610 45723', 'kochi', 'Quarterly', 'Active', '2026-12-29', 111, 'Today 12:20', 'D93F85', 1089],
  ['Maya Thomas', '97781 34680', 'tvm', 'Monthly', 'Active', '2026-11-06', 16, 'Yesterday 19:25', '0E7C29', 2144],
  [
    'Imran Sheikh',
    '98470 66047',
    'kochi',
    'Annual',
    'Expired',
    '2026-08-30',
    240,
    '29 Aug 2026, 18:30',
    '51A6FC',
    1021,
  ],
  ['Jishnu Dev', '94960 29135', 'tvm', 'Personal Training', 'Active', '2026-11-25', 33, 'Today 08:15', 'CA8340', 2152],
];

export function seedMembers() {
  return M_RAW.map((r, i) => {
    const days = PLAN_DAYS[r[3]];
    const m = {
      id: 'm' + (i + 1),
      name: r[0],
      phone: '+91 ' + r[1],
      branch: r[2],
      plan: r[3],
      status: r[4],
      end: r[5],
      visits: r[6],
      last: r[7],
      hex: r[8],
      num: r[9],
      since: iso(addDays(D(r[5]), -days)),
      crm: [],
    };
    if (m.status === 'Frozen') {
      m.freezeStart = i === 2 ? '2026-10-09' : '2026-10-12';
      m.freezeReason = i === 2 ? 'Travel for work, out of station' : 'Shoulder injury, doctor advised rest';
    }
    const nCrm = i < 6 ? 2 : 1;
    for (let k = 0; k < nCrm; k++) {
      const c = CRM_TEXT[(i + k) % CRM_TEXT.length];
      m.crm.push({ id: uid(), channel: c[0], by: c[1], note: c[2], when: c[3], follow: c[4] });
    }
    return m;
  });
}

export const token = (m) => 'FTV-' + BR[m.branch].no + '-' + m.num + '-' + m.hex;
