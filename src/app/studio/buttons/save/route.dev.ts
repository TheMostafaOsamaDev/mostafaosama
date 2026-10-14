import { writeFile } from "node:fs/promises";
import path from "node:path";
import { parseButtonSettings } from "@/components/ui/button-settings";

// Development only (see next.config.ts). Writes the buttons chosen in /studio/buttons to the file the site reads.
const FILE = path.join(process.cwd(), "src/components/ui/buttons.settings.json");

export async function POST(request: Request) {
  // `next dev` also listens on the local network; only the machine running it may write source files.
  const host = new URL(request.url).hostname;
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
    return Response.json({ error: "Saving is only allowed from localhost." }, { status: 403 });
  }
  const parsed = parseButtonSettings(await request.json().catch(() => null));
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });
  await writeFile(FILE, JSON.stringify(parsed, null, 2) + "\n");
  return Response.json({ ok: true });
}
