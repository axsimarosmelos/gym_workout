import { useState } from 'react';
import { Activity, Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppStore.jsx';
import { addMonths, number, prettyDay, today } from '../lib/dates.js';
import { errorMessage, metricSchema, optionalNumber } from '../lib/schema.js';
import { Empty, Field, Message, PageTitle, Stat } from '../components/UI.jsx';
import CompositionChart from '../components/CompositionChart.jsx';

const blank = date => ({ date, weight: '', muscle: '', fat: '', waist: '', sleep: '', steps: '', calories: '' });
const formValue = m => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v == null ? '' : v]));
export default function Metrics() {
  const { data, dispatch } = useApp();
  const [form, setForm] = useState(() => formValue(data.metrics.find(m => m.date === today()) || blank(today())));
  const [message, setMessage] = useState(null);
  const [limit, setLimit] = useState(30);
  const metrics = [...data.metrics].sort((a, b) => b.date.localeCompare(a.date));
  const weight = metrics[0];
  const muscle = metrics.find(m => m.muscle != null);
  const fat = metrics.find(m => m.fat != null);
  const existing = data.metrics.some(m => m.date === form.date);
  const outside = data.metrics.filter(m => m.date < data.settings.programStart || m.date >= addMonths(data.settings.programStart, 6)).length;
  function changeDate(date) { setForm(formValue(data.metrics.find(m => m.date === date) || blank(date))); setMessage(null); }
  function submit(event) {
    event.preventDefault();
    try {
      const entry = metricSchema.parse({ date: form.date, ...Object.fromEntries(Object.entries(form).filter(([k]) => k !== 'date').map(([k, v]) => [k, k === 'weight' ? (v === '' ? NaN : Number(v)) : optionalNumber(v)])) });
      dispatch({ type: 'metric/save', entry });
      setMessage({ kind: 'success', text: `${existing ? 'Updated' : 'Saved'} your ${prettyDay(entry.date)} measurement.` });
    } catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  function remove(date) {
    if (!window.confirm(`Delete the measurement for ${date}?`)) return;
    try { dispatch({ type: 'metric/delete', date }); if (date === form.date) setForm(blank(date)); setMessage({ kind: 'success', text: 'Measurement deleted.' }); }
    catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  function edit(m) { setForm(formValue(m)); setMessage(null); document.getElementById('measurement-form').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  const fields = [
    ['weight', 'Body weight · kg', '1', '500', '0.01'],
    ['muscle', 'Skeletal muscle · kg', '0.1', '500', '0.01'],
    ['fat', 'Body fat · %', '0', '100', '0.1'],
    ['waist', 'Waist · cm', '1', '400', '0.1'],
    ['sleep', 'Sleep · hours', '0', '24', '0.1'],
    ['steps', 'Daily steps', '0', '200000', '1'],
    ['calories', 'Calories consumed · kcal', '0', '20000', '1'],
  ];
  return <><PageTitle title="The bigger picture." subtitle="Track body composition and daily physical metrics across your six-month block." /><div className="stat-grid three"><Stat label="Latest body weight" value={number(weight?.weight)} unit="kg" icon={Scale} note={weight ? prettyDay(weight.date) : 'No measurement yet'} /><Stat label="Latest skeletal muscle" value={number(muscle?.muscle)} unit="kg" icon={Activity} note={muscle ? prettyDay(muscle.date) : 'No measurement yet'} accent /><Stat label="Latest body fat" value={number(fat?.fat)} unit="%" icon={Activity} note={fat ? prettyDay(fat.date) : 'No measurement yet'} /></div><section className="panel"><div className="panel-heading"><div><p className="eyebrow">SIX MONTHS OF SHOWING UP</p><h2>Muscle & body fat</h2></div><a className="text-link" href="#/settings">Edit timeline</a></div><CompositionChart metrics={data.metrics} settings={data.settings} />{outside > 0 && <p className="fine-print">{outside} measurement{outside === 1 ? ' is' : 's are'} outside the selected block and remain in the history below.</p>}</section><section className="panel measurement-form" id="measurement-form"><div className="panel-heading"><div><p className="eyebrow">YOUR DAILY CHECK-IN</p><h2>{existing ? 'Update measurement' : 'Add measurement'}</h2></div><span className="badge neutral">One record per day</span></div><form onSubmit={submit}><div className="form-grid four"><Field label="Measurement date"><input type="date" required max={today()} value={form.date} onChange={e => changeDate(e.target.value)} /></Field>{fields.map(([key, label, min, max, step]) => <Field key={key} label={label}><input type="number" inputMode={step === '1' ? 'numeric' : 'decimal'} min={min} max={max} step={step} required={key === 'weight'} value={form[key]} placeholder={key === 'weight' ? 'Required' : 'Optional'} onChange={e => setForm(old => ({ ...old, [key]: e.target.value }))} /></Field>)}</div><p className="fine-print">Enter measured skeletal muscle mass directly. It is not calculated from body fat. Leave unmeasured values blank.</p><Message message={message} /><div className="form-actions"><button className="btn" type="submit"><Plus size={17} />{existing ? 'Update measurement' : 'Save measurement'}</button></div></form></section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">THE NUMBERS BEHIND THE TREND</p><h2>Measurement history</h2></div></div>{metrics.length ? <><div className="table-wrap"><table><caption className="sr-only">Recorded body measurements</caption><thead><tr><th>Date</th><th>Weight kg</th><th>Muscle kg</th><th>Fat %</th><th>Waist cm</th><th>Sleep h</th><th>Steps</th><th>kcal</th><th>Actions</th></tr></thead><tbody>{metrics.slice(0, limit).map(m => <tr key={m.date}><td>{prettyDay(m.date, { year: 'numeric', month: 'short', day: 'numeric' })}</td>{['weight', 'muscle', 'fat', 'waist', 'sleep', 'steps', 'calories'].map(k => <td key={k}>{number(m[k])}</td>)}<td><div className="row-actions"><button className="icon-btn" onClick={() => edit(m)} aria-label={`Edit measurement ${m.date}`}><Pencil size={15} /></button><button className="icon-btn danger" onClick={() => remove(m.date)} aria-label={`Delete measurement ${m.date}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>{metrics.length > limit && <button className="btn btn-secondary" onClick={() => setLimit(limit + 30)}>Show more measurements</button>}</> : <Empty icon={Scale} title="A baseline is a good place to begin.">Your saved measurements will appear here.</Empty>}</section></>;
}
