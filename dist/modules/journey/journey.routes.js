"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const journey_service_1 = require("./journey.service");
const router = (0, express_1.Router)();
const service = new journey_service_1.JourneyService();
router.use(auth_1.authenticate);
router.get('/', (req, res, next) => {
    try {
        const { userId, accountNumber } = req.user;
        res.json(service.getJourney(userId, accountNumber));
    }
    catch (e) {
        next(e);
    }
});
router.get('/:id', (req, res, next) => {
    try {
        const { userId, accountNumber } = req.user;
        res.json({ journey: service.getJourneyById(userId, (0, param_1.param)(req.params.id), accountNumber) });
    }
    catch (e) {
        next(e);
    }
});
router.post('/:id/steps/:stepId/complete', (req, res, next) => {
    try {
        const { userId } = req.user;
        res.json(service.completeStep(userId, (0, param_1.param)(req.params.id), (0, param_1.param)(req.params.stepId)));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=journey.routes.js.map