"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.notFound = notFound;
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.conflict = conflict;
class ApiError extends Error {
    constructor(status, message, code = 'error') {
        super(message);
        this.status = status;
        this.code = code;
    }
}
exports.ApiError = ApiError;
function notFound(msg = 'Not found') {
    return new ApiError(404, msg, 'not_found');
}
function badRequest(msg) {
    return new ApiError(400, msg, 'bad_request');
}
function unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg, 'unauthorized');
}
function forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg, 'forbidden');
}
function conflict(msg) {
    return new ApiError(409, msg, 'conflict');
}
//# sourceMappingURL=errors.js.map