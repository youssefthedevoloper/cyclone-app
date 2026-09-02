"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const connection_1 = require("../../db/connection");
const ids_1 = require("../../utils/ids");
class NotificationService {
    list(userId) {
        const rows = (0, connection_1.getDb)()
            .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
            .all(userId);
        return rows.map((r) => ({
            id: r.id,
            title: r.title,
            message: r.message,
            type: r.type,
            read: !!r.read,
            createdAt: r.created_at,
        }));
    }
    unreadCount(userId) {
        const r = (0, connection_1.getDb)()
            .prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0')
            .get(userId);
        return r.c;
    }
    create(userId, title, message, type = 'info') {
        (0, connection_1.getDb)()
            .prepare(`INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)`)
            .run((0, ids_1.genId)('ntf'), userId, title, message, type, new Date().toISOString());
    }
    markRead(userId, notificationId) {
        (0, connection_1.getDb)().prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(notificationId, userId);
        return { success: true };
    }
    markAllRead(userId) {
        (0, connection_1.getDb)().prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
        return { success: true };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map