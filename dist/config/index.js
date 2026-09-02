"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOYALTY_RULES = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load .env from backend cwd or parent
const candidates = [
    path_1.default.resolve(process.cwd(), '.env'),
    path_1.default.resolve(__dirname, '..', '.env'),
    path_1.default.resolve(__dirname, '..', '..', '.env'),
];
for (const c of candidates) {
    if (fs_1.default.existsSync(c)) {
        dotenv_1.default.config({ path: c });
        break;
    }
}
exports.config = {
    port: parseInt(process.env.PORT || '4000', 10),
    jwtSecret: process.env.JWT_SECRET || 'cyclone-super-secret-change-in-production-0123456789',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    databasePath: process.env.DATABASE_PATH || path_1.default.resolve(__dirname, '..', '..', 'data', 'cyclone.db'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
    first20Count: parseInt(process.env.FIRST20_COUNT || '20', 10),
    demoAccounts: parseInt(process.env.DEMO_ACCOUNTS || '6', 10),
};
exports.LOYALTY_RULES = {
    journeyCompletion: 100,
    allSteps: 50,
    loungeService: 150,
    premiumService: 100,
    registerItem: 25,
    partnerPurchase: 100,
};
//# sourceMappingURL=index.js.map