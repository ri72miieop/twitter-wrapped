import { nanoid } from "nanoid";
import { getLandingPage } from "./pages/landing";
import { getWrappedPage } from "./pages/wrapped";
import { getAnalyzerScript } from "./analyzer";
import { generateOgImage } from "./og-image";

export interface Env {
  WRAPPED_DATA: KVNamespace;
  ANALYTICS: AnalyticsEngineDataset;
  ENVIRONMENT: string;
}

function logEvent(
  analytics: AnalyticsEngineDataset,
  event: string,
  request: Request,
  extra?: { blob2?: string; double1?: number }
) {
  const country = request.cf?.country as string || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const deviceType = /mobile/i.test(userAgent) ? "mobile" : "desktop";

  analytics.writeDataPoint({
    blobs: [
      event,                    // blob1: event type
      extra?.blob2 || "",       // blob2: extra info (e.g. wrapped ID prefix)
      country,                  // blob3: country code
      deviceType,               // blob4: device type
    ],
    doubles: [
      extra?.double1 || 1,      // double1: count or extra number
    ],
    indexes: [event],           // index by event type for fast queries
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for API routes
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Landing page
      if (path === "/" || path === "/index.html") {
        logEvent(env.ANALYTICS, "page_view", request, { blob2: "landing" });
        return new Response(getLandingPage(), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      // Analyzer script (served as JS)
      if (path === "/analyzer.js") {
        return new Response(getAnalyzerScript(), {
          headers: { "Content-Type": "application/javascript; charset=utf-8" },
        });
      }

      // API: Save wrapped data for sharing
      if (path === "/api/share" && request.method === "POST") {
        try {
          const body = await request.json() as { data: unknown };

          if (!body.data) {
            return new Response(JSON.stringify({ error: "No data provided" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          // Generate short ID
          const id = nanoid(10);

          // Store in KV (expire after 1 year)
          const dataStr = JSON.stringify(body.data);
          await env.WRAPPED_DATA.put(id, dataStr, {
            expirationTtl: 60 * 60 * 24 * 365,
          });

          logEvent(env.ANALYTICS, "wrapped_shared", request, { blob2: id.slice(0, 4) });

          const shareUrl = `${url.origin}/w/${id}`;

          return new Response(JSON.stringify({ id, url: shareUrl }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Share error:", e);
          return new Response(JSON.stringify({ error: "Failed to save wrapped data" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // API: Log that a wrapped was generated (client-side calls this)
      if (path === "/api/generated" && request.method === "POST") {
        try {
          const body = await request.json() as { username?: string };
          const username = body.username || "unknown";
          logEvent(env.ANALYTICS, "wrapped_generated", request, { blob2: username });
        } catch {
          logEvent(env.ANALYTICS, "wrapped_generated", request);
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // OG Image for shared wrapped
      if (path.startsWith("/og/")) {
        const id = path.slice(4).replace(/\.png$/, "");
        if (!id || id.length < 5) {
          return new Response("Invalid wrapped ID", { status: 400 });
        }

        const data = await env.WRAPPED_DATA.get(id, "json");
        if (!data) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const pngData = await generateOgImage(data as any);
          return new Response(pngData, {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (error: any) {
          console.error("OG image generation error:", error);
          return new Response(`Failed to generate image: ${error?.message || error}`, { status: 500 });
        }
      }

      // View shared wrapped
      if (path.startsWith("/w/")) {
        const id = path.slice(3);
        if (!id || id.length < 5) {
          return new Response("Invalid wrapped ID", { status: 400 });
        }

        const data = await env.WRAPPED_DATA.get(id, "json");
        if (!data) {
          return new Response(getNotFoundPage(), {
            status: 404,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }

        logEvent(env.ANALYTICS, "wrapped_viewed", request, { blob2: id.slice(0, 4) });

        return new Response(getWrappedPage(data as any, id, url.origin), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      return new Response("Not found", { status: 404 });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },
};

function getNotFoundPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wrapped Not Found</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', system-ui, sans-serif;
      background: #050508;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .container { padding: 40px; }
    h1 { font-size: 120px; background: linear-gradient(135deg, #00f5d4, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: rgba(255,255,255,0.6); font-size: 18px; margin: 20px 0; }
    a { color: #00f5d4; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>This wrapped doesn't exist or has expired.</p>
    <a href="/">Create your own Twitter Wrapped</a>
  </div>
</body>
</html>`;
}
