import { localeString, localeText } from "./locale";
import { siteSettings } from "./site";
import { room, outlet, place, venue, photo } from "./collections";

export const schemaTypes = [localeString, localeText, siteSettings, room, outlet, venue, place, photo];
export const singletons = new Set(["siteSettings", "venue"]);
