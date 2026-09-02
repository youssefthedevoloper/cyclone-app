"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.param = param;
function param(value, fallback = '') {
    if (value === undefined || value === null)
        return fallback;
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value)) {
        const first = value[0];
        return typeof first === 'string' ? first : fallback;
    }
    return fallback;
}
//# sourceMappingURL=param.js.map