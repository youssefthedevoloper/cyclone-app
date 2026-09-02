"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const item_service_1 = require("./item.service");
const qr_1 = require("../../utils/qr");
const router = (0, express_1.Router)();
const service = new item_service_1.ItemService();
// QR verification is public-ish but requires auth; rate limited to prevent scanning abuse
const verifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'rate_limited', message: 'Too many QR scans. Try again shortly.' } },
});
router.use(auth_1.authenticate);
// Generate QR (visual) for an item
router.post('/:id/qr', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const qr = service.qrForItem(userId, (0, param_1.param)(req.params.id));
        const dataUrl = await (0, qr_1.generateQrDataUrl)(qr.identifier);
        res.json({
            itemId: qr.itemId,
            itemName: qr.itemName,
            identifier: qr.identifier,
            qrDataUrl: dataUrl,
            logoDataUrl: (0, qr_1.getLogoDataUrl)(),
            rotated: qr.rotated,
        });
    }
    catch (e) {
        next(e);
    }
});
// Regenerate QR (rotates identifier, revoking previously printed codes)
router.post('/:id/qr/regenerate', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const qr = service.qrForItem(userId, (0, param_1.param)(req.params.id), true);
        const dataUrl = await (0, qr_1.generateQrDataUrl)(qr.identifier);
        res.json({
            itemId: qr.itemId,
            itemName: qr.itemName,
            identifier: qr.identifier,
            qrDataUrl: dataUrl,
            logoDataUrl: (0, qr_1.getLogoDataUrl)(),
            rotated: qr.rotated,
        });
    }
    catch (e) {
        next(e);
    }
});
// Verify a scanned/entered QR identifier
router.post('/verify', verifyLimiter, (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json(service.verifyQr(userId, (req.body || {}).identifier));
    }
    catch (e) {
        next(e);
    }
});
// Report found (non-owner scans a lost item) - privacy-safe
router.post('/found', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json(service.reportFound(userId, (req.body || {}).identifier));
    }
    catch (e) {
        next(e);
    }
});
// Alias route under /qr (the structure had a /qr/verify too)
router.post('/verify-scan', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json(service.verifyQr(userId, (req.body || {}).identifier));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=item-qr.routes.js.map