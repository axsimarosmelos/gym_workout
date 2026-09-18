import { useState } from 'react';
import { Dumbbell, Pencil, Search, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppStore.jsx';
import { chronological, exerciseProgress, workoutVolume } from '../lib/progress.js';
import { number, prettyDay } from '../lib/dates.js';
import { errorMessage } from '../lib/schema.js';
import { Empty, LinkButton, Message, PageTitle, ProgressBadges } from '../components/UI.jsx';

export default function Workouts() {
  const { data, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState(null);
  const list = [...data.workouts].filter(w => `${w.title} ${w.date} ${w.exercises.map(e => e.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => chronological(b, a));
  function remove(w) {
    if (!window.confirm(`Delete “${w.title}” from ${w.date}?`)) return;
    try { dispatch({ type: 'workout/delete', id: w.id }); setMessage({ kind: 'success', text: 'Workout deleted. Progress comparisons have been recalculated.' }); }
    catch (e) { setMessage({ text: errorMessage(e) }); }
  }
  return <><PageTitle title="Your work, recorded." subtitle="Compare the same exercise across sessions. Keep the wins visible." action={<LinkButton href="#/workouts/new">Log a workout</LinkButton>} /><Message message={message} /><label className="search-box"><Search size={18} /><span className="sr-only">Search workouts</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search exercises, sessions, or dates…" /></label><div className="workout-list">{list.map(w => <article className="panel workout-summary" key={w.id}><div className="workout-summary-heading"><div><p className="eyebrow">{prettyDay(w.date, { month: 'short', day: 'numeric', year: 'numeric' })}</p><h2>{w.title}</h2><p className="subtitle">{w.exercises.reduce((sum, e) => sum + e.sets.length, 0)} sets · {number(workoutVolume(w), 0)} kg·reps</p></div><div className="row-actions"><a className="icon-btn" href={`#/workouts/${encodeURIComponent(w.id)}`} aria-label={`Edit ${w.title}`}><Pencil size={17} /></a><button className="icon-btn danger" onClick={() => remove(w)} aria-label={`Delete ${w.title}`}><Trash2 size={17} /></button></div></div><div className="exercise-summary-list">{w.exercises.map(e => <div className="exercise-summary" key={e.id}><div><strong>{e.name}</strong><small>{e.sets.map(s => `${s.reps} × ${number(s.weight)} kg`).join(' · ')}</small></div><ProgressBadges progress={exerciseProgress(data.workouts, w, e)} /></div>)}</div>{w.notes && <p className="workout-notes">{w.notes}</p>}</article>)}</div>{!list.length && <div className="panel"><Empty icon={Dumbbell} title={query ? 'No matching workouts.' : 'Start with the session in front of you.'} action={!query && <a href="#/workouts/new" className="btn">Log a workout</a>}>{query ? 'Try a different exercise name or date.' : 'Select a routine or build a session from scratch.'}</Empty></div>}<p className="fine-print">Load PR = your heaviest logged set for that exercise. Volume PR = your highest session total of load × reps. Volume change compares with its immediately preceding session. First entries establish a baseline.</p></>;
}
