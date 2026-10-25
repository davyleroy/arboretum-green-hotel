// Public Sanity settings. The project id and dataset are not secrets.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2025-01-01";
export const cmsEnabled = projectId.length > 0;
