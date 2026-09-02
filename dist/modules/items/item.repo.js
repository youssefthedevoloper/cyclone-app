"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertItem = insertItem;
exports.updateItem = updateItem;
exports.findItemById = findItemById;
exports.findItemByIdentifier = findItemByIdentifier;
exports.itemsForUser = itemsForUser;
exports.insertLostReport = insertLostReport;
exports.updateLostReport = updateLostReport;
exports.lostReportForItem = lostReportForItem;
const connection_1 = require("../../db/connection");
function insertItem(i) {
    (0, connection_1.getDb)()
        .prepare(`INSERT INTO items (id, user_id, name, category, description, qr_identifier, status, created_at, updated_at)
       VALUES (@id, @user_id, @name, @category, @description, @qr_identifier, @status, @created_at, @updated_at)`)
        .run(i);
}
function updateItem(id, patch) {
    const db = (0, connection_1.getDb)();
    const cur = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!cur)
        return;
    const merged = { ...cur, ...patch, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE items SET name=@name, category=@category, description=@description, qr_identifier=@qr_identifier, status=@status, updated_at=@updated_at WHERE id=@id`).run(merged);
}
function findItemById(id) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM items WHERE id = ?').get(id);
}
function findItemByIdentifier(identifier) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM items WHERE qr_identifier = ?').get(identifier);
}
function itemsForUser(userId) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}
function insertLostReport(r) {
    (0, connection_1.getDb)()
        .prepare(`INSERT INTO lost_reports (id, item_id, user_id, airport_id, location, description, status, created_at, updated_at)
       VALUES (@id, @item_id, @user_id, @airport_id, @location, @description, @status, @created_at, @updated_at)`)
        .run(r);
}
function updateLostReport(itemId, patch) {
    const db = (0, connection_1.getDb)();
    const cur = db.prepare('SELECT * FROM lost_reports WHERE item_id = ? ORDER BY created_at DESC LIMIT 1').get(itemId);
    if (!cur)
        return;
    const merged = { ...cur, ...patch, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE lost_reports SET airport_id=@airport_id, location=@location, description=@description, status=@status, updated_at=@updated_at WHERE id=@id`).run(merged);
}
function lostReportForItem(itemId) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM lost_reports WHERE item_id = ? ORDER BY created_at DESC LIMIT 1').get(itemId);
}
//# sourceMappingURL=item.repo.js.map