import base64
import io
import os
from contextlib import asynccontextmanager
from typing import Optional

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
from pydantic import BaseModel

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv()


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
    # Use the PORT environment variable provided by Cloud Run, defaulting to 8000
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
