export const DEFAULT_RATE = 0;
export const PROVIDERS = [
  { id: 'meralco', name: 'Meralco', region: 'Metro Manila, Luzon' },
  { id: 'batelec', name: 'Batelec II', region: 'Batangas' },
  { id: 'vec', name: 'VECO', region: 'Cebu' },
  { id: 'dlpc', name: 'Davao Light', region: 'Davao' },
  { id: 'other', name: 'Other / manual', region: 'Set your own rate' },
];

export const formatPeso = (value, digits = 0) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0);

export const formatKwh = (value, digits = 0) =>
  `${Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} kWh`;

export const monthlyKwh = (wattage, quantity, hours) =>
  Math.round(((Number(wattage) * Number(quantity) * Number(hours) * 30) / 1000) * 10) / 10;

export const today = new Date().toLocaleDateString('en-PH', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export const greetingFor = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export function getMonthlyUsage(bills, readings, rate) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const monthBills = bills.filter((bill) => {
      const end = new Date(`${bill.periodEnd}T00:00:00`);
      return end.getFullYear() === year && end.getMonth() === monthIndex;
    });
    const monthReadings = readings.filter((reading) => {
      const day = new Date(`${reading.date}T00:00:00`);
      return day.getFullYear() === year && day.getMonth() === monthIndex;
    });
    const kwh = monthBills.length
      ? monthBills.reduce((sum, bill) => sum + bill.kwh, 0)
      : monthReadings.reduce((sum, reading) => sum + reading.kwh, 0);
    const cost = monthBills.length
      ? monthBills.reduce((sum, bill) => sum + (bill.actual ?? bill.estimated), 0)
      : monthReadings.reduce((sum, reading) => sum + (reading.cost ?? reading.kwh * rate), 0);
    const monthlyRate = monthBills.length
      ? monthBills.reduce((sum, bill) => sum + bill.rate, 0) / monthBills.length
      : rate;

    return {
      label: date.toLocaleDateString('en-PH', { month: 'short' }),
      year,
      kwh: Math.round(kwh * 10) / 10,
      cost: Math.round(cost),
      rate: monthlyRate,
      hasData: monthBills.length > 0 || monthReadings.length > 0,
    };
  });
}

export function getWeeklyUsage(readings, rate = 0) {
  const todayDate = new Date();
  const entries = new Map(readings.map((item) => [item.date, item]));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 6 + index);
    const date = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, '0'),
      String(day.getDate()).padStart(2, '0'),
    ].join('-');
    const reading = entries.get(date);
    return {
      label: day.toLocaleDateString('en-PH', { weekday: 'short' }),
      kwh: reading?.kwh || 0,
      cost: reading?.cost ?? (reading?.kwh || 0) * rate,
      hasData: Boolean(reading),
    };
  });
}
