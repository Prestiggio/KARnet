import { createDirectus, staticToken, rest } from "@directus/sdk";

const directus = createDirectus(process.env.LOCAL_DIRECTUS_URL!)
        .with(staticToken(process.env.LOCAL_DIRECTUS_TOKEN!))
        .with(rest());

export default directus