export type Classification = "optimal" | "normal" | "out_of_range";

export interface Patient {
  dateOfBirth: string;
  age: number;
  sex: "male" | "female";
  bloodType?: string;
  rhFactor?: string;
  reportDate: string;
}

export interface ClassifiedBiomarker {
  originalName: string;
  englishName: string;
  value: number | null;
  qualifier: "<" | ">" | "none";
  originalUnit: string;
  standardizedUnit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  optimalMin: number | null;
  optimalMax: number | null;
  category: string;
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
