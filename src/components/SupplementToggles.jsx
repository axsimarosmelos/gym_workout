import { useState } from 'react';
import { Check, FlaskConical, Milk } from 'lucide-react';
import { useApp } from '../state/AppStore.jsx';
import { errorMessage } from '../lib/schema.js';
import { Message } from './UI.jsx';

export default function SupplementToggles({ date }) {
  const { data, dispatch } = useApp();
  const [message, setMessage] = useState(null);
  const entry = data.supplements[date] || {};
  function toggle(kind) {
    try { dispatch({ type: 'supplement/toggle', date, kind }); setMessage(null); }
    catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  return <><div className="supplement-toggles">{[
    { kind: 'protein', name: 'Protein powder', note: 'Your daily protein top-up', icon: Milk },
    { kind: 'creatine', name: 'Creatine', note: 'Keep the habit consistent', icon: FlaskConical },
  ].map(({ kind, name, note, icon: Icon }) => <button key={kind} type="button" className={`supplement-toggle ${entry[kind] ? 'taken' : ''}`} onClick={() => toggle(kind)} aria-pressed={!!entry[kind]}><span className="supplement-icon"><Icon size={23} /></span><span className="supplement-label"><strong>{name}</strong><small>{entry[kind] ? 'Logged for this day' : note}</small></span><span className="toggle-check">{entry[kind] ? <Check size={15} /> : <span />}</span></button>)}</div><Message message={message} /></>;
}
