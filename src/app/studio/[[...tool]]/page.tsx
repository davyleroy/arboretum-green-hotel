import type { Metadata } from "next";
import { NextStudio } from "next-sanity/studio";
import { metadata as studioMetadata, viewport } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

// Aggressive robots directives so Studio never ends up in search caches, archives or snippets.
// The X-Robots-Tag header in next.config.ts provides the same directive at the transport layer.
export const metadata: Metadata = {
  ...studioMetadata,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export { viewport };

export default function StudioPage() {
  return <NextStudio config={config} />;
}
