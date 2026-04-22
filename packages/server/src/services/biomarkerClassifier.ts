import type { Biomarker, ClassifiedBiomarker, Classification, Patient } from "../types/index.js";
import { getOptimalRange } from "../config/optimalRanges.js";

function normalizeEnglishName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .replace(/-/g, "_");
}

export function classifyBiomarker(
  biomarker: Biomarker,
  patient: Patient
): ClassifiedBiomarker {
  const { value, qualifier, referenceMin, referenceMax } = biomarker;

  const normalizedName = normalizeEnglishName(biomarker.englishName);
  const optimalRange = getOptimalRange(normalizedName, patient.age, patient.sex);

  let classification: Classification = "normal";
  let optimalMin: number | null = null;
  let optimalMax: number | null = null;

  if (optimalRange) {
    optimalMin = optimalRange.min;
    optimalMax = optimalRange.max;
  }

  if (value === null) {
    return {
      ...biomarker,
      optimalMin,
      optimalMax,
      classification: "normal",
    };
  }

  let effectiveValue = value;
  if (qualifier === "<") {
    effectiveValue = value;
  } else if (qualifier === ">") {
    effectiveValue = value;
  }

  const isOutOfReference = 
    (referenceMin !== null && effectiveValue < referenceMin) ||
    (referenceMax !== null && effectiveValue > referenceMax);

  if (isOutOfReference) {
    classification = "out_of_range";
  } else if (optimalRange) {
    const isOutOfOptimal =
      (optimalMin !== null && effectiveValue < optimalMin) ||
      (optimalMax !== null && effectiveValue > optimalMax);

    if (isOutOfOptimal) {
      classification = "normal";
    } else {
      classification = "optimal";
    }
  } else {
    classification = "normal";
  }

  if (qualifier === "<" && referenceMax !== null && value <= referenceMax) {
    if (optimalRange && optimalMax !== null && value <= optimalMax) {
      classification = "optimal";
    } else if (optimalRange) {
      classification = "normal";
    }
  }

  if (qualifier === ">" && referenceMin !== null && value >= referenceMin) {
    classification = "out_of_range";
  }

  return {
    ...biomarker,
    optimalMin,
    optimalMax,
    classification,
  };
}

export function classifyAllBiomarkers(
  biomarkers: Biomarker[],
  patient: Patient
): ClassifiedBiomarker[] {
  return biomarkers.map((biomarker) => classifyBiomarker(biomarker, patient));
}
