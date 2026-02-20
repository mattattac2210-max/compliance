export interface FilingScheduleItem {
  id: string;
  filingType: string;
  labelKey: string;
  frequency: "monthly" | "quarterly" | "yearly";
  dayOfMonth: number;
  month?: number;
  gateNumber: number;
  description: string;
}

export const FILING_SCHEDULE: FilingScheduleItem[] = [
  { id: "pph21", filingType: "pph21", labelKey: "pph21", frequency: "monthly", dayOfMonth: 20, gateNumber: 4, description: "Employee income tax withholding" },
  { id: "pph23", filingType: "pph23", labelKey: "pph23", frequency: "monthly", dayOfMonth: 20, gateNumber: 4, description: "Service income tax withholding" },
  { id: "pph26", filingType: "pph26", labelKey: "pph26", frequency: "monthly", dayOfMonth: 20, gateNumber: 4, description: "Foreign income tax withholding" },
  { id: "pb1", filingType: "pb1", labelKey: "pb1", frequency: "monthly", dayOfMonth: 20, gateNumber: 4, description: "Hotel/accommodation tax (PB1/SPTPD)" },
  { id: "bpjs_kesehatan", filingType: "bpjs_kesehatan", labelKey: "bpjs_kesehatan", frequency: "monthly", dayOfMonth: 10, gateNumber: 5, description: "Employee health insurance contributions" },
  { id: "bpjs_ketenagakerjaan", filingType: "bpjs_ketenagakerjaan", labelKey: "bpjs_ketenagakerjaan", frequency: "monthly", dayOfMonth: 15, gateNumber: 5, description: "Employee social security contributions" },
  { id: "spt_tahunan", filingType: "spt_tahunan", labelKey: "spt_tahunan", frequency: "yearly", dayOfMonth: 30, month: 4, gateNumber: 4, description: "Annual corporate tax return" },
  { id: "spt_masa", filingType: "spt_masa", labelKey: "spt_masa", frequency: "monthly", dayOfMonth: 20, gateNumber: 4, description: "Periodic tax return" },
];

export function getNextFilingDates(item: FilingScheduleItem, today: Date, count = 3): Date[] {
  const results: Date[] = [];
  if (item.frequency === "yearly" && item.month) {
    const thisYear = new Date(today.getFullYear(), item.month - 1, item.dayOfMonth);
    const nextYear = new Date(today.getFullYear() + 1, item.month - 1, item.dayOfMonth);
    results.push(thisYear >= today ? thisYear : nextYear);
  } else {
    for (let i = 0; i < count; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, item.dayOfMonth);
      if (d >= today || i === 0) results.push(d);
    }
  }
  return results;
}
