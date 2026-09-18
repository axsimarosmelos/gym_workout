import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartNoAxesCombined } from 'lucide-react';
import { addMonths, sixMonths, stamp, number } from '../lib/dates.js';
import { Empty } from './UI.jsx';

export default function CompositionChart({ metrics, settings }) {
  const months = sixMonths(settings.programStart);
  const end = addMonths(settings.programStart, 6);
  const data = metrics.filter(m => m.date >= settings.programStart && m.date < end)
    .sort((a, b) => a.date.localeCompare(b.date)).map(m => ({ ...m, time: stamp(m.date) }));
  const hasData = data.some(d => d.muscle != null || d.fat != null);
  const formatDate = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return <div>
    <div className="chart-caption"><span><i className="dot muscle" />Skeletal muscle · kg</span><span><i className="dot fat" />Body fat · %</span></div>
    {hasData ? <div className="chart-box" role="img" aria-label="Six-month body composition chart. Skeletal muscle is on the left kilogram axis; body fat is on the right percentage axis. Exact records are available in Body metrics.">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 18, right: 8, bottom: 12, left: 0 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e8e9e4" />
          <XAxis dataKey="time" type="number" scale="time" domain={[stamp(settings.programStart), stamp(end)]} ticks={months.map(m => stamp(m.start))} tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#778077' }} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis yAxisId="muscle" domain={[0, max => Math.max(10, Math.ceil((max + 5) / 10) * 10)]} tick={{ fontSize: 11, fill: '#6f776b' }} width={37} axisLine={false} tickLine={false} unit="kg" />
          <YAxis yAxisId="fat" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6f776b' }} width={40} axisLine={false} tickLine={false} unit="%" />
          {months.map((m, i) => <ReferenceArea key={m.start} yAxisId="muscle" x1={stamp(m.start)} x2={stamp(addMonths(settings.programStart, i + 1))} fill={i % 2 ? '#dce7d9' : '#edf0e8'} fillOpacity={0.18} strokeOpacity={0} />)}
          <Tooltip labelFormatter={formatDate} formatter={(value, name) => [`${number(value)} ${name === 'Skeletal muscle' ? 'kg' : '%'}`, name]} contentStyle={{ borderRadius: 10, borderColor: '#e4e7dd', fontSize: 12 }} />
          <Line yAxisId="muscle" dataKey="muscle" name="Skeletal muscle" type="linear" stroke="#ed6c3e" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} connectNulls={false} isAnimationActive={false} />
          <Line yAxisId="fat" dataKey="fat" name="Body fat" type="linear" stroke="#73826b" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} connectNulls={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div> : <Empty icon={ChartNoAxesCombined} title="Your first measurement starts the story." action={<a className="btn btn-secondary" href="#/metrics">Add body metrics</a>}>Record skeletal muscle mass or body fat within this six-month block to see your trend.</Empty>}
    <div className="phase-strip">{months.map((m, i) => <div key={m.start}><span>M{i + 1}</span><strong>{settings.phaseNames[i]}</strong></div>)}</div>
    <p className="fine-print">Separate axes: orange = muscle mass in kg; dashed green = body fat in %. Only your recorded measurements are plotted.</p>
  </div>;
}
