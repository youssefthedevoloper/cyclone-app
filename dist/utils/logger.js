"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.setLogging = setLogging;
let enabled = true;
function setLogging(on) {
    enabled = on;
}
function ts() {
    return new Date().toISOString();
}
exports.logger = {
    info(msg, meta) {
        if (!enabled)
            return;
        console.log(`[${ts()}] INFO  ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
    },
    warn(msg, meta) {
        if (!enabled)
            return;
        console.warn(`[${ts()}] WARN  ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
    },
    error(msg, meta) {
        if (!enabled)
            return;
        console.error(`[${ts()}] ERROR ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
    },
};
//# sourceMappingURL=logger.js.map