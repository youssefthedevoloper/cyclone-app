"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const item_service_1 = require("./item.service");
const qr_1 = require("../../utils/qr");
const router = (0, express_1.Router)();
const service = new item_service_1.ItemService();
router.use(auth_1.authenticate);
router.post('/', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.status(201).json(service.create(userId, req.body || {}));
    }
    catch (e) {
        next(e);
    }
});
router.get('/', (req, res, next) => {
    try {
        res.json({ items: service.list(req.user.userId) });
    }
    catch (e) {
        next(e);
    }
});
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
router.get('/:id', (req, res, next) => {
    try {
        res.json({ item: service.get(req.user.userId, (0, param_1.param)(req.params.id)) });
    }
    catch (e) {
        next(e);
    }
});
router.patch('/:id', (req, res, next) => {
    try {
        res.json({ item: service.update(req.user.userId, (0, param_1.param)(req.params.id), req.body || {}) });
    }
    catch (e) {
        next(e);
    }
});
router.post('/:id/lost', (req, res, next) => {
    try {
        res.json({ item: service.markLost(req.user.userId, (0, param_1.param)(req.params.id), req.body || {}) });
    }
    catch (e) {
        next(e);
    }
});
router.post('/:id/recovered', (req, res, next) => {
    try {
        res.json({ item: service.markRecovered(req.user.userId, (0, param_1.param)(req.params.id)) });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=item.routes.js.map