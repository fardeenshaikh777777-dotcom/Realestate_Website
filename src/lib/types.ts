export type Role = "BUYER" | "AGENT" | "ADMIN";
export type PropertyType = "house" | "apartment" | "townhouse" | "villa" | "loft" | "cabin";
export type ListingStatus = "available" | "pending" | "sold" | "rented" | "rejected";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type SortKey = "newest" | "price-asc" | "price-desc" | "area-desc";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  title?: string;
  bio?: string;
  rating?: number;
  deals?: number;
  joinedOn: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  status: ListingStatus;
  beds: number;
  baths: number;
  area: number; // sq ft
  address: string;
  city: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  mapX: number; // 0..100 normalized position on the stylized city map
  mapY: number;
  images: string[];
  amenities: string[];
  agentId: string;
  yearBuilt: number;
  featured?: boolean;
  listedOn: string; // ISO date
  views: number;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  userId?: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId?: string;
  name: string;
  email: string;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Filters {
  q: string;
  city: string; // "any" or city name
  type: PropertyType | "any";
  min: number;
  max: number;
  beds: number; // 0 = any
  baths: number;
  status: "any" | "available" | "rented" | "sold";
  sort: SortKey;
}

export interface PropertyInput {
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  beds: number;
  baths: number;
  area: number;
  address: string;
  city: string;
  state: string;
  district: string;
  yearBuilt: number;
  amenities: string[];
  images: string[];
}

export const PROPERTY_TYPES: { value: PropertyType; label: string; plural: string }[] = [
  { value: "house", label: "House", plural: "Houses" },
  { value: "apartment", label: "Apartment", plural: "Apartments" },
  { value: "townhouse", label: "Townhouse", plural: "Townhouses" },
  { value: "villa", label: "Villa", plural: "Villas" },
  { value: "loft", label: "Loft", plural: "Lofts" },
  { value: "cabin", label: "Cabin", plural: "Cabins" },
];

export const AMENITIES = [
  "Garage",
  "Fireplace",
  "Pool",
  "Garden",
  "Smart Home",
  "EV Charger",
  "Wine Cellar",
  "Home Office",
  "Gym",
  "Doorman",
  "Rooftop Deck",
  "Solar Panels",
  "Sauna",
  "Balcony",
  "Mountain View",
  "Waterfront",
];
