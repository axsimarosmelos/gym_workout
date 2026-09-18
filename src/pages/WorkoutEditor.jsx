import { useState } from 'react';
import { ArrowLeft, Check, Plus, Save, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppStore.jsx';
import { errorMessage, uid, workoutSchema } from '../lib/schema.js';
import { today, number } from '../lib/dates.js';
import { exerciseProgress, workoutVolume } from '../lib/progress.js';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges.js';
import { go } from '../hooks/useHashRoute.js';
import { Field, Message, PageTitle, ProgressBadges } from '../components/UI.jsx';

const freshSet = () => ({ id: uid(), reps: 8, weight: 0 });
const freshExercise = () => ({ id: uid(), name: '', sets: [freshSet()] });
const exercisesFrom = routine => routine.exercises.map(e => ({ id: uid(), name: e.name, sets: Array.from({ length: e.sets }, () => ({ id: uid(), reps: e.reps, weight: e.weight })) }));
export default function WorkoutEditor({ id, routineId }) {
  const { data, dispatch } = useApp();
  const existing = data.workouts.find(w => w.id === id);
  const routine = data.routines.find(r => r.id === routineId);
  const [draft, setDraft] = useState(() => existing ? structuredClone(existing) : { id: uid(), date: today(), createdAt: new Date().toISOString(), title: routine?.name || 'My workout', notes: '', exercises: routine ? exercisesFrom(routine) : [freshExercise()] });
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(routineId || '');
  useUnsavedChanges(dirty);
  if (id && !existing) return <div className="panel"><h1>Workout not found</h1><p>The session may have been deleted.</p><a href="#/workouts" className="btn btn-secondary">Back to workouts</a></div>;
  function update(fn) { setDraft(old => fn(old)); setDirty(true); setMessage(null); }
  function editExercise(eid, fn) { update(d => ({ ...d, exercises: d.exercises.map(e => e.id === eid ? fn(e) : e) })); }
  function changeSet(eid, sid, key, value) { editExercise(eid, e => ({ ...e, sets: e.sets.map(s => s.id === sid ? { ...s, [key]: value } : s) })); }
  function applyRoutine(value) {
    const next = data.routines.find(r => r.id === value);
    if (!next) { setSelectedRoutine(''); return; }
    if (dirty && !window.confirm('Replace the current exercises with this routine?')) return;
    setSelectedRoutine(value);
    update(d => ({ ...d, title: next.name, exercises: exercisesFrom(next) }));
  }
  const normalized = { ...draft, exercises: draft.exercises.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s, reps: s.reps === '' ? NaN : Number(s.reps), weight: s.weight === '' ? NaN : Number(s.weight) })) })) };
  function save(event) {
    event.preventDefault();
    try { const entry = workoutSchema.parse(normalized); dispatch({ type: 'workout/save', entry }); setDirty(false); go('/workouts'); }
    catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  const names = [...new Set([...data.routines.flatMap(r => r.exercises.map(e => e.name)), ...data.workouts.flatMap(w => w.exercises.map(e => e.name))])].sort();
  const validPreview = workoutSchema.safeParse(normalized).success;
  return <><a className="back-link" href="#/workouts"><ArrowLeft size={16} />Workout log</a><PageTitle title={existing ? 'Fine-tune your session.' : 'Put the work on record.'} subtitle="Log completed sets. Use total load in kg; for dumbbells, use the same convention every time." /><form onSubmit={save}><div className="panel editor-header"><div className="form-grid three"><Field label="Session name"><input required maxLength={100} value={draft.title} onChange={e => update(d => ({ ...d, title: e.target.value }))} /></Field><Field label="Training date"><input required type="date" max={today()} value={draft.date} onChange={e => update(d => ({ ...d, date: e.target.value }))} /></Field><Field label="Start from a routine"><select value={selectedRoutine} onChange={e => applyRoutine(e.target.value)}><option value="">Custom session</option>{data.routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field></div></div><datalist id="exercise-names">{names.map(name => <option key={name} value={name} />)}</datalist><div className="exercise-editors">{draft.exercises.map((exercise, index) => <section className="panel exercise-editor" key={exercise.id}><div className="exercise-editor-heading"><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><Field label={`Exercise ${index + 1}`}><input required list="exercise-names" maxLength={100} placeholder="Exercise name" value={exercise.name} onChange={e => editExercise(exercise.id, old => ({ ...old, name: e.target.value }))} /></Field><button type="button" className="icon-btn danger" disabled={draft.exercises.length === 1} aria-label={`Remove exercise ${index + 1}`} onClick={() => update(d => ({ ...d, exercises: d.exercises.filter(e => e.id !== exercise.id) }))}><Trash2 size={17} /></button></div><div className="set-labels"><span>SET</span><span>REPS</span><span>WEIGHT · KG</span><span /></div>{exercise.sets.map((set, i) => <div className="set-row" key={set.id}><span className="set-number">{i + 1}</span><input aria-label={`${exercise.name || `Exercise ${index + 1}`} set ${i + 1} reps`} type="number" inputMode="numeric" required min="1" max="1000" step="1" value={set.reps} onChange={e => changeSet(exercise.id, set.id, 'reps', e.target.value)} /><input aria-label={`${exercise.name || `Exercise ${index + 1}`} set ${i + 1} weight in kilograms`} type="number" inputMode="decimal" required min="0" max="2000" step="0.01" value={set.weight} onChange={e => changeSet(exercise.id, set.id, 'weight', e.target.value)} /><button type="button" className="icon-btn" aria-label={`Remove set ${i + 1} from ${exercise.name}`} disabled={exercise.sets.length === 1} onClick={() => editExercise(exercise.id, old => ({ ...old, sets: old.sets.filter(s => s.id !== set.id) }))}><Trash2 size={15} /></button></div>)}<div className="exercise-editor-footer"><button type="button" className="text-link" disabled={exercise.sets.length >= 50} onClick={() => editExercise(exercise.id, old => ({ ...old, sets: [...old.sets, { ...old.sets.at(-1), id: uid() }] }))}><Plus size={15} />Add set</button>{validPreview && <ProgressBadges progress={exerciseProgress(data.workouts, normalized, normalized.exercises[index])} />}</div></section>)}</div><button type="button" className="btn btn-secondary add-exercise" disabled={draft.exercises.length >= 40} onClick={() => update(d => ({ ...d, exercises: [...d.exercises, freshExercise()] }))}><Plus size={17} />Add exercise</button><div className="panel notes-panel"><Field label="Session notes" hint="Optional: cues, effort, equipment settings, or what to change next time."><textarea rows={3} maxLength={2000} value={draft.notes} onChange={e => update(d => ({ ...d, notes: e.target.value }))} /></Field></div><Message message={message} /><div className="save-bar"><span><strong>{validPreview ? number(workoutVolume(normalized), 0) : '—'}</strong> kg·reps <small>session volume</small></span><button className="btn" type="submit"><Save size={17} />{existing ? 'Save changes' : 'Save workout'}</button></div><p className="fine-print">Use 0 kg for unloaded/bodyweight sets. These retain reps and set counts but add no external-load volume. Exercise names identify your progress history. Session edits do not change routine templates.</p></form></>;
}
