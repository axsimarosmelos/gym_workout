import { AlertCircle, ArrowUpRight, Check, Plus, TrendingUp, Trophy } from 'lucide-react';
import { number } from '../lib/dates.js';

export function PageTitle({ eyebrow = 'YOUR TRAINING, IN FOCUS', title, subtitle, action }) {
  return <div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle && <p className="subtitle">{subtitle}</p>}</div>{action}</div>;
}
export function Message({ message }) {
  if (!message) return null;
  return <div className={`message ${message.kind || 'error'}`} role={message.kind === 'success' ? 'status' : 'alert'}>{message.kind === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}<span>{message.text}</span></div>;
}
export function Empty({ icon: Icon = Plus, title, children, action }) {
  return <div className="empty"><span className="empty-icon"><Icon size={27} /></span><h3>{title}</h3><p>{children}</p>{action}</div>;
}
export function Stat({ label, value, unit, note, icon: Icon, accent = false }) {
  return <div className={`stat ${accent ? 'stat-accent' : ''}`}><div className="stat-top"><span>{label}</span>{Icon && <Icon size={18} />}</div><div className="stat-value">{value}<span>{unit}</span></div><p>{note}</p></div>;
}
export function ProgressBadges({ progress }) {
  if (progress.baseline) return <span className="badge neutral">Baseline session</span>;
  return <div className="badges">{progress.loadPR && <span className="badge gold"><Trophy size={12} />Load PR</span>}{progress.volumePR && <span className="badge gold"><Trophy size={12} />Volume PR</span>}{progress.change > 0 && <span className="badge green"><TrendingUp size={12} />{progress.percent == null ? `+${number(progress.change)} kg·reps` : `+${number(progress.percent)}% volume`}</span>}{progress.change === 0 && <span className="badge neutral">Volume matched</span>}{progress.change < 0 && <span className="badge neutral">{number(progress.percent)}% volume</span>}</div>;
}
export function LinkButton({ href, children, secondary = false }) { return <a href={href} className={`btn ${secondary ? 'btn-secondary' : ''}`}>{children}<ArrowUpRight size={16} /></a>; }
export function Field({ label, hint, children, className = '' }) { return <label className={`field ${className}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
