"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const airport_service_1 = require("./airport.service");
const router = (0, express_1.Router)();
const service = new airport_service_1.AirportService();
router.use(auth_1.authenticate);
router.get('/', (req, res, next) => {
    try {
        res.json({ airports: service.list() });
    }
    catch (e) {
        next(e);
    }
});
router.get('/locations', (req, res, next) => {
    try {
        const code = (0, param_1.param)(req.query.code, 'CAI');
        res.json(service.getLocations(code));
    }
    catch (e) {
        next(e);
    }
});
router.get('/navigate', (req, res, next) => {
    try {
        const code = (0, param_1.param)(req.query.code, 'CAI');
        const from = (0, param_1.param)(req.query.from, '');
        const to = (0, param_1.param)(req.query.to, '');
        res.json(service.navigate(code, from, to));
    }
    catch (e) {
        next(e);
    }
});
router.get('/:code', (req, res, next) => {
    try {
        res.json({ airport: service.getByCode((0, param_1.param)(req.params.code)) });
    }
    catch (e) {
        next(e);
    }
});
router.get('/:code/map', (req, res, next) => {
    try {
        res.json(service.getMap((0, param_1.param)(req.params.code)));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=airport.routes.js.map