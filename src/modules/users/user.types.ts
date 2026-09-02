export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  account_number: number;
  premium_status: string;
  premium_expires_at: string | null;
  loyalty_points: number;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  accountNumber: number;
  premiumStatus: string;
  premiumExpiresAt: string | null;
  loyaltyPoints: number;
  isDemo: boolean;
  hasTicket: boolean;
  hasDemoAccess: boolean;
  createdAt: string;
}

export function toPublicUser(u: UserRow, extra: { hasTicket: boolean; hasDemoAccess: boolean }): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    accountNumber: u.account_number,
    premiumStatus: u.premium_status,
    premiumExpiresAt: u.premium_expires_at,
    loyaltyPoints: u.loyalty_points,
    isDemo: !!u.is_demo,
    hasTicket: extra.hasTicket,
    hasDemoAccess: extra.hasDemoAccess,
    createdAt: u.created_at,
  };
}
