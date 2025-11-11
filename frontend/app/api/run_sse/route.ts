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

  console.log(`[SSE Proxy] Starting to stream SSE events...`)

  // Create a proper ReadableStream to forward SSE events in real-time
  const stream = new ReadableStream({
    async start(controller) {
      const reader = backendRes.body!.getReader()
      const decoder = new TextDecoder()

      try {
        let chunkCount = 0
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            console.log(`[SSE Proxy] Stream complete. Total chunks: ${chunkCount}`)
            controller.close()
            break
          }

          chunkCount++
          const chunk = decoder.decode(value, { stream: true })
          console.log(`[SSE Proxy] Forwarding chunk ${chunkCount}: ${chunk.substring(0, 100)}...`)

          // Forward the chunk to the client
          controller.enqueue(new TextEncoder().encode(chunk))
        }
      } catch (error) {
        console.error(`[SSE Proxy] Stream error:`, error)
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  })
}
