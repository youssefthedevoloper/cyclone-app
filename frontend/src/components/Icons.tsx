interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function Svg({ size = 22, color = 'currentColor', strokeWidth = 1.8, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => (
  <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></Svg>
);
export const IconRoute = (p: IconProps) => (
  <Svg {...p}><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></Svg>
);
export const IconGrid = (p: IconProps) => (
  <Svg {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></Svg>
);
export const IconStar = (p: IconProps) => (
  <Svg {...p}><path d="m12 3 2.7 5.5 6 .9-4.35 4.2 1 6-5.35-2.8L6.65 19.6l1-6L3.3 9.4l6-.9L12 3Z" /></Svg>
);
export const IconUser = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c1-4 4-5.5 7.5-5.5s6.5 1.5 7.5 5.5" /></Svg>
);
export const IconMap = (p: IconProps) => (
  <Svg {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></Svg>
);
export const IconLayers = (p: IconProps) => (
  <Svg {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></Svg>
);
export const IconQr = (p: IconProps) => (
  <Svg {...p}><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="3.5" y="14" width="6.5" height="6.5" rx="1" /><path d="M14 14h3.5v3.5H14zM20.5 14V17M20.5 17.5H19.5M14 20.5h3.5" /></Svg>
);
export const IconScan = (p: IconProps) => (
  <Svg {...p}><path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" /><path d="M7 12h10" /></Svg>
);
export const IconPlus = (p: IconProps) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const IconBag = (p: IconProps) => (
  <Svg {...p}><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>
);
export const IconShield = (p: IconProps) => (
  <Svg {...p}><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></Svg>
);
export const IconCoins = (p: IconProps) => (
  <Svg {...p}><circle cx="9" cy="9" r="6" /><circle cx="15.5" cy="14.5" r="5.5" /><path d="M6.5 9 9 7.5 11.5 9 9 10.5 6.5 9Z" /></Svg>
);
export const IconGift = (p: IconProps) => (
  <Svg {...p}><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3.5 9h17V6.5h-17V9Z" /><path d="M12 6.5V20M12 6.5C10.5 6 8.8 4.8 9.5 3.5 10.2 2.2 12.5 4 12 6.5ZM12 6.5c1.5-.5 3.2-1.7 2.5-3C13.8 2.2 11.5 4 12 6.5Z" /></Svg>
);
export const IconBell = (p: IconProps) => (
  <Svg {...p}><path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z" /><path d="M10 19.5a2.2 2.2 0 0 0 4 0" /></Svg>
);
export const IconTicket = (p: IconProps) => (
  <Svg {...p}><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z" /><path d="M13.5 5v14M15 12h.01M15 6.5h.01M15 17.5h.01" /></Svg>
);
export const IconPlane = (p: IconProps) => (
  <Svg {...p}><path d="M10.5 13.5 3 11l1.5-2 6.2 1 4.4-4.5c.6-.6 1.6-1 2.8-.8 1.2.2 1.6 1.5 1.2 2.6L14.5 14l1 6.2-2 1.5-2.5-7.5-6 1.8 1.5-2Z" /><path d="m17 8.5 3-3" /></Svg>
);
export const IconCheck = (p: IconProps) => (
  <Svg {...p}><path d="m5 12.5 4.5 4.5L20 7" /></Svg>
);
export const IconChevron = (p: IconProps) => (
  <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>
);
export const IconBack = (p: IconProps) => (
  <Svg {...p}><path d="m15 5-7 7 7 7" /></Svg>
);
export const IconClose = (p: IconProps) => (
  <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
);
export const IconLogout = (p: IconProps) => (
  <Svg {...p}><path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" /><path d="M14 16l4-4-4-4M18 12H9" /></Svg>
);
export const IconSettings = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.27.5.79.83 1.43.91H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></Svg>
);
export const IconHelp = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8" /><path d="M12 17h.01" /></Svg>
);
export const IconPin = (p: IconProps) => (
  <Svg {...p}><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></Svg>
);
export const IconTime = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>
);
export const IconWallet = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M7 6l10-3 1.5 3" /></Svg>
);
export const IconPrint = (p: IconProps) => (
  <Svg {...p}><path d="M7 8V3h10v5" /><path d="M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="7" y="13" width="10" height="8" rx="1" /></Svg>
);
export const IconUtensils = (p: IconProps) => (
  <Svg {...p}><path d="M4 3v8a2 2 0 0 0 2 2h0" /><path d="M6 3v18M10 3v8a2 2 0 0 1-2 2v0M10 3c0 4-1 6-1 8" /><path d="M20 3c-1.5 2-2 4-2 7s.5 5 2 6v5M18 6h4" /></Svg>
);
export const IconShop = (p: IconProps) => (
  <Svg {...p}><path d="M4 7h16l1 4a2 2 0 0 1-2 2 2.5 2.5 0 0 1-5-1 2.5 2.5 0 0 1-5 1 2.5 2.5 0 0 1-5 1 2 2 0 0 1-2-2l1-4Z" /><path d="M5 13v7h14v-7M9 20v-4h6v4" /></Svg>
);
export const IconMed = (p: IconProps) => (
  <Svg {...p}><path d="M4 8h16M12 2v6" /><path d="M6 8a6 6 0 0 0 12 0" /><path d="M8 14 12 18 16 14" /><rect x="4" y="8" width="16" height="13" rx="2" /></Svg>
);
export const IconBus = (p: IconProps) => (
  <Svg {...p}><rect x="4" y="4" width="16" height="14" rx="3" /><path d="M4 11h16M8 18v2.5M16 18v2.5" /><circle cx="8.5" cy="14.5" r="1" /><circle cx="15.5" cy="14.5" r="1" /></Svg>
);
export const IconAccess = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="7.5" r="1.6" /><path d="M12 10.5V17M10 15h4" /></Svg>
);
export const IconParking = (p: IconProps) => (
  <Svg {...p}><path d="M9 21V4h5a3.5 3.5 0 0 1 0 7H9M9 11h3" /></Svg>
);
export const IconTarget = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></Svg>
);
export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}><path d="m5 9 7 7 7-7" /></Svg>
);
export const IconRefresh = (p: IconProps) => (
  <Svg {...p}><path d="M20 11A8.1 8.1 0 0 0 4.6 7.5M4 4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.4 3.5M20 20v-4h-4" /></Svg>
);