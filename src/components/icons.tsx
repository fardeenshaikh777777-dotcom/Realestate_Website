import React from "react";

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

function make(node: React.ReactNode, displayName: string) {
  const C = ({ className = "h-5 w-5", strokeWidth = 1.7 }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {node}
    </svg>
  );
  C.displayName = displayName;
  return C;
}

export const ISearch = make(<><circle cx="11" cy="11" r="7" /><path d="m20.3 20.3-3.4-3.4" /></>, "ISearch");
export const IPin = make(<><path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></>, "IPin");
export const IBed = make(<><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 18h18" /><path d="M5 10V7a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 12 7v3" /><path d="M3 21v-3M21 21v-3" /></>, "IBed");
export const IBath = make(<><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" /><path d="M6 12V5.5A2.5 2.5 0 0 1 8.5 3c1.2 0 2.1.7 2.5 1.8" /><path d="M7 21l-.8-1.5M17 21l.8-1.5" /></>, "IBath");
export const IArea = make(<><path d="M4 4h16v16H4z" /><path d="M4 9h3M4 14h3M9 4v3M14 4v3" /><path d="m13.5 13.5 3 3M16.5 13.5l-3 3" /></>, "IArea");
export const IArrowR = make(<><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>, "IArrowR");
export const IArrowUR = make(<><path d="M7 17 17 7" /><path d="M9 7h8v8" /></>, "IArrowUR");
export const IX = make(<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>, "IX");
export const IMenu = make(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h10" /></>, "IMenu");
export const IPhone = make(<path d="M5.5 4h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5v3A1.5 1.5 0 0 1 18.5 20 15.5 15.5 0 0 1 4 5.5 1.5 1.5 0 0 1 5.5 4Z" />, "IPhone");
export const IMail = make(<><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7.5 8 6 8-6" /></>, "IMail");
export const ICalendar = make(<><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4M16 3v4" /></>, "ICalendar");
export const IKey = make(<><circle cx="8" cy="15.5" r="4.5" /><path d="m11.5 12.5 8-8" /><path d="M17 7l2.5 2.5M14.5 9.5 17 12" /></>, "IKey");
export const IBuilding = make(<><rect x="5" y="3.5" width="14" height="17" rx="1" /><path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M9 15.5h2M13 15.5h2" /><path d="M3 20.5h18" /></>, "IBuilding");
export const IHome = make(<><path d="m4 11 8-7 8 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5h4v5" /></>, "IHome");
export const IGrid = make(<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>, "IGrid");
export const IList = make(<><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="5" cy="6" r="1.2" /><circle cx="5" cy="12" r="1.2" /><circle cx="5" cy="18" r="1.2" /></>, "IList");
export const IMap = make(<><path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" /><path d="M9 4v14M15 6v14" /></>, "IMap");
export const IStar = make(<path d="m12 3.6 2.5 5.2 5.7.7-4.2 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7L12 3.6Z" />, "IStar");
export const ICheck = make(<path d="m5 12.5 4.5 4.5L19 7.5" />, "ICheck");
export const IChevD = make(<path d="m6 9.5 6 6 6-6" />, "IChevD");
export const IChevL = make(<path d="M14.5 6 8.5 12l6 6" />, "IChevL");
export const IChevR = make(<path d="m9.5 6 6 6-6 6" />, "IChevR");
export const IPlus = make(<path d="M12 5v14M5 12h14" />, "IPlus");
export const IEdit = make(<><path d="M14.5 5.5 18.5 9.5" /><path d="M5 19h3.5L20 7.5 16.5 4 5 15.5V19Z" /></>, "IEdit");
export const ITrash = make(<><path d="M4.5 6.5h15" /><path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" /><path d="M6.5 6.5 7.5 20h9l1-13.5" /><path d="M10 10.5v6M14 10.5v6" /></>, "ITrash");
export const IEye = make(<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>, "IEye");
export const IUserI = make(<><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>, "IUserI");
export const ILogout = make(<><path d="M14 4h-8a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h8" /><path d="m16 8 4 4-4 4" /><path d="M20 12H9.5" /></>, "ILogout");
export const IClock = make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>, "IClock");
export const IShield = make(<><path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z" /><path d="m9 12 2.2 2.2L15.5 9.9" /></>, "IShield");
export const ICompass = make(<><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>, "ICompass");
export const IFlame = make(<path d="M12 3.5c.8 2.8-1.6 4.4-2.8 6.2A6.6 6.6 0 0 0 12 20.5a6.7 6.7 0 0 0 6.5-6.8c0-3.5-2.6-5-3.4-7.7-1 .8-1.6 2-1.5 3.4C12.4 7.8 11.4 5.6 12 3.5Z" />, "IFlame");
export const ILeaf = make(<><path d="M19.5 4.5c-8 0-13 4-13.9 9.6-.4 2.6.8 5 3.4 5.4 5.6.9 9.6-4.1 10.5-15Z" /><path d="M4 20c3.5-6.5 8-9.5 12-11" /></>, "ILeaf");
export const IBolt = make(<path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z" />, "IBolt");
export const ICar = make(<><path d="M5 13.5 6.5 8A2 2 0 0 1 8.4 6.5h7.2A2 2 0 0 1 17.5 8l1.5 5.5" /><rect x="3.5" y="13.5" width="17" height="5" rx="1.2" /><path d="M6.5 18.5v1.5M17.5 18.5v1.5" /><path d="M7 16h.01M17 16h.01" /></>, "ICar");
export const IDrop = make(<path d="M12 3.5s6 6.4 6 10.7a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" />, "IDrop");
export const IWine = make(<><path d="M8 3.5h8l-.8 6a3.2 3.2 0 0 1-6.4 0L8 3.5Z" /><path d="M12 12.5v7M8.5 20.5h7" /></>, "IWine");
export const IDumbbell = make(<><path d="M7 8v8M17 8v8" /><path d="M4 10v4M20 10v4" /><path d="M7 12h10" /></>, "IDumbbell");
export const ISun = make(<><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></>, "ISun");
export const ICamera = make(<><path d="M4 8.5h3l1.5-2.5h7L17 8.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.7" r="3.4" /></>, "ICamera");
export const ISend = make(<><path d="m4 11.5 16-7-4.5 16-3.5-6.5L4 11.5Z" /><path d="m12 14 8-9.5" /></>, "ISend");
export const ISliders = make(<><path d="M5 7h9M18 7h1M5 12h1M10 12h9M5 17h6M15 17h4" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="13" cy="17" r="2" /></>, "ISliders");
export const ITrend = make(<><path d="m4 16.5 5-5 3.5 3.5L20 7.5" /><path d="M15 7.5h5v5" /></>, "ITrend");
export const IUsers = make(<><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 19.5c1-3 3.4-4.7 6.5-4.7s5.5 1.7 6.5 4.7" /><path d="M15.5 5.4a3.5 3.5 0 0 1 0 6.2" /><path d="M17.5 14.9c2 .6 3.4 2.1 4 4.6" /></>, "IUsers");
export const IDoor = make(<><path d="M13 21V4.5a1 1 0 0 0-1.2-1L5 5v16" /><path d="M13 5.5 19 7v14" /><path d="M3 21h18" /><circle cx="10.5" cy="13" r="0.6" /></>, "IDoor");
export const IWarn = make(<><path d="M12 4 2.8 19.5h18.4L12 4Z" /><path d="M12 10v4.5" /><path d="M12 17.2v.01" /></>, "IWarn");
export const IInfo = make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><path d="M12 7.8v.01" /></>, "IInfo");
export const IShare = make(<><circle cx="6" cy="12" r="2.6" /><circle cx="17.5" cy="5.5" r="2.6" /><circle cx="17.5" cy="18.5" r="2.6" /><path d="m8.4 10.8 6.8-4M8.4 13.2l6.8 4" /></>, "IShare");
export const ICopy = make(<><rect x="8.5" y="8.5" width="12" height="12" rx="2" /><path d="M15.5 5.5v-1a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1" transform="translate(1,1)" /></>, "ICopy");

export function IHeart({ className = "h-5 w-5", filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20.5S4 15.5 4 9.8A4.3 4.3 0 0 1 8.3 5.5c1.6 0 3 .8 3.7 2.1.7-1.3 2.1-2.1 3.7-2.1A4.3 4.3 0 0 1 20 9.8c0 5.7-8 10.7-8 10.7Z" />
    </svg>
  );
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="var(--color-pine)" />
      <path d="M18 46V30a14 14 0 0 1 28 0v16" fill="none" stroke="var(--color-brass)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="40" r="4" fill="var(--color-brass)" />
    </svg>
  );
}

export const AMENITY_ICONS: Record<string, ReturnType<typeof make>> = {
  Garage: ICar,
  Fireplace: IFlame,
  Pool: IDrop,
  Garden: ILeaf,
  "Smart Home": IBolt,
  "EV Charger": IBolt,
  "Wine Cellar": IWine,
  "Home Office": IBuilding,
  Gym: IDumbbell,
  Doorman: IShield,
  "Rooftop Deck": ISun,
  "Solar Panels": ISun,
  Sauna: IFlame,
  Balcony: IHome,
  "Mountain View": ICompass,
  Waterfront: IDrop,
};
