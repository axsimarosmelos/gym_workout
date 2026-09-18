import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, addMonths, sixMonths, stamp, today, validDay } from '../src/lib/dates.js';
import { defaultData } from '../src/data/templates.js';
import { dataSchema, metricSchema, workoutSchema } from '../src/lib/schema.js';
import { chronological, exerciseProgress, workoutVolume } from '../src/lib/progress.js';
import { reducer } from '../src/lib/reducer.js';
import { createStore, STORAGE_KEY } from '../src/state/storage.js';
import { parseBackup } from '../src/lib/backup.js';

function exercise(weight = 50, reps = 5, sets = 3, name = 'Bench press') {
  return { id: 'bench', name, sets: Array.from({ length: sets }, (_, i) => ({ id: `set-${i}`, weight, reps })) };
}
function workout(id, date, e = exercise(), createdAt = `${date}T12:00:00.000Z`) {
  return { id, date, createdAt, title: 'Upper', notes: '', exercises: [e] };
}
function metric(date = '2025-01-01') {
  return { date, weight: 80, muscle: 35, fat: 18, waist: null, sleep: null, steps: null, calories: null };
}
function memory(raw = null) {
  const map = new Map(raw == null ? [] : [[STORAGE_KEY, raw]]);
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), map };
}

test('first session establishes a baseline, not a fabricated PR', () => {
  const current = workout('a', '2025-01-01');
  const p = exerciseProgress([], current, current.exercises[0]);
  assert.equal(p.baseline, true); assert.equal(p.loadPR, false); assert.equal(p.volumePR, false);
  assert.equal(p.volume, 750);
});
test('higher load can be a PR even when total volume falls', () => {
  const old = workout('a', '2025-01-01', exercise(50, 10, 3));
  const current = workout('b', '2025-01-02', exercise(60, 5, 3));
  const p = exerciseProgress([old], current, current.exercises[0]);
  assert.equal(p.loadPR, true); assert.equal(p.volumePR, false);
  assert.equal(p.change, -600); assert.equal(p.percent, -40);
});
test('more reps at the same load can set a volume PR', () => {
  const old = workout('a', '2025-01-01');
  const current = workout('b', '2025-01-02', exercise(50, 6, 3));
  const p = exerciseProgress([old], current, current.exercises[0]);
  assert.equal(p.loadPR, false); assert.equal(p.volumePR, true); assert.equal(p.percent, 20);
});
test('volume improvement uses the last session; PR uses all earlier sessions', () => {
  const history = [workout('a', '2025-01-01', exercise(70, 8, 3)), workout('b', '2025-01-02', exercise(50, 4, 3))];
  const current = workout('c', '2025-01-03', exercise(60, 5, 3));
  const p = exerciseProgress(history, current, current.exercises[0]);
  assert.equal(p.change, 300); assert.equal(p.percent, 50);
  assert.equal(p.loadPR, false); assert.equal(p.volumePR, false);
});
test('records compare only the same exercise with normalized names', () => {
  const history = [workout('a', '2025-01-01', exercise(50, 5, 3, '  BENCH   press ')), workout('b', '2025-01-02', exercise(200, 5, 3, 'Deadlift'))];
  const current = workout('c', '2025-01-03', exercise(60));
  assert.equal(exerciseProgress(history, current, current.exercises[0]).loadPR, true);
});
test('backdated edits exclude their own record and all future records', () => {
  const current = workout('edit', '2025-01-02', exercise(60));
  const history = [workout('older', '2025-01-01', exercise(50)), workout('edit', '2025-01-02', exercise(100)), workout('future', '2025-01-03', exercise(200))];
  const p = exerciseProgress(history, current, current.exercises[0]);
  assert.equal(p.loadPR, true); assert.equal(p.volumePR, true);
});
test('same-day sessions have stable creation-time ordering', () => {
  const a = workout('a', '2025-01-01', exercise(50), '2025-01-01T09:00:00.000Z');
  const b = workout('b', '2025-01-01', exercise(60), '2025-01-01T18:00:00.000Z');
  assert.ok(chronological(a, b) < 0);
  assert.equal(exerciseProgress([a], b, b.exercises[0]).loadPR, true);
  assert.equal(exerciseProgress([b], a, a.exercises[0]).baseline, true);
});
test('zero-load sets preserve reps without division by zero', () => {
  const old = workout('a', '2025-01-01', exercise(0));
  const current = workout('b', '2025-01-02', exercise(5));
  assert.equal(workoutVolume(old), 0);
  assert.equal(exerciseProgress([old], current, current.exercises[0]).percent, null);
  assert.equal(exerciseProgress([old], current, current.exercises[0]).change, 75);
});
test('date helpers handle leap years and clamped month boundaries', () => {
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29');
  assert.equal(addMonths('2025-01-31', 1), '2025-02-28');
  assert.equal(addMonths('2025-01-31', 6), '2025-07-31');
  assert.equal(sixMonths('2025-01-31')[1].end, '2025-03-30');
  assert.equal(addDays('2025-03-09', 1), '2025-03-10');
  assert.equal(stamp('2025-03-10') - stamp('2025-03-09'), 86400000);
  assert.equal(validDay('2025-02-30'), false);
  assert.equal(validDay('2024-02-29'), true);
});
test('measurements upsert by date and keep missing values distinct from zero', () => {
  let data = defaultData('2025-01-01');
  data = reducer(data, { type: 'metric/save', entry: metric() });
  data = reducer(data, { type: 'metric/save', entry: { ...metric(), weight: 81, sleep: 0, fat: null } });
  assert.equal(data.metrics.length, 1); assert.equal(data.metrics[0].weight, 81);
  assert.equal(data.metrics[0].sleep, 0); assert.equal(data.metrics[0].fat, null);
});
test('invalid weights, body composition, fractions, duplicates and future dates fail validation', () => {
  assert.throws(() => metricSchema.parse({ ...metric(), muscle: 90 }));
  assert.throws(() => metricSchema.parse({ ...metric(), fat: 101 }));
  assert.throws(() => metricSchema.parse({ ...metric(), weight: NaN }));
  assert.throws(() => metricSchema.parse({ ...metric(), date: addDays(today(), 1) }));
  assert.throws(() => workoutSchema.parse(workout('a', '2025-01-01', exercise(-5))));
  assert.throws(() => workoutSchema.parse(workout('a', '2025-01-01', exercise(5, 1.5))));
  const duplicated = workout('a', '2025-01-01');
  duplicated.exercises.push({ ...exercise(), id: 'other', name: ' bench   PRESS ' });
  assert.throws(() => workoutSchema.parse(duplicated));
  const sets = workout('a', '2025-01-01'); sets.exercises[0].sets[1].id = sets.exercises[0].sets[0].id;
  assert.throws(() => workoutSchema.parse(sets));
});
test('supplement toggles are independent, date-specific, and reversible', () => {
  const initial = defaultData('2025-01-01');
  let data = reducer(initial, { type: 'supplement/toggle', date: '2025-01-02', kind: 'protein' });
  assert.deepEqual(data.supplements['2025-01-02'], { protein: true, creatine: false });
  data = reducer(data, { type: 'supplement/toggle', date: '2025-01-01', kind: 'creatine' });
  assert.equal(data.supplements['2025-01-02'].creatine, false);
  data = reducer(data, { type: 'supplement/toggle', date: '2025-01-02', kind: 'protein' });
  assert.equal(data.supplements['2025-01-02'].protein, false);
  assert.throws(() => reducer(data, { type: 'supplement/toggle', date: 'invalid', kind: 'protein' }));
  assert.deepEqual(initial.supplements, {});
});
test('workout editing replaces a record and routine deletion preserves history', () => {
  let data = defaultData('2025-01-01');
  data = reducer(data, { type: 'workout/save', entry: workout('a', '2025-01-01') });
  data = reducer(data, { type: 'workout/save', entry: workout('a', '2025-01-01', exercise(65)) });
  data = reducer(data, { type: 'routine/delete', id: 'upper' });
  assert.equal(data.workouts.length, 1); assert.equal(workoutVolume(data.workouts[0]), 975);
  assert.equal(data.routines.length, 2);
  data = reducer(data, { type: 'workout/delete', id: 'a' }); assert.equal(data.workouts.length, 0);
});
test('successful transactions survive a new store instance', () => {
  const disk = memory(); const store = createStore(disk);
  store.dispatch({ type: 'workout/save', entry: workout('a', '2025-01-01') });
  const reloaded = createStore(disk);
  assert.equal(reloaded.getSnapshot().data.workouts.length, 1);
});
test('failed storage writes preserve both the previous snapshot and disk data', () => {
  const disk = memory(JSON.stringify(defaultData('2025-01-01')));
  const oldRaw = disk.getItem(STORAGE_KEY);
  const store = createStore(disk); const oldSnapshot = store.getSnapshot();
  disk.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => store.dispatch({ type: 'workout/save', entry: workout('a', '2025-01-01') }), /Could not save/);
  assert.equal(store.getSnapshot(), oldSnapshot);
  assert.equal(disk.getItem(STORAGE_KEY), oldRaw);
});
test('unreadable storage is not overwritten; an explicit valid import can restore it', () => {
  const disk = memory('{broken json'); const store = createStore(disk);
  assert.ok(store.getSnapshot().problem);
  assert.throws(() => store.dispatch({ type: 'workout/save', entry: workout('a', '2025-01-01') }));
  assert.equal(disk.getItem(STORAGE_KEY), '{broken json');
  store.dispatch({ type: 'data/import', data: defaultData('2025-01-01') });
  assert.equal(store.getSnapshot().problem, null);
});
test('a stale tab rereads saved data before its own transaction', () => {
  const disk = memory(); const a = createStore(disk); const b = createStore(disk);
  a.dispatch({ type: 'workout/save', entry: workout('a', '2025-01-01') });
  b.dispatch({ type: 'workout/save', entry: workout('b', '2025-01-02') });
  assert.equal(b.getSnapshot().data.workouts.length, 2);
  a.reload(); assert.equal(a.getSnapshot().data.workouts.length, 2);
});
test('full backup round-trip preserves settings, workouts, routines, metrics and supplements', () => {
  let data = defaultData('2025-01-01');
  data = reducer(data, { type: 'workout/save', entry: workout('a', '2025-01-01') });
  data = reducer(data, { type: 'metric/save', entry: metric() });
  data = reducer(data, { type: 'supplement/toggle', date: '2025-01-01', kind: 'creatine' });
  assert.deepEqual(parseBackup(JSON.stringify(data)), data);
  assert.throws(() => parseBackup('{"version":2}'));
  assert.throws(() => parseBackup('{not json'));
  assert.throws(() => dataSchema.parse({ ...data, workouts: [...data.workouts, ...data.workouts] }));
});
test('blocked storage produces an explicit problem rather than a false saved state', () => {
  const store = createStore({ getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); } });
  assert.ok(store.getSnapshot().problem);
  assert.throws(() => store.dispatch({ type: 'data/import', data: defaultData('2025-01-01') }), /Could not save/);
});
