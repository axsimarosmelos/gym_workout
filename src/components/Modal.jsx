import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog className="modal" ref={ref} aria-labelledby="modal-title" onCancel={event => { event.preventDefault(); onClose(); }}><div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-btn" type="button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>{children}</dialog>;
}
