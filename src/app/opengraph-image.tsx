import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { buildTrace } from "@/lib/trace";

export const alt = `${site.name}, ${site.role.toLowerCase()} at ${site.employer.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read once at module scope: synchronous I/O keeps the image fully prerendered.
const regular = readFileSync(join(process.cwd(), "src/assets/fonts/InstrumentSans-400.ttf"));
const semibold = readFileSync(join(process.cwd(), "src/assets/fonts/InstrumentSans-600.ttf"));

/** The share card is the home page's trace, drawn from the same data. */
export default function OpengraphImage() {
  const { rows } = buildTrace();
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#f6f7f5", padding: 80 }}>
        <div style={{ display: "flex", fontFamily: "Instrument Sans", fontWeight: 600, fontSize: 64, color: "#14171a", letterSpacing: -1 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", fontFamily: "Instrument Sans", fontSize: 34, color: "#646b72", marginTop: 8 }}>
          {site.role} at {site.employer.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 14 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ display: "flex", position: "relative", height: 14, width: "100%" }}>
              <div
                style={{
                  position: "absolute",
                  left: `${r.left}%`,
                  width: `${r.width}%`,
                  height: 14,
                  borderRadius: 2,
                  background: r.critical ? "#2337c6" : "#b9c0c7",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Sans", data: regular, weight: 400, style: "normal" },
        { name: "Instrument Sans", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
