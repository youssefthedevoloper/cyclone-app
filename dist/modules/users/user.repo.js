"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserById = fetchUserById;
exports.fetchUserByEmail = fetchUserByEmail;
exports.nextAccountNumber = nextAccountNumber;
exports.insertUser = insertUser;
exports.updateUser = updateUser;
exports.setLoyaltyPoints = setLoyaltyPoints;
exports.setPremium = setPremium;
const connection_1 = require("../../db/connection");
function fetchUserById(id) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM users WHERE id = ?').get(id);
}
function fetchUserByEmail(email) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email);
}
function nextAccountNumber() {
    const db = (0, connection_1.getDb)();
    const row = db.prepare('SELECT COALESCE(MAX(account_number), 0) AS m FROM users').get();
    return row.m + 1;
}
function insertUser(u) {
    (0, connection_1.getDb)()
        .prepare(`INSERT INTO users (id, name, email, password_hash, account_number, premium_status, premium_expires_at, loyalty_points, is_demo, created_at, updated_at)
       VALUES (@id, @name, @email, @password_hash, @account_number, @premium_status, @premium_expires_at, @loyalty_points, @is_demo, @created_at, @updated_at)`)
        .run(u);
}
function updateUser(id, patch) {
    const db = (0, connection_1.getDb)();
    const current = fetchUserById(id);
    if (!current)
        return;
    const merged = { ...current, ...patch, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE users SET name=@name, email=@email, password_hash=@password_hash, premium_status=@premium_status,
     premium_expires_at=@premium_expires_at, loyalty_points=@loyalty_points, is_demo=@is_demo, updated_at=@updated_at WHERE id=@id`).run(merged);
}
function setLoyaltyPoints(id, points) {
    (0, connection_1.getDb)()
        .prepare('UPDATE users SET loyalty_points = ?, updated_at = ? WHERE id = ?')
        .run(points, new Date().toISOString(), id);
}
function setPremium(id, status, expiresAt = null) {
    (0, connection_1.getDb)()
        .prepare('UPDATE users SET premium_status = ?, premium_expires_at = ?, updated_at = ? WHERE id = ?')
        .run(status, expiresAt, new Date().toISOString(), id);
}
//# sourceMappingURL=user.repo.js.map