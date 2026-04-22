export type Classification = "optimal" | "normal" | "out_of_range";

export interface Patient {
  dateOfBirth: string;
  age: number;
  sex: "male" | "female";
  bloodType?: string;
  rhFactor?: string;
  reportDate: string;
}

export interface Biomarker {
  originalName: string;
  englishName: string;
  value: number | null;
  qualifier: "<" | ">" | "none";
  originalUnit: string;
  standardizedUnit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  category: string;
}

export interface ClassifiedBiomarker extends Biomarker {
  optimalMin: number | null;
  optimalMax: number | null;
  classification: Classification;
}

export interface CategoryGroup {
  name: string;
  biomarkers: ClassifiedBiomarker[];
}

export interface APIResponse {
  patient: Patient;
  categories: CategoryGroup[];
  metadata: {
    extractionMethod: "text" | "vision_fallback";
    processedAt: string;
  };
}

export interface OptimalRange {
  min: number | null;
  max: number | null;
}

export interface AgeRanges {
  [ageRange: string]: OptimalRange;
}

export interface OptimalRangeConfig {
  male: AgeRanges;
  female: AgeRanges;
}
