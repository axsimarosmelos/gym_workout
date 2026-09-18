import { z } from 'zod';
import { today, validDay } from './dates.js';

const id = z.string().min(1).max(100);
const name = z.string().trim().min(1, 'Enter a name.').max(100);
const day = z.string().refine(validDay, 'Use a valid calendar date.');
const recordedDay = day.refine(d => d <= today(), 'Log today or an earlier date.');
const load = z.number().finite().min(0).max(2000);
const reps = z.number().int().min(1).max(1000);
const unique = values => new Set(values).size === values.length;
export const normalizeName = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
export const workoutSchema = z.object({
  id, date: recordedDay, createdAt: z.string().datetime(), title: name, notes: z.string().max(2000),
  exercises: z.array(z.object({
    id, name, sets: z.array(z.object({ id, reps, weight: load })).min(1).max(50).refine(items => unique(items.map(s => s.id)), 'Duplicate set IDs.'),
  })).min(1).max(40).refine(items => unique(items.map(x => x.id)), 'Duplicate exercise IDs.').refine(items => unique(items.map(x => normalizeName(x.name))), 'Use one entry per exercise; add sets to that entry.'),
});
export const routineSchema = z.object({
  id, name, description: z.string().max(500),
  exercises: z.array(z.object({ id, name, sets: z.number().int().min(1).max(50), reps, weight: load })).min(1).max(40).refine(items => unique(items.map(x => x.id)), 'Duplicate exercise IDs.')
    .refine(items => unique(items.map(x => normalizeName(x.name))), 'Exercise names must be unique within a routine.'),
});
const optional = (min, max, integer = false) => (integer ? z.number().int() : z.number().finite()).min(min).max(max).nullable();
export const metricSchema = z.object({
  date: recordedDay,
  weight: z.number().finite().min(1).max(500),
  muscle: optional(0.1, 500), fat: optional(0, 100),
  waist: optional(1, 400), sleep: optional(0, 24), steps: optional(0, 200000, true), calories: optional(0, 20000, true),
}).refine(m => m.muscle == null || m.muscle <= m.weight, 'Skeletal muscle mass cannot exceed body weight.');
export const settingsSchema = z.object({ programStart: day, phaseNames: z.array(z.string().trim().min(1).max(30)).length(6) });
export const dataSchema = z.object({
  version: z.literal(1), settings: settingsSchema,
  workouts: z.array(workoutSchema).max(20000).refine(items => unique(items.map(x => x.id)), 'Duplicate workout IDs.'),
  metrics: z.array(metricSchema).max(20000).refine(items => unique(items.map(x => x.date)), 'Duplicate measurement dates.'),
  routines: z.array(routineSchema).max(100).refine(items => unique(items.map(x => x.id)), 'Duplicate routine IDs.'),
  supplements: z.record(recordedDay, z.object({ protein: z.boolean(), creatine: z.boolean() })),
});
export function errorMessage(error) {
  if (error instanceof z.ZodError) return error.issues.map(issue => `${issue.path.join('.') || 'Entry'}: ${issue.message}`).slice(0, 3).join(' ');
  return error?.message || 'Something went wrong. Please try again.';
}
export function uid() { return crypto.randomUUID(); }
export function optionalNumber(value) { return value === '' || value == null ? null : Number(value); }
