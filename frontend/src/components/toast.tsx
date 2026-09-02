import React, { createContext, useContext, useState, useCallback } from 'react';
import { LogoMark } from './ui';

interface Toast {
  id: number;
  message: string;
  type: 'default' | 'success' | 'error';
}

const ToastContext = createContext<{ toast: (msg: string, type?: Toast['type']) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: Toast['type'] = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function QrImage({ dataUrl, logoDataUrl, size = 220 }: { dataUrl: string; logoDataUrl?: string | null; size?: number }) {
  return (
    <div className="qr-wrap" style={{ padding: 12 }}>
      <img className="qr" src={dataUrl} alt="CYCLONE QR code" style={{ width: size, height: size }} />
      <div className="qr-logo">
        {logoDataUrl ? (
          <img src={logoDataUrl} alt="CYCLONE" style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'contain' }} />
        ) : (
          <LogoMark size={30} />
        )}
      </div>
    </div>
  );
}