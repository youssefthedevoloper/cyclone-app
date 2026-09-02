"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const schema_1 = require("./db/schema");
const logger_1 = require("./utils/logger");
const errors_1 = require("./middleware/errors");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const ticket_routes_1 = __importDefault(require("./modules/tickets/ticket.routes"));
const journey_routes_1 = __importDefault(require("./modules/journey/journey.routes"));
const airport_routes_1 = __importDefault(require("./modules/airports/airport.routes"));
const flight_routes_1 = __importDefault(require("./modules/flights/flight.routes"));
const item_routes_1 = __importDefault(require("./modules/items/item.routes"));
const item_qr_routes_1 = __importDefault(require("./modules/items/item-qr.routes"));
const loyalty_routes_1 = __importDefault(require("./modules/loyalty/loyalty.routes"));
const reward_routes_1 = __importDefault(require("./modules/rewards/reward.routes"));
const airport_service_routes_1 = __importDefault(require("./modules/services/airport-service.routes"));
const premium_routes_1 = __importDefault(require("./modules/premium/premium.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const health_routes_1 = __importDefault(require("./modules/health/health.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    // Dev-friendly CORS: reflect the request origin (Flutter web dev server uses a random port).
    app.use((0, cors_1.default)({ origin: true, credentials: true }));
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: config_1.config.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: { code: 'rate_limited', message: 'Too many requests, please try again later.' } },
    }));
    app.use('/health', health_routes_1.default);
    // Serve the Flutter web build from ../web (same-origin deployment) if present.
    const webRoot = process.env.WEB_ROOT || path_1.default.resolve(__dirname, '..', 'web');
    if (fs_1.default.existsSync(webRoot)) {
        app.use(express_1.default.static(webRoot));
        logger_1.logger.info(`Serving web app from ${webRoot}`);
    }
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/users', user_routes_1.default);
    app.use('/api/tickets', ticket_routes_1.default);
    app.use('/api/journey', journey_routes_1.default);
    app.use('/api/airports', airport_routes_1.default);
    app.use('/api/flights', flight_routes_1.default);
    app.use('/api/items', item_routes_1.default);
    app.use('/api/qr', item_qr_routes_1.default);
    app.use('/api/loyalty', loyalty_routes_1.default);
    app.use('/api/rewards', reward_routes_1.default);
    app.use('/api/services', airport_service_routes_1.default);
    app.use('/api/premium', premium_routes_1.default);
    app.use('/api/notifications', notification_routes_1.default);
    app.use(errors_1.notFoundHandler);
    app.use(errors_1.errorHandler);
    return app;
}
function startServer() {
    (0, schema_1.migrate)();
    const app = createApp();
    const server = app.listen(config_1.config.port, () => {
        logger_1.logger.info(`CYCLONE backend listening on http://localhost:${config_1.config.port}`);
    });
    return { app, server };
}
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=index.js.map