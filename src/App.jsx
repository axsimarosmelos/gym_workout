import { lazy, Suspense, useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CalendarDays, Dumbbell, FlaskConical, LayoutDashboard, ListChecks, Menu, Settings as SettingsIcon, X } from 'lucide-react';
import { useApp } from './state/AppStore.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';
import { prettyDay, today } from './lib/dates.js';
import { Message } from './components/UI.jsx';
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Workouts = lazy(() => import('./pages/Workouts.jsx'));
const WorkoutEditor = lazy(() => import('./pages/WorkoutEditor.jsx'));
const Metrics = lazy(() => import('./pages/Metrics.jsx'));
const Supplements = lazy(() => import('./pages/Supplements.jsx'));
const Routines = lazy(() => import('./pages/Routines.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

const nav = [
  ['/', 'Overview', LayoutDashboard], ['/workouts', 'Workout log', Dumbbell], ['/metrics', 'Body metrics', Activity],
  ['/supplements', 'Daily stack', FlaskConical], ['/routines', 'Routines', ListChecks], ['/settings', 'Settings', SettingsIcon],
];
function decode(value) { try { return decodeURIComponent(value); } catch { return ''; } }
export default function App() {
  const { path, params } = useHashRoute();
  const { problem } = useApp();
  const [menu, setMenu] = useState(false);
  const routeKey = `${path}?${params.toString()}`;
  useEffect(() => { setMenu(false); window.scrollTo(0, 0); document.getElementById('main-content')?.focus({ preventScroll: true }); }, [routeKey]);
  // Rerender the daily views if this tab stays open across midnight.
  const [, tick] = useState(0);
  useEffect(() => { const timer = setInterval(() => tick(v => v + 1), 60_000); return () => clearInterval(timer); }, []);
  const current = nav.find(([href]) => href === '/' ? path === '/' : path.startsWith(href));
  let page;
  if (path === '/') page = <Dashboard />;
  else if (path === '/workouts') page = <Workouts />;
  else if (path === '/workouts/new') page = <WorkoutEditor key={routeKey} routineId={params.get('routine')} />;
  else if (/^\/workouts\/[^/]+$/.test(path)) page = <WorkoutEditor key={path} id={decode(path.split('/')[2])} />;
  else if (path === '/metrics') page = <Metrics />;
  else if (path === '/supplements') page = <Supplements />;
  else if (path === '/routines') page = <Routines />;
  else if (path === '/settings') page = <Settings />;
  else page = <div className="panel"><h1>Page not found</h1><p>Let’s get back to your training.</p><a className="btn" href="#/">Go to overview</a></div>;
  return <div className="app"><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a><aside className={`sidebar ${menu ? 'open' : ''}`}><a className="brand" href="#/" aria-label="Forge overview"><span className="brand-mark">F</span><span>forge<span className="brand-period">.</span></span></a><div className="sidebar-caption">BUILT BY SHOWING UP</div><nav aria-label="Main navigation">{nav.map(([href, label, Icon]) => <a key={href} href={`#${href}`} className={`nav-item ${current?.[0] === href ? 'active' : ''}`} aria-current={current?.[0] === href ? 'page' : undefined}><Icon size={19} />{label}{current?.[0] === href && <span className="nav-dot" />}</a>)}</nav><div className="sidebar-bottom"><div className="sidebar-note"><span className="small-barbell"><Dumbbell size={21} /></span><strong>Progress is a practice.</strong><p>Build a record you can<br />build on.</p></div><div className="local-status"><span />Personal training space</div></div></aside>{menu && <button className="menu-backdrop" onClick={() => setMenu(false)} aria-label="Close navigation" />}<div className="app-main"><header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">{menu ? <X size={22} /> : <Menu size={22} />}</button><span className="breadcrumb">YOUR TRAINING <span>/</span> <strong>{current?.[1] || 'Workout'}</strong></span></div><div className="topbar-right"><span className="top-date"><CalendarDays size={15} />{prettyDay(today(), { month: 'short', day: 'numeric', year: 'numeric' })}</span><a className="profile-circle" href="#/settings" aria-label="Settings">F</a></div></header><main id="main-content" className="main-content" tabIndex={-1}>{problem && <><Message message={{ text: problem }} /><a className="text-link" href="#/settings">Open data & backups <ArrowUpRight size={16} /></a></>}<Suspense fallback={<div className="panel" role="status">Loading your training space…</div>}>{page}</Suspense></main><footer className="app-footer"><span>A little stronger, one session at a time.</span><span>FORGE / GYM WORKOUT</span></footer></div></div>;
}
