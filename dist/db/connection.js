"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.closeDb = closeDb;
exports.resetDb = resetDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
let db = null;
function getDb() {
    if (db)
        return db;
    fs_1.default.mkdirSync(path_1.default.dirname(config_1.config.databasePath), { recursive: true });
    db = new better_sqlite3_1.default(config_1.config.databasePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
}
function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}
function resetDb() {
    closeDb();
    if (fs_1.default.existsSync(config_1.config.databasePath)) {
        fs_1.default.unlinkSync(config_1.config.databasePath);
    }
    for (const suff of ['-wal', '-shm']) {
        const f = config_1.config.databasePath + suff;
        if (fs_1.default.existsSync(f))
            fs_1.default.unlinkSync(f);
    }
}
//# sourceMappingURL=connection.js.map