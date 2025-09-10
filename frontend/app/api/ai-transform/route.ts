import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Forward the request to the backend
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/ai_transform_image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            let errorMessage = 'Backend API error'
            try {
                const errorData = await response.json()
                errorMessage = errorData.detail || errorData.error || errorMessage
            } catch (e) {
                // If response is not JSON, use status text
                errorMessage = response.statusText || errorMessage
            }
            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('AI Transform API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
