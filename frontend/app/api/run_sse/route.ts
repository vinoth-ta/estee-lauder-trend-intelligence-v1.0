export async function POST(req: Request) {
  const payload = await req.json()
  // Use BACKEND_URL for server-side requests (Docker network), fallback to NEXT_PUBLIC_API_URL for local dev
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  console.log(`[SSE Proxy] Connecting to: ${backendUrl}/run_sse`)
  console.log(`[SSE Proxy] Payload:`, JSON.stringify(payload, null, 2))

  const backendRes = await fetch(`${backendUrl}/run_sse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  })

  console.log(`[SSE Proxy] Backend response status: ${backendRes.status}`)
  console.log(`[SSE Proxy] Backend headers:`, Object.fromEntries(backendRes.headers.entries()))

  if (!backendRes.ok || !backendRes.body) {
    const text = await backendRes.text()
    console.error(`[SSE Proxy] Error response:`, text)
    return new Response(text, { status: backendRes.status })
  }

  console.log(`[SSE Proxy] Starting to pipe stream...`)

  // Pipe the SSE stream straight through
  return new Response(backendRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    },
  })
}
