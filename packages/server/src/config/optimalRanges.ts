import type { OptimalRangeConfig } from "../types/index.js";

export const optimalRanges: Record<string, OptimalRangeConfig> = {
  hemoglobin: {
    male: {
      "18-50": { min: 14.0, max: 17.0 },
      "50+": { min: 13.5, max: 16.5 },
      default: { min: 13.5, max: 17.0 },
    },
    female: {
      "18-50": { min: 12.5, max: 15.5 },
      "50+": { min: 12.0, max: 15.0 },
      default: { min: 12.0, max: 15.5 },
    },
  },
  hematocrit: {
    male: {
      default: { min: 40.0, max: 50.0 },
    },
    female: {
      default: { min: 36.0, max: 46.0 },
    },
  },
  total_cholesterol: {
    male: {
      default: { min: null, max: 180 },
    },
    female: {
      default: { min: null, max: 180 },
    },
  },
  ldl_cholesterol: {
    male: {
      default: { min: null, max: 100 },
    },
    female: {
      default: { min: null, max: 100 },
    },
  },
  hdl_cholesterol: {
    male: {
      default: { min: 50, max: null },
    },
    female: {
      default: { min: 55, max: null },
    },
  },
  triglycerides: {
    male: {
      default: { min: null, max: 100 },
    },
    female: {
      default: { min: null, max: 100 },
    },
  },
  glucose: {
    male: {
      default: { min: 75, max: 95 },
    },
    female: {
      default: { min: 75, max: 95 },
    },
  },
  hba1c_ngsp: {
    male: {
      default: { min: null, max: 5.2 },
    },
    female: {
      default: { min: null, max: 5.2 },
    },
  },
  hba1c_ifcc: {
    male: {
      default: { min: null, max: 33 },
    },
    female: {
      default: { min: null, max: 33 },
    },
  },
  creatinine: {
    male: {
      "18-50": { min: 0.7, max: 1.1 },
      "50+": { min: 0.7, max: 1.2 },
      default: { min: 0.7, max: 1.2 },
    },
    female: {
      "18-50": { min: 0.6, max: 1.0 },
      "50+": { min: 0.6, max: 1.1 },
      default: { min: 0.6, max: 1.1 },
    },
  },
  urea: {
    male: {
      default: { min: 15, max: 40 },
    },
    female: {
      default: { min: 15, max: 40 },
    },
  },
  uric_acid: {
    male: {
      default: { min: 3.5, max: 7.0 },
    },
    female: {
      default: { min: 2.5, max: 6.0 },
    },
  },
  alt: {
    male: {
      default: { min: null, max: 40 },
    },
    female: {
      default: { min: null, max: 32 },
    },
  },
  ast: {
    male: {
      default: { min: null, max: 40 },
    },
    female: {
      default: { min: null, max: 32 },
    },
  },
  tsh: {
    male: {
      default: { min: 0.5, max: 2.5 },
    },
    female: {
      default: { min: 0.5, max: 2.5 },
    },
  },
  vitamin_d: {
    male: {
      default: { min: 40, max: 80 },
    },
    female: {
      default: { min: 40, max: 80 },
    },
  },
  vitamin_b12: {
    male: {
      default: { min: 400, max: 900 },
    },
    female: {
      default: { min: 400, max: 900 },
    },
  },
  ferritin: {
    male: {
      default: { min: 50, max: 200 },
    },
    female: {
      "18-50": { min: 30, max: 150 },
      "50+": { min: 50, max: 200 },
      default: { min: 30, max: 200 },
    },
  },
  crp: {
    male: {
      default: { min: null, max: 1.0 },
    },
    female: {
      default: { min: null, max: 1.0 },
    },
  },
};

export function getOptimalRange(
  biomarkerKey: string,
  age: number,
  sex: "male" | "female"
): { min: number | null; max: number | null } | null {
  const config = optimalRanges[biomarkerKey];
  if (!config) return null;

  const sexConfig = config[sex];
  if (!sexConfig) return null;

  for (const [ageRange, range] of Object.entries(sexConfig)) {
    if (ageRange === "default") continue;

    const [minAge, maxAge] = ageRange.split("-").map((s) => {
      if (s.endsWith("+")) return parseInt(s);
      return parseInt(s);
    });

    if (ageRange.endsWith("+")) {
      if (age >= minAge) return range;
    } else {
      if (age >= minAge && age <= maxAge) return range;
    }
  }

  return sexConfig.default || null;
}
