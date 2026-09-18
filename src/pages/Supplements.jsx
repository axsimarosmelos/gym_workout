import { useState } from 'react';
import { Check, FlaskConical, Milk, Minus } from 'lucide-react';
import { useApp } from '../state/AppStore.jsx';
import { addDays, prettyDay, today } from '../lib/dates.js';
import { errorMessage } from '../lib/schema.js';
import { Field, Message, PageTitle, Stat } from '../components/UI.jsx';
import SupplementToggles from '../components/SupplementToggles.jsx';

export default function Supplements() {
  const { data, dispatch } = useApp();
  const [date, setDate] = useState(today());
  const [message, setMessage] = useState(null);
  const week = Array.from({ length: 7 }, (_, i) => addDays(today(), -i));
  const days = Array.from({ length: 14 }, (_, i) => addDays(date || today(), -i));
  const count = kind => week.filter(d => data.supplements[d]?.[kind]).length;
  function toggle(day, kind) {
    try { dispatch({ type: 'supplement/toggle', date: day, kind }); setMessage(null); }
    catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  return <><PageTitle title="Small habits. Steady progress." subtitle="A simple record of protein powder and creatine intake. Tap to log, tap again to undo." /><div className="stat-grid two"><Stat label="Protein powder logged" value={`${count('protein')} / 7`} unit="days" icon={Milk} note="Last 7 calendar days, including today" /><Stat label="Creatine logged" value={`${count('creatine')} / 7`} unit="days" icon={FlaskConical} note="Last 7 calendar days, including today" accent /></div><div className="supplements-grid"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">THE DAILY STACK</p><h2>Log your intake</h2></div></div><Field label="Day to track"><input required type="date" max={today()} value={date} onChange={e => setDate(e.target.value)} /></Field>{date && <SupplementToggles key={date} date={date} />}<p className="fine-print">These toggles record whether you took a supplement. They do not prescribe a dose or track total dietary protein.</p></section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">A LITTLE EVERY DAY</p><h2>14-day log</h2></div><span className="badge neutral">Ending {prettyDay(date || today())}</span></div><Message message={message} /><div className="table-wrap"><table className="supplement-table"><thead><tr><th>Day</th><th>Protein powder</th><th>Creatine</th></tr></thead><tbody>{days.map(day => <tr key={day}><td>{prettyDay(day, { weekday: 'short', month: 'short', day: 'numeric' })}{day === today() && <small className="today-label">TODAY</small>}</td>{['protein', 'creatine'].map(kind => <td key={kind}><button className={`history-toggle ${data.supplements[day]?.[kind] ? 'on' : ''}`} aria-label={`${kind === 'protein' ? 'Protein powder' : 'Creatine'} on ${day}`} aria-pressed={!!data.supplements[day]?.[kind]} onClick={() => toggle(day, kind)}>{data.supplements[day]?.[kind] ? <Check size={17} /> : <Minus size={16} />}</button></td>)}</tr>)}</tbody></table></div></section></div></>;
}
