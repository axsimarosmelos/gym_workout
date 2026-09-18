import { useEffect } from 'react';

export function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event) { event.preventDefault(); event.returnValue = ''; }
    function onClick(event) {
      const link = event.target.closest('a[href^="#/"]');
      if (link && link.getAttribute('href') !== window.location.hash && !window.confirm('Leave this page and discard the unsaved workout?')) { event.preventDefault(); event.stopPropagation(); }
    }
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', onClick, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', onClick, true); };
  }, [dirty]);
}
