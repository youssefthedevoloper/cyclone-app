import { getDb } from '../../db/connection';
import { genId, genSecureIdentifier } from '../../utils/ids';
import { badRequest, forbidden, notFound } from '../../utils/errors';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { NotificationService } from '../notifications/notification.service';
import { fetchUserById } from '../users/user.repo';
import {
  insertItem,
  updateItem,
  findItemById,
  findItemByIdentifier,
  itemsForUser,
  insertLostReport,
  updateLostReport,
  lostReportForItem,
  ItemRow,
} from './item.repo';
import { findAirportByCode } from '../airports/airport.repo';

export class ItemService {
  constructor(
    private loyalty = new LoyaltyService(),
    private notifications = new NotificationService()
  ) {}

  list(userId: string) {
    return itemsForUser(userId).map((i) => this.itemPublic(i, userId));
  }

  get(userId: string, itemId: string) {
    const i = findItemById(itemId);
    if (!i) throw notFound('Item not found');
    if (i.user_id !== userId) throw forbidden('You do not own this item');
    return this.itemPublic(i, userId);
  }

  create(userId: string, { name, category, description }: any) {
    if (!name || !name.trim()) throw badRequest('Item name is required');
    if (!category || !category.trim()) throw badRequest('Category is required');
    const item: ItemRow = {
      id: genId('itm'),
      user_id: userId,
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || null,
      qr_identifier: genSecureIdentifier(),
      status: 'safe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    insertItem(item);
    const award = this.loyalty.awardItemRegistration(userId, item.id);
    return { item: this.itemPublic(item, userId), pointsEarned: award ? 25 : 0 };
  }

  update(userId: string, itemId: string, patch: { name?: string; category?: string; description?: string }) {
    const i = findItemById(itemId);
    if (!i) throw notFound('Item not found');
    if (i.user_id !== userId) throw forbidden('You do not own this item');
    updateItem(itemId, patch);
    const updated = findItemById(itemId)!;
    return this.itemPublic(updated, userId);
  }

  qrForItem(userId: string, itemId: string, regenerate = false) {
    const i = findItemById(itemId);
    if (!i) throw notFound('Item not found');
    if (i.user_id !== userId) throw forbidden('You do not own this item');
    if (regenerate) {
      // Rotate identifier to revoke previously printed physical QRs
      const newIdentifier = genSecureIdentifier();
      updateItem(itemId, { qr_identifier: newIdentifier });
      return { identifier: newIdentifier, itemId: i.id, itemName: i.name, rotated: true };
    }
    return { identifier: i.qr_identifier, itemId: i.id, itemName: i.name, rotated: false };
  }

  verifyQr(userId: string, identifier: string) {
    if (!identifier) throw badRequest('QR identifier is required');
    const item = findItemByIdentifier(identifier);
    if (!item) throw notFound('Invalid QR identifier');
    const report = lostReportForItem(item.id);
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
      message:
        item.status === 'lost'
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

  reportFound(userId: string, identifier: string) {
    const item = findItemByIdentifier(identifier);
    if (!item) throw notFound('Invalid QR identifier');
    if (item.user_id === userId) throw badRequest('This is your own item');
    if (item.status !== 'lost') throw badRequest('This item is not currently marked as lost');
    // Create a found event for owner notification (privacy safe)
    updateLostReport(item.id, { status: 'found' });
    updateItem(item.id, { status: 'found' });
    this.notifications.create(item.user_id, 'Item found', `Someone found your item "${item.name}" and it has been marked as FOUND.`, 'item');
    return {
      success: true,
      message: 'Thank you! The owner has been notified.',
    };
  }

  markLost(userId: string, itemId: string, { location, airportCode, description }: any) {
    const i = findItemById(itemId);
    if (!i) throw notFound('Item not found');
    if (i.user_id !== userId) throw forbidden('You do not own this item');
    if (i.status === 'lost') throw badRequest('Item is already marked as lost');
    let airportId: string | null = null;
    if (airportCode) {
      const ap = findAirportByCode(airportCode);
      airportId = ap ? ap.id : null;
    }
    insertLostReport({
      id: genId('lst'),
      item_id: itemId,
      user_id: userId,
      airport_id: airportId,
      location: location?.trim() || null,
      description: description?.trim() || null,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    updateItem(itemId, { status: 'lost' });
    this.notifications.create(userId, 'Item reported lost', `"${i.name}" has been marked as lost.`, 'item');
    return this.itemPublic(findItemById(itemId)!, userId);
  }

  markRecovered(userId: string, itemId: string) {
    const i = findItemById(itemId);
    if (!i) throw notFound('Item not found');
    if (i.user_id !== userId) throw forbidden('You do not own this item');
    updateLostReport(i.id, { status: 'recovered' });
    updateItem(itemId, { status: 'recovered' });
    this.notifications.create(userId, 'Item recovered', `"${i.name}" has been marked as recovered.`, 'item');
    return this.itemPublic(findItemById(itemId)!, userId);
  }

  private itemPublic(i: ItemRow, viewerId: string) {
    const report = lostReportForItem(i.id);
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