export const PURCHASE_RAM_OPTIONS = [
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '6', label: '6' },
  { value: '8', label: '8' },
  { value: '12', label: '12' },
  { value: '16', label: '16' },
];

export const PURCHASE_ROM_OPTIONS = [
  { value: '32', label: '32' },
  { value: '64', label: '64' },
  { value: '128', label: '128' },
  { value: '256', label: '256' },
  { value: '512', label: '512' },
  { value: '1TB', label: '1TB' },
];

const RAM_VALUES = new Set(PURCHASE_RAM_OPTIONS.map((entry) => entry.value));
const ROM_VALUES = new Set(PURCHASE_ROM_OPTIONS.map((entry) => entry.value));

export const normalizePurchaseRam = (value) => {
  const next = String(value || '').trim();
  return RAM_VALUES.has(next) ? next : null;
};

export const normalizePurchaseRom = (value) => {
  const next = String(value || '').trim();
  return ROM_VALUES.has(next) ? next : null;
};
