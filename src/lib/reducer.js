import { dataSchema, workoutSchema, metricSchema, routineSchema, settingsSchema } from './schema.js';
import { validDay, today } from './dates.js';

export function reducer(data, action) {
  switch (action.type) {
    case 'workout/save': {
      const entry = workoutSchema.parse(action.entry);
      return { ...data, workouts: [...data.workouts.filter(w => w.id !== entry.id), entry] };
    }
    case 'workout/delete': return { ...data, workouts: data.workouts.filter(w => w.id !== action.id) };
    case 'metric/save': {
      const entry = metricSchema.parse(action.entry);
      return { ...data, metrics: [...data.metrics.filter(m => m.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)) };
    }
    case 'metric/delete': return { ...data, metrics: data.metrics.filter(m => m.date !== action.date) };
    case 'routine/save': {
      const entry = routineSchema.parse(action.entry);
      return { ...data, routines: [...data.routines.filter(r => r.id !== entry.id), entry] };
    }
    case 'routine/delete': return { ...data, routines: data.routines.filter(r => r.id !== action.id) };
    case 'supplement/toggle': {
      if (!validDay(action.date) || action.date > today() || !['protein', 'creatine'].includes(action.kind)) throw new Error('Invalid supplement entry.');
      const old = data.supplements[action.date] || { protein: false, creatine: false };
      return { ...data, supplements: { ...data.supplements, [action.date]: { ...old, [action.kind]: !old[action.kind] } } };
    }
    case 'settings/save': return { ...data, settings: settingsSchema.parse(action.settings) };
    case 'data/import': return dataSchema.parse(action.data);
    default: throw new Error('Unknown action.');
  }
}
