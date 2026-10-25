// CMS sync, run before every build (see package.json "prebuild").
//
// 1. SEED (once): if a write token is set and the CMS is still empty, upload today's content
//    and photos so staff start from the live site, not from a blank Studio.
// 2. PULL: if a Sanity project is configured, read the published content and write it into
//    content/*.json. Pages keep reading JSON, so the site stays fully static and fast.
//    Without a project id this script does nothing and the JSON in the repo is used.
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, createReadStream, existsSync } from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;
if (!projectId) {
  console.log("CMS sync: no Sanity project configured, using content/*.json from the repo.");
  process.exit(0);
}
const client = createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });
const J = (p) => JSON.parse(readFileSync(new URL(`../content/${p}`, import.meta.url), "utf8"));
const W = (p, d) => writeFileSync(new URL(`../content/${p}`, import.meta.url), JSON.stringify(d, null, 2) + "\n");
const pub = (p) => new URL(`../public${p}`, import.meta.url);
// A missing translation falls back to English rather than showing an empty line
const L = (o) => (o ? { en: o.en ?? "", rw: o.rw || o.en || "", fr: o.fr || o.en || "" } : undefined);
const keyed = (arr) => arr.map((x, i) => ({ _key: `k${i}`, ...x }));

async function upload(kind, path) {
  if (!existsSync(pub(path))) return undefined;
  const asset = await client.assets.upload(kind, createReadStream(pub(path)), { filename: path.split("/").pop() });
  return { _type: kind, asset: { _type: "reference", _ref: asset._id } };
}

async function seed() {
  if (!process.env.SANITY_API_WRITE_TOKEN) return;
  const exists = await client.fetch(`count(*[_id == "siteSettings"])`);
  if (exists) return;
  console.log("CMS sync: empty project, seeding from the repo content…");
  const site = J("site.json"), rooms = J("rooms.json"), dining = J("dining.json"), venue = J("venue.json"), discover = J("discover.json"), man = J("photo-manifest.json");
  const tx = client.transaction();
  tx.createIfNotExists({
    _id: "siteSettings", _type: "siteSettings",
    heroType: site.heroMedia?.type ?? "video",
    heroVideo: await upload("file", site.heroMedia?.video?.src),
    heroVideoSmall: await upload("file", site.heroMedia?.video?.srcSmall),
    heroPoster: await upload("image", site.heroMedia?.video?.poster),
    heroImageSlot: site.heroMedia?.imageSlot,
    tagline: site.tagline, address: site.address, phones: site.phones, whatsapp: site.whatsapp,
    email: site.email.value, reception: site.reception.value, replyPromise: site.replyPromise.value,
    instagram: site.social.instagram.placeholder ? undefined : site.social.instagram.value,
    facebook: site.social.facebook.placeholder ? undefined : site.social.facebook.value,
    checkIn: site.checkIn.placeholder ? undefined : site.checkIn.value, checkOut: site.checkOut.value,
    policies: keyed(site.policies.items.map((x) => ({ _type: "localeString", ...x }))),
  });
  rooms.rooms.forEach((r, i) => tx.createIfNotExists({
    _id: `room-${r.slug}`, _type: "room", slug: r.slug, order: (i + 1) * 10, name: r.name, summary: r.summary,
    bed: r.bed.value, guests: r.guests.value, rate: r.rate.value ?? undefined,
    toConfirm: !!(r.bed.placeholder || r.guests.placeholder || r.rate.placeholder), photos: r.photos,
  }));
  dining.outlets.forEach((o, i) => tx.createIfNotExists({
    _id: `outlet-${o.slug}`, _type: "outlet", slug: o.slug, order: (i + 1) * 10, name: o.name, text: o.text,
    hours: o.hours.value, toConfirm: !!o.hours.placeholder, photos: o.photos,
  }));
  tx.createIfNotExists({
    _id: "venue", _type: "venue",
    capacities: keyed(venue.capacities.map((c) => ({ layout: c.layout, people: c.people.value }))),
    included: keyed(venue.included.map((x) => ({ _type: "localeString", ...x }))),
    occasions: keyed(venue.occasions.map((x) => ({ _type: "localeString", ...x }))),
  });
  discover.places.forEach((p, i) => tx.createIfNotExists({
    _id: `place-${p.slug}`, _type: "place", slug: p.slug, order: (i + 1) * 10, name: p.name, text: p.text,
    distance: p.distance.value, toConfirm: !!p.distance.placeholder, source: p.source,
  }));
  for (const [slot, s] of Object.entries(man.slots)) {
    tx.createIfNotExists({ _id: `photo-${slot}`, _type: "photo", slot, alt: s.alt, image: await upload("image", s.src) });
  }
  await tx.commit();
  console.log("CMS sync: seed complete.");
}

async function pull() {
  const q = `{
    "site": *[_id == "siteSettings"][0]{..., "heroVideoUrl": heroVideo.asset->url, "heroVideoName": heroVideo.asset->originalFilename, "heroVideoSmallUrl": heroVideoSmall.asset->url, "heroPosterUrl": heroPoster.asset->url},
    "rooms": *[_type == "room" && !(_id in path("drafts.**"))] | order(order asc),
    "outlets": *[_type == "outlet" && !(_id in path("drafts.**"))] | order(order asc),
    "venue": *[_id == "venue"][0],
    "places": *[_type == "place" && !(_id in path("drafts.**"))] | order(order asc),
    "photos": *[_type == "photo" && !(_id in path("drafts.**"))]{slot, alt, "url": image.asset->url, "w": image.asset->metadata.dimensions.width, "h": image.asset->metadata.dimensions.height, "hy": image.hotspot.y}
  }`;
  const d = await client.fetch(q);
  if (!d.site) { console.log("CMS sync: project is empty, keeping repo content."); return; }

  const site = J("site.json"), s = d.site;
  Object.assign(site, {
    tagline: L(s.tagline) ?? site.tagline, address: L(s.address) ?? site.address,
    phones: s.phones?.length ? s.phones : site.phones, whatsapp: s.whatsapp || site.whatsapp,
    email: { value: s.email || site.email.value, placeholder: false },
    reception: s.reception ? { value: L(s.reception), placeholder: false } : site.reception,
    replyPromise: s.replyPromise ? { value: L(s.replyPromise), placeholder: false } : site.replyPromise,
    checkIn: s.checkIn ? { value: s.checkIn, placeholder: false } : site.checkIn,
    checkOut: s.checkOut ? { value: s.checkOut, placeholder: false } : site.checkOut,
    social: {
      instagram: s.instagram ? { value: s.instagram, placeholder: false } : site.social.instagram,
      facebook: s.facebook ? { value: s.facebook, placeholder: false } : site.social.facebook,
    },
    policies: { ...site.policies, items: s.policies?.length ? s.policies.map(L) : site.policies.items },
    heroMedia: {
      ...site.heroMedia,
      type: s.heroType || site.heroMedia.type,
      // A video uploaded in the Studio replaces the bundled files entirely (no stale AV1 or small poster)
      video: s.heroVideoUrl && s.heroVideoName !== site.heroMedia.video.src.split("/").pop() ? {
        src: s.heroVideoUrl,
        srcSmall: s.heroVideoSmallUrl || s.heroVideoUrl,
        poster: s.heroPosterUrl || site.heroMedia.video.poster,
      } : {
        // Still the bundled loop (seeded from this repo): serve the local, cached, AV1-enabled files
        ...site.heroMedia.video,
      },
      imageSlot: s.heroImageSlot || site.heroMedia.imageSlot,
    },
  });
  W("site.json", site);

  const roomsDoc = J("rooms.json");
  if (d.rooms.length) roomsDoc.rooms = d.rooms.map((r) => ({
    slug: r.slug, name: L(r.name), summary: L(r.summary),
    bed: { value: L(r.bed), placeholder: !!r.toConfirm }, guests: { value: r.guests ?? 2, placeholder: !!r.toConfirm },
    rate: { value: r.rate ?? null, placeholder: !!r.toConfirm }, photos: r.photos ?? [],
  }));
  W("rooms.json", roomsDoc);

  const dining = J("dining.json");
  if (d.outlets.length) dining.outlets = d.outlets.map((o) => ({
    slug: o.slug, name: L(o.name), text: L(o.text), hours: { value: o.hours ?? "", placeholder: !!o.toConfirm }, photos: o.photos ?? [],
  }));
  W("dining.json", dining);

  const venue = J("venue.json");
  if (d.venue) Object.assign(venue, {
    capacities: (d.venue.capacities ?? []).map((c) => ({ layout: L(c.layout), people: { value: c.people, placeholder: false } })),
    included: (d.venue.included ?? []).map(L), occasions: (d.venue.occasions ?? []).map(L),
  });
  W("venue.json", venue);

  const discover = J("discover.json");
  if (d.places.length) discover.places = d.places.map((p) => ({
    slug: p.slug, name: L(p.name), text: L(p.text), distance: { value: L(p.distance), placeholder: !!p.toConfirm }, ...(p.source ? { source: p.source } : {}),
  }));
  W("discover.json", discover);

  const man = J("photo-manifest.json");
  for (const p of d.photos) {
    const slot = man.slots[p.slot];
    if (!slot || !p.url) continue;
    Object.assign(slot, { src: p.url, arboretum: p.url, width: p.w, height: p.h, alt: L(p.alt) ?? slot.alt, focusY: p.hy ?? slot.focusY, placeholder: false });
  }
  W("photo-manifest.json", man);
  console.log(`CMS sync: pulled ${d.rooms.length} rooms, ${d.outlets.length} outlets, ${d.places.length} places, ${d.photos.length} photos.`);
}

await seed();
await pull();
