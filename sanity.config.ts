"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, singletons } from "./src/sanity/schemas";

export default defineConfig({
  name: "arboretum",
  title: "Arboretum Green Hotel",
  basePath: "/studio",
  projectId: projectId || "missing",
  dataset,
  schema: { types: schemaTypes, templates: (t) => t.filter(({ schemaType }) => !singletons.has(schemaType)) },
  document: {
    actions: (input, ctx) => (singletons.has(ctx.schemaType) ? input.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : input),
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Arboretum Green Hotel")
          .items([
            S.listItem().title("Hotel settings").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.documentTypeListItem("room").title("Rooms"),
            S.documentTypeListItem("outlet").title("Restaurant, bar and café"),
            S.listItem().title("Conference hall").id("venue").child(S.document().schemaType("venue").documentId("venue")),
            S.documentTypeListItem("place").title("Places to discover"),
            S.documentTypeListItem("photo").title("Photos"),
          ]),
    }),
  ],
  apiVersion,
});
