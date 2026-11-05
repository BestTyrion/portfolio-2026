const allowed = new Set(["purifier", "heater", "meter", "shower", "sensor", "unknown"]);

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ available: false }, { status: 503 });
  let body: { photo?: unknown; labelPhoto?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const validImage = (value: unknown): value is string => typeof value === "string" && /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) && value.length < 2_000_000;
  if (!validImage(body.photo) || (body.labelPhoto && !validImage(body.labelPhoto))) return Response.json({ error: "Invalid image" }, { status: 400 });
  const content: Array<{ type: string; text?: string; image_url?: string; detail?: string }> = [
    { type: "input_text", text: "Identify the household water device from the photographs. Choose the closest category: purifier, heater, meter, shower, sensor, or unknown. Read a brand or model only if clearly visible; do not infer a precise model or connectivity from appearance. Output a short JSON classification." },
    { type: "input_image", image_url: body.photo, detail: "low" },
  ];
  if (validImage(body.labelPhoto)) content.push({ type: "input_image", image_url: body.labelPhoto, detail: "low" });
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST", signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini", input: [{ role: "user", content }], max_output_tokens: 200, text: { format: { type: "json_schema", name: "water_device", strict: true, schema: { type: "object", additionalProperties: false, required: ["category", "model"], properties: { category: { type: "string", enum: [...allowed] }, model: { type: "string" } } } } } }),
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) return Response.json({ available: false }, { status: 502 });
    const result = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const raw = result.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
    if (!raw) return Response.json({ available: false }, { status: 502 });
    const parsed = JSON.parse(raw) as { category?: unknown; model?: unknown };
    return Response.json({ available: true, category: allowed.has(String(parsed.category)) ? parsed.category : "unknown", model: typeof parsed.model === "string" ? parsed.model.slice(0, 80) : "" });
  } catch { return Response.json({ available: false }, { status: 502 }); }
}
