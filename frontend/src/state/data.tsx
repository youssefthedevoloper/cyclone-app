import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  JourneyApi,
  LoyaltyApi,
  TicketApi,
  ItemApi,
  NotificationApi,
  AirportApi,
} from '../api/client';
import { useAuth } from './auth';

export interface JourneyData {
  access: 'personal' | 'demo' | 'required';
  reason?: string;
  journey: any | null;
  message?: string;
}

interface DataCtx {
  journey: JourneyData | null;
  loyalty: any | null;
  tickets: any[];
  items: any[];
  notifications: { notifications: any[]; unreadCount: number } | null;
  airports: any[];
  loaded: Record<string, boolean>;
  refresh: (keys?: string[]) => Promise<void>;
  invalidate: (keys: string[]) => void;
  reloadAll: () => Promise<void>;
}

const Ctx = createContext<DataCtx>(null as any);

export function useData() {
  return useContext(Ctx);
}

const allKeys = ['journey', 'loyalty', 'tickets', 'items', 'notifications', 'airports'];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loyalty, setLoyalty] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any | null>(null);
  const [airports, setAirports] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  const loadOne = useCallback(async (key: string) => {
    try {
      if (key === 'journey') setJourney(await JourneyApi.get());
      else if (key === 'loyalty') setLoyalty(await LoyaltyApi.get());
      else if (key === 'tickets') setTickets((await TicketApi.list()).tickets || []);
      else if (key === 'items') setItems((await ItemApi.list()).items || []);
      else if (key === 'notifications') setNotifications(await NotificationApi.list());
      else if (key === 'airports') setAirports((await AirportApi.list()).airports || []);
      setLoaded((l) => ({ ...l, [key]: true }));
    } catch (e) {
      setLoaded((l) => ({ ...l, [key]: true }));
    }
  }, []);

  const refresh = useCallback(async (keys?: string[]) => {
    const ks = keys || allKeys;
    await Promise.all(ks.map(loadOne));
  }, [loadOne]);

  const invalidate = useCallback((keys: string[]) => {
    keys.forEach((k) => {
      setLoaded((l) => ({ ...l, [k]: false }));
      loadOne(k);
    });
  }, [loadOne]);

  const reloadAll = useCallback(() => refresh(), [refresh]);

  useEffect(() => {
    if (token) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Ctx.Provider value={{ journey, loyalty, tickets, items, notifications, airports, loaded, refresh, invalidate, reloadAll }}>
      {children}
    </Ctx.Provider>
  );
}