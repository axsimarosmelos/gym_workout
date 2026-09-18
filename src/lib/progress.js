import { normalizeName } from './schema.js';

export const exerciseVolume = exercise => exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
export const workoutVolume = workout => workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
export const bestLoad = exercise => Math.max(0, ...exercise.sets.map(set => set.weight));
export function chronological(a, b) { return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id); }

// Compare only this exercise, only earlier sessions; exclude the edited record.
export function exerciseProgress(workouts, current, exercise) {
  const history = workouts.filter(w => w.id !== current.id && chronological(w, current) < 0)
    .sort(chronological)
    .flatMap(w => w.exercises.filter(e => normalizeName(e.name) === normalizeName(exercise.name)));
  const volume = exerciseVolume(exercise);
  if (!history.length) return { baseline: true, volume, loadPR: false, volumePR: false, change: null, percent: null };
  const previous = exerciseVolume(history.at(-1));
  const change = volume - previous;
  return {
    baseline: false, volume, previous, change,
    percent: previous > 0 ? change / previous * 100 : null,
    loadPR: bestLoad(exercise) > Math.max(...history.map(bestLoad)),
    volumePR: volume > Math.max(...history.map(exerciseVolume)),
  };
}
