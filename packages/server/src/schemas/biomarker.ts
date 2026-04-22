import { z } from "zod";

export const BiomarkerSchema = z.object({
  originalName: z.string(),
  englishName: z.string(),
  value: z.number().nullable(),
  qualifier: z.enum(["<", ">", "none"]).default("none"),
  originalUnit: z.string(),
  standardizedUnit: z.string(),
  referenceMin: z.number().nullable(),
  referenceMax: z.number().nullable(),
  category: z.string(),
});

export const ReportSchema = z.object({
  patient: z.object({
    dateOfBirth: z.string(),
    age: z.number(),
    sex: z.enum(["male", "female"]),
    bloodType: z.string().optional(),
    rhFactor: z.string().optional(),
    reportDate: z.string(),
  }),
  biomarkers: z.array(BiomarkerSchema),
});

export type ReportData = z.infer<typeof ReportSchema>;
