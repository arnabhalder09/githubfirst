"""Compose a presenter holding the user's REAL product, via OpenAI gpt-image-1.

Higgsfield's API has no image-edit/reference model, so we use OpenAI's image
model (which accepts an input image) to place a new presenter together with the
uploaded product photo. The resulting image is then animated to video by
Higgsfield's image-to-video model.

Falls back gracefully (returns False) when OPENAI_API_KEY is absent or the call
fails, so the pipeline can degrade to other seeding/generation paths.
"""
from __future__ import annotations

import asyncio
import base64
from pathlib import Path

import config


def _build_prompt(avatar_label: str, scene_analysis: dict | None) -> str:
    product = (scene_analysis or {}).get("product") or {}
    prod_name = product.get("name") or "the product shown"
    prod_desc = product.get("description") or ""
    return (
        f"A photorealistic vertical (9:16) UGC-style selfie photo of a {avatar_label}, "
        f"a content creator filming a product review, smiling at the camera in natural "
        f"lighting. They are holding THIS EXACT product from the reference image — "
        f"{prod_name}. Keep the product completely unchanged: identical shape, color, "
        f"size, material, and any text or logo ({prod_desc}). Casual, authentic, "
        f"handheld feel."
    )


async def compose_presenter_image(
    product_image_path: str | Path,
    avatar_label: str,
    scene_analysis: dict | None,
    dest_path: Path,
) -> bool:
    """Generate a presenter-holding-product image into dest_path. Returns success."""
    product_image_path = Path(product_image_path)
    if not config.HAS_OPENAI or not product_image_path.exists():
        return False

    prompt = _build_prompt(avatar_label, scene_analysis)

    def _call() -> bool:
        from openai import OpenAI

        client = OpenAI(api_key=config.OPENAI_API_KEY)
        with product_image_path.open("rb") as fh:
            resp = client.images.edit(
                model=config.OPENAI_IMAGE_MODEL,
                image=fh,
                prompt=prompt,
                size="1024x1536",  # portrait / vertical
                quality="medium",
            )
        b64 = resp.data[0].b64_json
        if not b64:
            return False
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.write_bytes(base64.b64decode(b64))
        return True

    try:
        return await asyncio.to_thread(_call)
    except Exception:  # noqa: BLE001 — degrade gracefully; caller falls back
        return False
