import React from 'react';
import { useData } from '../../state/data';
import { NotificationApi } from '../../api/client';
import { useToast } from '../../components/toast';
import { Empty, Skeleton } from '../../components/ui';
import { SubScreen, timeAgo } from '../SubScreen';
import { IconBell } from '../../components/Icons';

export default function Notifications() {
  const { notifications, loaded, invalidate } = useData();
  const toast = useToast();

  const list = notifications?.notifications || [];

  async function markRead(id: string) {
    try {
      await NotificationApi.markRead(id);
      invalidate(['notifications']);
    } catch {}
  }

  return (
    <SubScreen title="Notifications">
      {!loaded.notifications ? (
        <div className="card card-pad"><Skeleton style={{ height: 18 }} /><Skeleton style={{ marginTop: 10 }} /><Skeleton style={{ marginTop: 10 }} /></div>
      ) : list.length === 0 ? (
        <Empty icon={<IconBell size={26} />} title="All caught up" text="No notifications yet. Journey updates and rewards will appear here." />
      ) : (
        <div className="card">
          {list.map((n: any, i: number) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className="row"
              style={{
                padding: '14px 16px',
                borderTop: i === 0 ? 'none' : '1px solid var(--c-border)',
                cursor: n.read ? 'default' : 'pointer',
                background: n.read ? 'transparent' : '#fbfdff',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 99, background: n.read ? 'var(--c-border)' : 'var(--c-primary)', marginTop: 6, flex: 'none' }} />
              <div className="grow">
                <div className="bold small">{n.title}</div>
                <div className="muted small mt8" style={{ margin: 0 }}>{n.message}</div>
                <div className="muted-2" style={{ fontSize: 11.5, marginTop: 6 }}>{timeAgo(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SubScreen>
  );
}