export async function POST(req: Request) {
    const payload = await req.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  
    const backendRes = await fetch(`${backendUrl}/ai_transform_image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  
    if (!backendRes.ok) {
      const text = await backendRes.text()
      return new Response(text, { status: backendRes.status })
    }
  
    const data = await backendRes.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
