import { z } from "zod";
import { CONTENT_VERSION } from "@/content";
import { getStore, type Device } from "@/lib/db";
import { LOCALES } from "@/lib/types";

const Body = z.object({
  locale: z.enum(LOCALES),
  /** Champ piège invisible : un humain le laisse vide, un robot le remplit. */
  website: z.string().max(0).optional(),
});

function detectDevice(ua: string): Device {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  // Le user-agent sert uniquement à déduire le type d'appareil ; il n'est pas stocké.
  const device = detectDevice(req.headers.get("user-agent") ?? "");
  const id = await getStore().createSession({
    locale: parsed.data.locale,
    device,
    content_version: CONTENT_VERSION,
  });
  return Response.json({ sessionId: id });
}
