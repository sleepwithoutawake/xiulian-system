const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Accept",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return json({ ok: true, service: "cultivation-sync" });
    }

    const match = url.pathname.match(/^\/sync\/([a-f0-9]{40})$/);
    if (!match) {
      return json({ ok: false, error: "Not found" }, 404);
    }
    if (!env.SYNC_STORE) {
      return json({ ok: false, error: "Missing SYNC_STORE KV binding" }, 500);
    }

    const syncId = match[1];
    const key = `sync:${syncId}`;

    if (request.method === "GET") {
      const stored = await env.SYNC_STORE.get(key, "json");
      if (!stored) return json({ ok: true, exists: false });
      return json({ ok: true, exists: true, ...stored });
    }

    if (request.method === "PUT") {
      const body = await request.json().catch(() => null);
      if (!body || !body.payload || typeof body.payload !== "object") {
        return json({ ok: false, error: "Invalid encrypted payload" }, 400);
      }
      const serialized = JSON.stringify(body.payload);
      if (serialized.length > 900000) {
        return json({ ok: false, error: "Payload too large" }, 413);
      }

      const now = new Date().toISOString();
      const record = {
        payload: body.payload,
        revision: Date.now(),
        updatedAt: now,
        clientUpdatedAt: String(body.clientUpdatedAt || ""),
        deviceId: String(body.deviceId || "")
      };
      await env.SYNC_STORE.put(key, JSON.stringify(record));
      return json({ ok: true, exists: true, revision: record.revision, updatedAt: now });
    }

    return json({ ok: false, error: "Method not allowed" }, 405);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
