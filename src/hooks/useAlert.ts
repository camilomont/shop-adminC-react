import { useCallback, useState } from 'react';
import type { AlertState } from '../types';

export function useAlert() {
  const [alert, setAlert] = useState<AlertState>({ type: null, message: '' });

  const showSuccess = useCallback((message: string) => {
    setAlert({ type: 'success', message });
  }, []);

  const showError = useCallback((message: string) => {
    setAlert({ type: 'error', message });
  }, []);

  const clearAlert = useCallback(() => {
    setAlert({ type: null, message: '' });
  }, []);

  return { alert, showSuccess, showError, clearAlert };
}
