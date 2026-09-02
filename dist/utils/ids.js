"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genId = genId;
exports.genBookingReference = genBookingReference;
exports.genSecureIdentifier = genSecureIdentifier;
exports.genVoucherCode = genVoucherCode;
const crypto_1 = require("crypto");
function genId(prefix = '') {
    return (prefix ? prefix + '_' : '') + (0, crypto_1.randomBytes)(8).toString('hex');
}
function genBookingReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 6; i++)
        out += chars[(0, crypto_1.randomInt)(chars.length)];
    return out;
}
function genSecureIdentifier() {
    return 'CYC_' + (0, crypto_1.randomBytes)(16).toString('hex');
}
function genVoucherCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 12; i++)
        out += chars[(0, crypto_1.randomInt)(chars.length)];
    return 'CYC-' + out.match(/.{1,4}/g).join('-');
}
//# sourceMappingURL=ids.js.map