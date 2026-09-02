import { getDb } from '../../db/connection';
import { genId } from '../../utils/ids';

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: number;
  created_at: string;
}

export class NotificationService {
  list(userId: string) {
    const rows = getDb()
      .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as NotificationRow[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      read: !!r.read,
      createdAt: r.created_at,
    }));
  }

  unreadCount(userId: string): number {
    const r = getDb()
      .prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0')
      .get(userId) as any;
    return r.c;
  }

  create(userId: string, title: string, message: string, type = 'info') {
    getDb()
      .prepare(
        `INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)`
      )
      .run(genId('ntf'), userId, title, message, type, new Date().toISOString());
  }

  markRead(userId: string, notificationId: string) {
    getDb().prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(notificationId, userId);
    return { success: true };
  }

  markAllRead(userId: string) {
    getDb().prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
    return { success: true };
  }
}