import { useState } from 'react';
import { ArrowUpRight, Copy, Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppStore.jsx';
import { errorMessage, routineSchema, uid } from '../lib/schema.js';
import { number } from '../lib/dates.js';
import { Empty, Field, Message, PageTitle } from '../components/UI.jsx';
import Modal from '../components/Modal.jsx';

const newExercise = () => ({ id: uid(), name: '', sets: 3, reps: 5, weight: 0 });
function RoutineEditor({ routine, onClose }) {
  const { dispatch } = useApp();
  const [draft, setDraft] = useState(() => structuredClone(routine));
  const [message, setMessage] = useState(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(routine);
  function close() { if (!dirty || window.confirm('Discard your unsaved routine changes?')) onClose(); }
  function edit(id, key, value) { setDraft(d => ({ ...d, exercises: d.exercises.map(e => e.id === id ? { ...e, [key]: value } : e) })); }
  function save(event) {
    event.preventDefault();
    try {
      const entry = routineSchema.parse({ ...draft, exercises: draft.exercises.map(e => ({ ...e, sets: e.sets === '' ? NaN : Number(e.sets), reps: e.reps === '' ? NaN : Number(e.reps), weight: e.weight === '' ? NaN : Number(e.weight) })) });
      dispatch({ type: 'routine/save', entry }); onClose();
    } catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  return <Modal title="Make this routine yours." onClose={close}><form onSubmit={save}><Field label="Routine name"><input required maxLength={100} value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></Field><Field label="Description"><input maxLength={500} value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} /></Field><div className="routine-editor-list">{draft.exercises.map((e, i) => <div className="routine-edit-row" key={e.id}><div className="routine-edit-name"><Field label={`Exercise ${i + 1}`}><input required maxLength={100} placeholder="Exercise name" value={e.name} onChange={event => edit(e.id, 'name', event.target.value)} /></Field><button type="button" className="icon-btn danger" disabled={draft.exercises.length === 1} aria-label={`Remove exercise ${i + 1}`} onClick={() => setDraft(d => ({ ...d, exercises: d.exercises.filter(x => x.id !== e.id) }))}><Trash2 size={17} /></button></div><div className="form-grid three">{[['sets', 'Sets', 1, 50, 1], ['reps', 'Reps / set', 1, 1000, 1], ['weight', 'Weight · kg', 0, 2000, 0.01]].map(([key, label, min, max, step]) => <Field key={key} label={label}><input required type="number" inputMode={key === 'weight' ? 'decimal' : 'numeric'} min={min} max={max} step={step} value={e[key]} onChange={event => edit(e.id, key, event.target.value)} /></Field>)}</div></div>)}</div><button className="text-link" type="button" disabled={draft.exercises.length >= 40} onClick={() => setDraft(d => ({ ...d, exercises: [...d.exercises, newExercise()] }))}><Plus size={17} />Add exercise</button><Message message={message} /><div className="form-actions"><button type="button" className="btn btn-secondary" onClick={close}>Cancel</button><button type="submit" className="btn">Save routine</button></div></form></Modal>;
}
export default function Routines() {
  const { data, dispatch } = useApp();
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  function duplicate(r) { setEditing({ ...structuredClone(r), id: uid(), name: `${r.name.slice(0, 90)} copy`, exercises: r.exercises.map(e => ({ ...e, id: uid() })) }); }
  function remove(r) {
    if (!window.confirm(`Delete the “${r.name}” template? Logged workouts will stay in your history.`)) return;
    try { dispatch({ type: 'routine/delete', id: r.id }); setMessage({ kind: 'success', text: 'Routine deleted. Your workout history is unchanged.' }); }
    catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  return <><PageTitle title="A plan for the next session." subtitle="Start with a heavy-day template. Choose your loads, change the exercises, and make it yours." action={<button className="btn" onClick={() => setEditing({ id: uid(), name: '', description: '', exercises: [newExercise()] })}><Plus size={17} />New routine</button>} /><Message message={message} /><div className="routine-grid">{data.routines.map((r, i) => <article className="panel routine-card" key={r.id}><div className={`routine-art routine-color-${i % 3}`}><span className="routine-art-number">0{i + 1}</span><Dumbbell size={64} strokeWidth={1.3} /><span className="routine-art-tag">YOUR TRAINING TEMPLATE</span></div><div className="routine-card-body"><div className="routine-card-title"><h2>{r.name}</h2><span className="badge neutral">{r.exercises.reduce((sum, e) => sum + e.sets, 0)} sets</span></div><p>{r.description || 'Your custom session template.'}</p><div className="routine-exercises">{r.exercises.map(e => <div key={e.id}><strong>{e.name}</strong><span>{e.sets} × {e.reps}<small>{number(e.weight)} kg</small></span></div>)}</div><a className="btn full" href={`#/workouts/new?routine=${encodeURIComponent(r.id)}`}>Start this session <ArrowUpRight size={17} /></a><div className="routine-card-actions"><button className="text-link" onClick={() => setEditing(r)}><Pencil size={14} />Edit</button><button className="text-link" onClick={() => duplicate(r)}><Copy size={14} />Duplicate</button><button className="icon-btn danger" aria-label={`Delete ${r.name}`} onClick={() => remove(r)}><Trash2 size={15} /></button></div></div></article>)}</div>{!data.routines.length && <div className="panel"><Empty icon={Dumbbell} title="Make room for your own routine.">Use New routine to build your next session.</Empty></div>}<p className="fine-print">Templates are editable examples, with load set to 0 until you choose it. Starting a session copies a template; changes to that workout will not rewrite the template or past sessions.</p>{editing && <RoutineEditor key={editing.id} routine={editing} onClose={() => setEditing(null)} />}</>;
}
