"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const ids_1 = require("../../utils/ids");
const errors_1 = require("../../utils/errors");
const loyalty_service_1 = require("../loyalty/loyalty.service");
const notification_service_1 = require("../notifications/notification.service");
const item_repo_1 = require("./item.repo");
const airport_repo_1 = require("../airports/airport.repo");
class ItemService {
    constructor(loyalty = new loyalty_service_1.LoyaltyService(), notifications = new notification_service_1.NotificationService()) {
        this.loyalty = loyalty;
        this.notifications = notifications;
    }
    list(userId) {
        return (0, item_repo_1.itemsForUser)(userId).map((i) => this.itemPublic(i, userId));
    }
    get(userId, itemId) {
        const i = (0, item_repo_1.findItemById)(itemId);
        if (!i)
            throw (0, errors_1.notFound)('Item not found');
        if (i.user_id !== userId)
            throw (0, errors_1.forbidden)('You do not own this item');
        return this.itemPublic(i, userId);
    }
    create(userId, { name, category, description }) {
        if (!name || !name.trim())
            throw (0, errors_1.badRequest)('Item name is required');
        if (!category || !category.trim())
            throw (0, errors_1.badRequest)('Category is required');
        const item = {
            id: (0, ids_1.genId)('itm'),
            user_id: userId,
            name: name.trim(),
            category: category.trim(),
            description: description?.trim() || null,
            qr_identifier: (0, ids_1.genSecureIdentifier)(),
            status: 'safe',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        (0, item_repo_1.insertItem)(item);
        const award = this.loyalty.awardItemRegistration(userId, item.id);
        return { item: this.itemPublic(item, userId), pointsEarned: award ? 25 : 0 };
    }
    update(userId, itemId, patch) {
        const i = (0, item_repo_1.findItemById)(itemId);
        if (!i)
            throw (0, errors_1.notFound)('Item not found');
        if (i.user_id !== userId)
            throw (0, errors_1.forbidden)('You do not own this item');
        (0, item_repo_1.updateItem)(itemId, patch);
        const updated = (0, item_repo_1.findItemById)(itemId);
        return this.itemPublic(updated, userId);
    }
    qrForItem(userId, itemId, regenerate = false) {
        const i = (0, item_repo_1.findItemById)(itemId);
        if (!i)
            throw (0, errors_1.notFound)('Item not found');
        if (i.user_id !== userId)
            throw (0, errors_1.forbidden)('You do not own this item');
        if (regenerate) {
            // Rotate identifier to revoke previously printed physical QRs
            const newIdentifier = (0, ids_1.genSecureIdentifier)();
            (0, item_repo_1.updateItem)(itemId, { qr_identifier: newIdentifier });
            return { identifier: newIdentifier, itemId: i.id, itemName: i.name, rotated: true };
        }
        return { identifier: i.qr_identifier, itemId: i.id, itemName: i.name, rotated: false };
    }
    verifyQr(userId, identifier) {
        if (!identifier)
            throw (0, errors_1.badRequest)('QR identifier is required');
        const item = (0, item_repo_1.findItemByIdentifier)(identifier);
        if (!item)
            throw (0, errors_1.notFound)('Invalid QR identifier');
        const report = (0, item_repo_1.lostReportForItem)(item.id);
        const isOwner = item.user_id === userId;
        if (isOwner) {
            return {
                verified: true,
                owned: true,
                identifier,
                item: this.itemPublic(item, userId),
                message: 'This item is registered to your CYCLONE account.',
            };
        }
        // Non-owner: privacy-safe
        const action = item.status === 'lost' ? 'found' : 'info';
        return {
            verified: true,
            owned: false,
            identifier,
            item: {
                id: item.id,
                category: item.category,
                status: item.status,
                registered: item.created_at,
            },
            action,
            message: item.status === 'lost'
                ? 'This item has been registered with CYCLONE and marked as lost. You can help return it anonymously.'
                : 'This item is registered with CYCLONE. No personal information is shared.',
            report: report
                ? {
                    airport: report.airport_id,
                    location: report.location,
                }
                : null,
        };
    }
    reportFound(userId, identifier) {
        const item = (0, item_repo_1.findItemByIdentifier)(identifier);
        if (!item)
            throw (0, errors_1.notFound)('Invalid QR identifier');
        if (item.user_id === userId)
            throw (0, errors_1.badRequest)('This is your own item');
        if (item.status !== 'lost')
            throw (0, errors_1.badRequest)('This item is not currently marked as lost');
        // Create a found event for owner notification (privacy safe)
        (0, item_repo_1.updateLostReport)(item.id, { status: 'found' });
        (0, item_repo_1.updateItem)(item.id, { status: 'found' });
        this.notifications.create(item.user_id, 'Item found', `Someone found your item "${item.name}" and it has been marked as FOUND.`, 'item');
        return {
            success: true,
            message: 'Thank you! The owner has been notified.',
        };
    }
    markLost(userId, itemId, { location, airportCode, description }) {
        const i = (0, item_repo_1.findItemById)(itemId);
        if (!i)
            throw (0, errors_1.notFound)('Item not found');
        if (i.user_id !== userId)
            throw (0, errors_1.forbidden)('You do not own this item');
        if (i.status === 'lost')
            throw (0, errors_1.badRequest)('Item is already marked as lost');
        let airportId = null;
        if (airportCode) {
            const ap = (0, airport_repo_1.findAirportByCode)(airportCode);
            airportId = ap ? ap.id : null;
        }
        (0, item_repo_1.insertLostReport)({
            id: (0, ids_1.genId)('lst'),
            item_id: itemId,
            user_id: userId,
            airport_id: airportId,
            location: location?.trim() || null,
            description: description?.trim() || null,
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        (0, item_repo_1.updateItem)(itemId, { status: 'lost' });
        this.notifications.create(userId, 'Item reported lost', `"${i.name}" has been marked as lost.`, 'item');
        return this.itemPublic((0, item_repo_1.findItemById)(itemId), userId);
    }
    markRecovered(userId, itemId) {
        const i = (0, item_repo_1.findItemById)(itemId);
        if (!i)
            throw (0, errors_1.notFound)('Item not found');
        if (i.user_id !== userId)
            throw (0, errors_1.forbidden)('You do not own this item');
        (0, item_repo_1.updateLostReport)(i.id, { status: 'recovered' });
        (0, item_repo_1.updateItem)(itemId, { status: 'recovered' });
        this.notifications.create(userId, 'Item recovered', `"${i.name}" has been marked as recovered.`, 'item');
        return this.itemPublic((0, item_repo_1.findItemById)(itemId), userId);
    }
    itemPublic(i, viewerId) {
        const report = (0, item_repo_1.lostReportForItem)(i.id);
        return {
            id: i.id,
            name: i.name,
            category: i.category,
            description: i.description,
            status: i.status,
            qrIdentifier: i.user_id === viewerId ? i.qr_identifier : undefined,
            createdAt: i.created_at,
            updatedAt: i.updated_at,
            ownersView: i.user_id === viewerId,
            lostReport: i.user_id === viewerId && report ? {
                location: report.location,
                airportId: report.airport_id,
                description: report.description,
                status: report.status,
                createdAt: report.created_at,
            } : undefined,
        };
    }
}
exports.ItemService = ItemService;
//# sourceMappingURL=item.service.js.map