import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { appName, userId, sessionId } = await req.json()
  // Use BACKEND_URL for server-side requests (Docker network), fallback to NEXT_PUBLIC_API_URL for local dev
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const res = await fetch(`${backendUrl}/apps/${appName}/users/${userId}/sessions/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
