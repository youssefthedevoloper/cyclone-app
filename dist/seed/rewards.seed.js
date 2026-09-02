"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICES = exports.REWARDS = void 0;
exports.REWARDS = [
    { id: 'rw_lounge', title: 'Lounge Pass', description: 'One-time access to a CYCLONE partner lounge at your departure airport.', category: 'Lounge', points_cost: 800, available: 1, premium_only: 0, inventory: 20 },
    { id: 'rw_premium', title: 'Premium Trial (1 month)', description: 'Unlock all premium CYCLONE features for one month, including advanced navigation and priority assistance.', category: 'Premium', points_cost: 500, available: 1, premium_only: 0, inventory: 50 },
    { id: 'rw_food', title: 'Food Voucher', description: 'A free meal voucher at selected airport restaurants.', category: 'Dining', points_cost: 350, available: 1, premium_only: 0, inventory: 40 },
    { id: 'rw_priority', title: 'Priority Assistance', description: 'Skip queues with priority assistance at check-in and security.', category: 'Airport', points_cost: 400, available: 1, premium_only: 0, inventory: 30 },
    { id: 'rw_discount', title: 'Partner Discount', description: '15% off at participating duty-free and partner stores.', category: 'Shopping', points_cost: 250, available: 1, premium_only: 0, inventory: 60 },
    { id: 'rw_wifi', title: 'Fast Wi-Fi Voucher', description: 'Unlimited high-speed Wi-Fi across the airport for the day.', category: 'Travel', points_cost: 150, available: 1, premium_only: 0, inventory: 100 },
    { id: 'rw_vip', title: 'VIP Lounge Access', description: 'Premium-only lounge experience with dedicated assistance (requires Premium).', category: 'Lounge', points_cost: 300, available: 1, premium_only: 1, inventory: 15 },
];
exports.SERVICES = [
    { id: 'svc_lounge', name: 'Lounge', description: 'Relax in the CYCLONE Lounge with refreshments and Wi-Fi.', category: 'Lounge', price: 25, points_reward: 150, premium_required: 0, available: 1 },
    { id: 'svc_priority', name: 'Priority Assistance', description: 'Priority boarding and queue skipping at airport checkpoints.', category: 'Assistance', price: 18, points_reward: 100, premium_required: 0, available: 1 },
    { id: 'svc_airport_asst', name: 'Airport Assistance', description: 'A dedicated CYCLONE guide to accompany you through the airport.', category: 'Assistance', price: 35, points_reward: 200, premium_required: 0, available: 1 },
    { id: 'svc_nav_prem', name: 'Premium Navigation', description: 'Turn-by-turn premium navigation with live updates inside terminals.', category: 'Navigation', price: 12, points_reward: 100, premium_required: 1, available: 1 },
    { id: 'svc_porter', name: 'Porter Service', description: 'Help with your luggage from check-in to the gate.', category: 'Assistance', price: 20, points_reward: 120, premium_required: 0, available: 1 },
    { id: 'svc_meetgreet', name: 'Meet & Greet', description: 'Be welcomed on arrival and escorted through the terminal.', category: 'Assistance', price: 30, points_reward: 150, premium_required: 0, available: 1 },
];
//# sourceMappingURL=rewards.seed.js.map