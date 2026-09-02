"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../../db/connection");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    try {
        (0, connection_1.getDb)().prepare('SELECT 1').get();
        res.json({
            status: 'ok',
            server: 'running',
            database: 'connected',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        });
    }
    catch (e) {
        res.status(503).json({
            status: 'degraded',
            server: 'running',
            database: 'error',
            error: e.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map