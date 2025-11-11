import os
import sys

# IMPORTANT: Set environment variables BEFORE any Google imports
# This ensures the Google SDK picks up the correct configuration
from dotenv import load_dotenv
load_dotenv()

# Use Vertex AI authentication (production mode)
use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True").lower() == "true"
if use_vertex:
    print("[STARTUP] Using Vertex AI authentication (production mode)")
else:
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        os.environ["GOOGLE_API_KEY"] = api_key
        print(f"[STARTUP] Using API Key authentication (prefix: {api_key[:20]}...)")
    else:
        print("[STARTUP] WARNING: GOOGLE_API_KEY not found!")

import base64
import io
from contextlib import asynccontextmanager
from typing import Optional

import httpx
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.adk.cli.fast_api import get_fast_api_app
from pydantic import BaseModel

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))


# Pydantic models
class TrendInfo(BaseModel):
    name: str
    description: str
    techniques: list[str]
    category: str
    popularity: Optional[str] = None
    difficulty: Optional[str] = None
    target_demographic: Optional[str] = None


class ImageTransformRequest(BaseModel):
    trend_info: TrendInfo
    image_data: str  # base64 encoded image


class ImageTransformResponse(BaseModel):
    success: bool
    transformed_image: Optional[str] = None  # base64 encoded image
    error: Optional[str] = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Application lifespan manager - loads data on startup."""
    print("Application starting up...")
    yield
    print("Application shutting down...")


app = get_fast_api_app(lifespan=lifespan, agents_dir=AGENT_DIR, web=True)

# Add CORS middleware for both local and production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Test endpoint to verify API key configuration
@app.get("/test-api-key")
async def test_api_key():
    """Test endpoint to verify Google API key is working."""
    import google.genai

    api_key = os.getenv("GOOGLE_API_KEY")
    use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True").lower() == "true"

    if not api_key:
        return {"error": "GOOGLE_API_KEY not set", "use_vertex_ai": use_vertex}

    try:
        # Test the API key by making a simple request
        client = google.genai.Client(api_key=api_key)
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents="Say 'API key works!'"
        )
        return {
            "success": True,
            "message": "API key is valid and working",
            "api_key_prefix": api_key[:20] + "...",
            "use_vertex_ai": use_vertex,
            "response": response.text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "api_key_prefix": api_key[:20] + "...",
            "use_vertex_ai": use_vertex
        }


def create_beauty_prompt(trend_info: TrendInfo) -> str:
    """Create a detailed prompt for generating beauty trend images."""

    base_prompt = "Convert this image to apply the following beauty trend style while keeping the person's identity and overall composition the same:"

    # Add trend name and description
    trend_description = f"Apply the '{trend_info.name}' trend: {trend_info.description}"

    # Add techniques
    if trend_info.techniques:
        techniques_text = ", ".join(trend_info.techniques)
        techniques_prompt = f"Use these specific techniques: {techniques_text}"
    else:
        techniques_prompt = ""

    # # Add category-specific styling
    # category_styling = ""
    # if trend_info.category == "makeup":
    #     category_styling = (
    #         "Focus on makeup application, color coordination, and facial enhancement."
    #     )
    # elif trend_info.category == "skincare":
    #     category_styling = "Focus on skin texture, glow, and healthy skin appearance."
    # elif trend_info.category == "hair":
    #     category_styling = "Focus on hairstyle, hair texture, and hair color/styling."

    # # Combine all parts
    # full_prompt = f"{base_prompt} {trend_description}. {techniques_prompt}. {category_styling}. Maintain natural lighting and realistic appearance."

    category_styling = ""
    preservation_instructions = ""

    if trend_info.category == "makeup":
        category_styling = (
            "Focus ONLY on makeup application, color coordination, and facial enhancement. "
            "Modify: foundation, concealer, eyeshadow, eyeliner, mascara, lipstick, blush, contour, highlight. "
            "Apply the trend's specific makeup style and color palette."
        )
        preservation_instructions = (
            "PRESERVE EXACTLY: hair style, hair color, hair texture, skin tone, facial features, "
            "eye color, eyebrow shape, and overall skin texture. Do not change hairstyle or hair appearance."
        )
    elif trend_info.category == "skincare":
        category_styling = (
            "Focus ONLY on skin texture, glow, and healthy skin appearance. "
            "Modify: skin finish, skin glow, skin texture, skin hydration appearance, skin smoothness. "
            "Apply the trend's specific skincare finish and glow effect."
        )
        preservation_instructions = (
            "PRESERVE EXACTLY: makeup application, hair style, hair color, hair texture, facial features, "
            "eye color, eyebrow shape, and lip color. Do not change makeup or hair appearance."
        )
    elif trend_info.category == "hair":
        category_styling = (
            "Focus ONLY on hairstyle, hair texture, and hair color/styling. "
            "Modify: hair cut, hair style, hair texture, hair color, hair volume, hair movement. "
            "Apply the trend's specific hairstyle and hair characteristics."
        )
        preservation_instructions = (
            "PRESERVE EXACTLY: makeup application, skin tone, facial features, eye color, "
            "eyebrow shape, lip color, and overall skin appearance. Do not change makeup or skin appearance."
        )

    # Combine all parts with clear preservation instructions
    full_prompt = (
        f"{base_prompt} {trend_description}. {techniques_prompt}. "
        f"{category_styling} {preservation_instructions} "
        "Maintain natural lighting, realistic appearance, and the person's natural beauty. "
        "The transformation should look professional and authentic."
    )
    return full_prompt


@app.post("/ai_transform_image", response_model=ImageTransformResponse)
async def ai_transform_image(request: ImageTransformRequest):
    """Generate a beauty trend image using AI based on the selected trend."""
    try:
        # Get Azure API key from environment
        azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
        print(
            f"API Key loaded: {azure_api_key[:10]}..."
            if azure_api_key
            else "No API key found"
        )

        if not azure_api_key:
            return ImageTransformResponse(
                success=False, error="Azure OpenAI API key not configured"
            )

        # Create the prompt
        prompt = create_beauty_prompt(request.trend_info)
        print(f"Generated prompt: {prompt[:100]}...")

        # # Note: For image generation, we don't need to decode the input image
        # # The prompt will be used to generate a new image based on the trend

        # # For now, we'll generate a new image based on the trend instead of editing
        # # This is because Azure OpenAI FLUX doesn't support image editing in the same way
        # # In a production environment, you'd want to use a different service for image editing

        # # Prepare the request to Azure OpenAI for image generation
        # url = "https://ashle-m8gjmknf-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview"

        # headers = {
        #     "Authorization": f"Bearer {azure_api_key}",
        #     "Content-Type": "application/json",
        # }

        # # Create JSON payload for image generation
        # payload = {
        #     "model": "flux.1-kontext-pro",
        #     "prompt": prompt,
        #     "n": 1,
        #     "size": "1024x1024",
        #     "response_format": "b64_json",
        # }

        # # Make the request to Azure OpenAI
        # async with httpx.AsyncClient(timeout=60.0) as client:
        #     response = await client.post(url, headers=headers, json=payload)

        #     if response.status_code != 200:
        #         return ImageTransformResponse(
        #             success=False, error=f"Azure OpenAI API error: {response.text}"
        #         )

        #     result = response.json()

        #     # Extract the base64 image from the response
        #     if "data" in result and len(result["data"]) > 0:
        #         generated_image_b64 = result["data"][0].get("b64_json")
        #         if generated_image_b64:
        #             return ImageTransformResponse(
        #                 success=True, transformed_image=generated_image_b64
        #             )
        #         else:
        #             return ImageTransformResponse(
        #                 success=False, error="No generated image received from API"
        #             )
        #     else:
        #         return ImageTransformResponse(
        #             success=False, error="Invalid response format from Azure OpenAI API"
        #         )
         # Decode base64 image
        try:
            image_data = base64.b64decode(request.image_data)
        except (ValueError, IndexError) as e:
            return ImageTransformResponse(
                success=False, error=f"Invalid image data: {str(e)}"
            )

        # Prepare the request to Azure OpenAI
        url = "https://ashle-m8gjmknf-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview"

        headers = {"Authorization": f"Bearer {azure_api_key}"}

        # Create form data matching the working curl request
        files = {
            "model": (None, "flux.1-kontext-pro"),
            "image": ("image_to_edit.png", io.BytesIO(image_data), "image/png"),
            "prompt": (None, prompt),
        }

        # Make the request to Azure OpenAI
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, files=files)

            if response.status_code != 200:
                return ImageTransformResponse(
                    success=False, error=f"Azure OpenAI API error: {response.text}"
                )

            result = response.json()

            # Extract the base64 image from the response
            if "data" in result and len(result["data"]) > 0:
                transformed_image_b64 = result["data"][0].get("b64_json")
                if transformed_image_b64:
                    return ImageTransformResponse(
                        success=True, transformed_image=transformed_image_b64
                    )
                else:
                    return ImageTransformResponse(
                        success=False, error="No transformed image received from API"
                    )
            else:
                return ImageTransformResponse(
                    success=False, error="Invalid response format from Azure OpenAI API"
                )

    except (httpx.RequestError, httpx.HTTPStatusError, ValueError) as e:
        print(f"Error in ai_transform_image: {str(e)}")
        return ImageTransformResponse(
            success=False, error=f"Internal server error: {str(e)}"
        )
    except Exception as e:  # pylint: disable=broad-except
        print(f"Unexpected error in ai_transform_image: {str(e)}")
        return ImageTransformResponse(
            success=False, error="An unexpected error occurred"
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
