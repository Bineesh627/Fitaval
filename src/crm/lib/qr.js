// Member check-in QR tokens, e.g. "FTV-1-1042-9A8F3C".
// Tokens are derived deterministically from the member id, so the same member
// always gets the same QR code and a scan can be matched back to a member.

function fnv1a(str, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function memberQr(member) {
  if (!member?.id) return "";
  const seq = (fnv1a(member.id) % 9000) + 1000;
  const sig = (fnv1a(member.id, 0x9747b28c) & 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  return `FTV-1-${seq}-${sig}`;
}

export const normalizeQr = (raw) => (raw || "").trim().toUpperCase();

export function findMemberByQr(members, raw) {
  const code = normalizeQr(raw);
  if (!code) return null;
  return members.find((m) => memberQr(m) === code) || null;
}
