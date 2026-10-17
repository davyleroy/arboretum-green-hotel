/**
 * Content access layer. Today it reads JSON in /content; in phase 2 the same
 * functions query Sanity, so pages and components do not change.
 */
import site from "../../content/site.json";
import roomsDoc from "../../content/rooms.json";
import venue from "../../content/venue.json";
import diningDoc from "../../content/dining.json";
import discoverDoc from "../../content/discover.json";
import manifest from "../../content/photo-manifest.json";
import type { Locale } from "@/i18n/routing";

export type L = { en: string; rw: string; fr: string };
export type Fact<T> = { value: T; placeholder?: boolean };

export type Photo = {
  src: string;
  width: number;
  height: number;
  focusY: number;
  alt: L;
  placeholder: boolean;
};

export type Room = {
  slug: string;
  name: L;
  summary: L;
  bed: Fact<L>;
  guests: Fact<number>;
  rate: Fact<number | null>;
  photos: string[];
};

export type Outlet = {
  slug: string;
  name: L;
  text: L;
  hours: Fact<string>;
  photos: string[];
};

export type Place = {
  slug: string;
  name: L;
  text: L;
  distance: Fact<L>;
  source?: string;
};

export const t = (value: L, locale: Locale) => value[locale] ?? value.en;

export const getSite = () => site;
export const getRooms = () => roomsDoc.rooms as Room[];
export const getInEveryRoom = () => roomsDoc.inEveryRoom as L[];
export const getVenue = () => venue;
export const getOutlets = () => diningDoc.outlets as Outlet[];
export const getPlaces = () => discoverDoc.places as Place[];

const slots = manifest.slots as Record<string, Photo & { arboretum: string | null }>;

export function photo(slot: string): Photo {
  const p = slots[slot];
  if (!p) throw new Error(`Unknown photo slot: ${slot}`);
  // In production, an Arboretum file replaces the Kenlo placeholder at the same slot.
  return p.arboretum ? { ...p, src: p.arboretum, placeholder: false } : p;
}

export const allPhotoSlots = () => Object.keys(slots);

export const whatsappLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const telLink = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;

export const mapsLink = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`;
