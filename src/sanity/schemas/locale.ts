import { defineType } from "sanity";

/** Every visible text exists in English, Kinyarwanda and French. */
const langs = [
  { name: "en", title: "English" },
  { name: "rw", title: "Kinyarwanda" },
  { name: "fr", title: "Français" },
];

export const localeString = defineType({
  name: "localeString",
  title: "Text (3 languages)",
  type: "object",
  fields: langs.map((l) => ({ name: l.name, title: l.title, type: "string" })),
});

export const localeText = defineType({
  name: "localeText",
  title: "Paragraph (3 languages)",
  type: "object",
  fields: langs.map((l) => ({ name: l.name, title: l.title, type: "text", rows: 3 })),
});
