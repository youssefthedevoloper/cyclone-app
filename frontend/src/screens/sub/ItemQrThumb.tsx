import React, { useEffect, useState } from 'react';
import { ItemApi } from '../../api/client';

export function ItemQrThumb({ itemId, size = 96 }: { itemId: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    ItemApi.qr(itemId)
      .then((r) => { if (active) setDataUrl(r.qrDataUrl); })
      .catch(() => {});
    return () => { active = false; };
  }, [itemId]);

  return (
    <div style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--c-border)', background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {dataUrl
        ? <img src={dataUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
        : <span className="muted-2 small" style={{ fontSize: 11 }}>QR…</span>}
    </div>
  );
}