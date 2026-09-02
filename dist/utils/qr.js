"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskLogoPath = maskLogoPath;
exports.buildMask = buildMask;
exports.getLogoDataUrl = getLogoDataUrl;
exports.generateQrDataUrl = generateQrDataUrl;
const qrcode_1 = __importDefault(require("qrcode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Renders the CYCLONE logo data URI. We read the trans-logo from the repo frontend assets.
// The logo is blue on transparent background.
let logoCache = null;
function maskLogoPath() {
    const candidates = [
        path_1.default.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'trans-logo.jpeg'),
        path_1.default.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'trans-logo.png'),
        path_1.default.resolve(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'trans-logo.jpeg'),
        path_1.default.resolve(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'trans-logo.png'),
    ];
    for (const c of candidates) {
        if (fs_1.default.existsSync(c))
            return c;
    }
    return null;
}
function buildMask() {
    const p = maskLogoPath();
    if (!p)
        return undefined;
    const ext = path_1.default.extname(p).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const b64 = fs_1.default.readFileSync(p).toString('base64');
    const dataUrl = `data:${mime};base64,${b64}`;
    // Convert data URL to a Buffer that qrcode can slice (gif/jpeg/png typically need full buffer)
    return Buffer.from(dataUrl.replace(/^data:[^;]+;base64,/, ''), 'base64');
}
function getLogoDataUrl() {
    if (logoCache)
        return logoCache;
    const p = maskLogoPath();
    if (!p)
        return null;
    const ext = path_1.default.extname(p).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const b64 = fs_1.default.readFileSync(p).toString('base64');
    logoCache = `data:${mime};base64,${b64}`;
    return logoCache;
}
async function generateQrDataUrl(identifier) {
    return qrcode_1.default.toDataURL(identifier, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 640,
        color: { dark: '#0B2545', light: '#FFFFFF' },
    });
}
//# sourceMappingURL=qr.js.map