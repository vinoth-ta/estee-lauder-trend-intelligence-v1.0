export async function POST(req: Request) {
    const payload = await req.json()
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
  
    const backendRes = await fetch(`${backendUrl}/run_sse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
    })
  
    if (!backendRes.ok || !backendRes.body) {
      const text = await backendRes.text()
      return new Response(text, { status: backendRes.status })
    }
  
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
  