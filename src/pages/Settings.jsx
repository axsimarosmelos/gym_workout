import { useState } from 'react';
import { Download, HardDrive, Save, Upload } from 'lucide-react';
import { useApp } from '../state/AppStore.jsx';
import { MAX_BACKUP_BYTES } from '../state/storage.js';
import { errorMessage } from '../lib/schema.js';
import { today } from '../lib/dates.js';
import { download, parseBackup } from '../lib/backup.js';
import { Field, Message, PageTitle } from '../components/UI.jsx';

export default function Settings() {
  const { data, dispatch, problem, raw } = useApp();
  const [settings, setSettings] = useState(() => structuredClone(data.settings));
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(null);
  function save(event) {
    event.preventDefault();
    try { dispatch({ type: 'settings/save', settings }); setMessage({ kind: 'success', text: 'Training block saved. All measurements remain in your history.' }); }
    catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  function exportData() {
    try { download(problem ? raw() : JSON.stringify(data, null, 2), `forge-${problem ? 'stored-text' : 'backup'}-${today()}.json`); setMessage({ kind: 'success', text: 'Backup download started.' }); }
    catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  async function chooseFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPending(null); setMessage(null);
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('Choose a JSON backup smaller than 5 MB.');
      setPending(parseBackup(await file.text()));
    } catch (error) { setMessage({ text: `Backup was not imported. ${errorMessage(error)}` }); }
  }
  function restore() {
    if (!pending) return;
    try {
      // Export the previous content before replacing the local database.
      const previous = problem ? raw() : JSON.stringify(data, null, 2);
      if (previous) download(previous, `forge-before-restore-${today()}.json`);
      dispatch({ type: 'data/import', data: pending });
      setSettings(structuredClone(pending.settings)); setPending(null);
      setMessage({ kind: 'success', text: 'Backup restored. A copy of your previous data was downloaded first.' });
    } catch (error) { setMessage({ text: errorMessage(error) }); }
  }
  return <><PageTitle title="Make it your training space." subtitle="Set your timeline and keep a copy of the work you’ve put in." /><Message message={message} /><section className="panel"><div className="panel-heading"><div><p className="eyebrow">SIX MONTHS, YOUR WAY</p><h2>Training block</h2></div></div><form onSubmit={save}><Field label="Block start date" className="date-field"><input type="date" required value={settings.programStart} onChange={e => setSettings(s => ({ ...s, programStart: e.target.value }))} /></Field><div className="form-grid three">{settings.phaseNames.map((name, i) => <Field label={`Month ${i + 1} phase`} key={i}><input required maxLength={30} value={name} onChange={e => setSettings(s => ({ ...s, phaseNames: s.phaseNames.map((n, j) => j === i ? e.target.value : n) }))} /></Field>)}</div><p className="fine-print">Each phase spans one calendar month from your start date. Labels organize the chart; they do not prescribe training intensity or change your records.</p><div className="form-actions"><button className="btn" type="submit"><Save size={17} />Save training block</button></div></form></section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">KEEP YOUR PROGRESS CLOSE</p><h2>Data & backups</h2></div><HardDrive size={23} /></div><div className="backup-intro"><p>Your data stays in this browser. No account, subscription, or server is required. It does not automatically sync to another device.</p><p>Download a backup before clearing browser data. Local development and your published GitHub Pages site use separate storage; export here and import there to move your records.</p></div><div className="backup-actions"><button className="btn btn-secondary" onClick={exportData}><Download size={17} />{problem ? 'Export stored text' : 'Export JSON backup'}</button><label className="btn btn-secondary upload-label"><Upload size={17} />Choose backup<input type="file" accept="application/json,.json" onChange={chooseFile} /></label></div>{pending && <div className="restore-box"><h3>Ready to restore</h3><p>{pending.workouts.length} workouts · {pending.metrics.length} measurements · {pending.routines.length} routines · {Object.keys(pending.supplements).length} supplement dates</p><p>This replaces the current data. A copy of the current data will be downloaded first.</p><div className="backup-actions"><button className="btn" onClick={restore}>Restore this backup</button><button className="btn btn-secondary" onClick={() => setPending(null)}>Cancel</button></div></div>}<p className="fine-print">Backups include your training and physical measurements. Keep them out of the public GitHub repository. Multiple tabs update when another tab saves; simultaneous edits use the last saved version.</p></section></>;
}
