// js/utils/portions.js
// Sprint 1 — Calcul des portions par membre de la famille

export const FAMILY_MEMBERS = [
  { name: 'Nico',   type: 'adulte', multiplier: 1.0 },
  { name: 'Flo',    type: 'adulte', multiplier: 1.0 },
  { name: 'Sacha',  type: 'enfant', age: 12, multiplier: 0.8 },
  { name: 'Victor', type: 'enfant', age: 9,  multiplier: 0.8 },
];

export function getTotalMultiplier() {
  return FAMILY_MEMBERS.reduce((sum, m) => sum + m.multiplier, 0);
}

export function calculatePortions(grammage, multiplier = null, memberName = null) {
  let factor;

  if (memberName !== null) {
    const member = FAMILY_MEMBERS.find(m => m.name === memberName);
    factor = member ? member.multiplier : getTotalMultiplier();
  } else if (multiplier !== null) {
    factor = multiplier;
  } else {
    factor = getTotalMultiplier();
  }

  return Math.round(grammage * factor);
}
