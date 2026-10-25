import { defineField, defineType } from "sanity";

const order = defineField({ name: "order", title: "Order on the page", type: "number", initialValue: 10 });
const slug = defineField({ name: "slug", title: "Key (do not change)", type: "string", readOnly: ({ document }) => !!document?._createdAt });
const photos = defineField({
  name: "photos",
  title: "Photos (names from the Photos list)",
  type: "array",
  of: [{ type: "string" }],
});

export const room = defineType({
  name: "room",
  title: "Rooms",
  type: "document",
  fields: [
    slug,
    order,
    defineField({ name: "name", type: "localeString" }),
    defineField({ name: "summary", type: "localeText" }),
    defineField({ name: "bed", type: "localeString" }),
    defineField({ name: "guests", title: "Max guests", type: "number" }),
    defineField({ name: "rate", title: "Rate per night (RWF), empty = on request", type: "number" }),
    defineField({ name: "toConfirm", title: "Facts still to confirm", type: "boolean", initialValue: false }),
    photos,
  ],
  orderings: [{ title: "Page order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name.en", subtitle: "rate" }, prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ? `RWF ${subtitle}` : "Rate on request" }) },
});

export const outlet = defineType({
  name: "outlet",
  title: "Restaurant, bar and café",
  type: "document",
  fields: [
    slug,
    order,
    defineField({ name: "name", type: "localeString" }),
    defineField({ name: "text", type: "localeText" }),
    defineField({ name: "hours", type: "string" }),
    defineField({ name: "toConfirm", title: "Hours still to confirm", type: "boolean", initialValue: false }),
    photos,
  ],
  preview: { select: { title: "name.en", subtitle: "hours" } },
});

export const place = defineType({
  name: "place",
  title: "Places to discover",
  type: "document",
  fields: [
    slug,
    order,
    defineField({ name: "name", type: "localeString" }),
    defineField({ name: "text", type: "localeText" }),
    defineField({ name: "distance", type: "localeString" }),
    defineField({ name: "toConfirm", title: "Distance still to confirm", type: "boolean", initialValue: false }),
    defineField({ name: "source", type: "url" }),
  ],
  preview: { select: { title: "name.en" } },
});

export const venue = defineType({
  name: "venue",
  title: "Conference hall",
  type: "document",
  fields: [
    defineField({
      name: "capacities",
      type: "array",
      of: [{ type: "object", fields: [{ name: "layout", type: "localeString" }, { name: "people", type: "number" }], preview: { select: { title: "layout.en", subtitle: "people" } } }],
    }),
    defineField({ name: "included", type: "array", of: [{ type: "localeString" }] }),
    defineField({ name: "occasions", type: "array", of: [{ type: "localeString" }] }),
  ],
  preview: { prepare: () => ({ title: "Conference hall" }) },
});

export const photo = defineType({
  name: "photo",
  title: "Photos",
  type: "document",
  description: "Each photo has a fixed name used by the pages. Replace the image to change it everywhere.",
  fields: [
    defineField({ name: "slot", title: "Name (do not change)", type: "string", readOnly: ({ document }) => !!document?._createdAt }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "alt", title: "Description for blind visitors and Google", type: "localeString" }),
  ],
  preview: { select: { title: "slot", media: "image" } },
});
