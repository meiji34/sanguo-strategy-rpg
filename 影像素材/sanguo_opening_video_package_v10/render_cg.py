#!/usr/bin/env python3
"""Render a restrained, template-inspired Three Kingdoms opening CG."""

from __future__ import annotations

import argparse
import json
import math
import random
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def lerp(start: float, end: float, amount: float) -> float:
    return start + (end - start) * amount


def smoothstep(value: float) -> float:
    value = clamp(value)
    return value * value * (3.0 - 2.0 * value)


def resolve_path(config_path: Path, configured: str) -> Path:
    path = Path(configured)
    return path if path.is_absolute() else (config_path.parent / path).resolve()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def cover_resize(image: Image.Image, size: tuple[int, int], focus: tuple[float, float], zoom: float) -> Image.Image:
    width, height = size
    scale = max(width / image.width, height / image.height) * zoom
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = clamp(focus[0] * resized.width - width / 2, 0, max(0, resized.width - width))
    top = clamp(focus[1] * resized.height - height / 2, 0, max(0, resized.height - height))
    return resized.crop((round(left), round(top), round(left) + width, round(top) + height))


def organic_noise(size: tuple[int, int], seed: int, blur: float = 1.0) -> Image.Image:
    width, height = size
    rng = np.random.default_rng(seed)
    small = rng.integers(0, 256, (max(8, height // 24), max(8, width // 24)), dtype=np.uint8)
    image = Image.fromarray(small, mode="L").filter(ImageFilter.GaussianBlur(blur))
    return ImageOps.autocontrast(image.resize(size, Image.Resampling.BICUBIC))


def make_vignette(size: tuple[int, int]) -> Image.Image:
    width, height = size
    y, x = np.ogrid[-1.0:1.0:complex(height), -1.0:1.0:complex(width)]
    radius = np.sqrt((x * 0.92) ** 2 + (y * 1.12) ** 2)
    mask = np.clip(0.98 - radius * 0.78, 0.08, 0.92)
    return Image.fromarray(np.uint8(mask * 255), mode="L")


def grade_background(image: Image.Image) -> Image.Image:
    image = ImageEnhance.Color(image.convert("RGB")).enhance(0.12)
    gray = ImageOps.grayscale(image)
    blue_black = Image.merge(
        "RGB",
        (
            gray.point(lambda value: min(255, round(value * 0.42))),
            gray.point(lambda value: min(255, round(value * 0.49))),
            gray.point(lambda value: min(255, round(value * 0.52))),
        ),
    )
    image = Image.blend(image, blue_black, 0.82)
    image = ImageEnhance.Contrast(image).enhance(1.32)
    return ImageEnhance.Brightness(image).enhance(0.33)


def tint_paper(paper: Image.Image, size: tuple[int, int]) -> Image.Image:
    paper = ImageOps.fit(paper.convert("RGB"), size, method=Image.Resampling.LANCZOS)
    gray = ImageOps.grayscale(paper)
    return Image.merge(
        "RGB",
        (
            gray.point(lambda value: 52 + value // 7),
            gray.point(lambda value: 54 + value // 8),
            gray.point(lambda value: 58 + value // 8),
        ),
    )


def make_smoke(size: tuple[int, int], time_value: float, seed: int = 217) -> Image.Image:
    width, height = size
    low_size = (max(1, width // 4), max(1, height // 4))
    mask = Image.new("L", low_size, 0)
    draw = ImageDraw.Draw(mask)
    rng = random.Random(seed)
    for index in range(16):
        x = rng.uniform(-0.20, 1.15) * low_size[0] + math.sin(time_value * 0.17 + index) * 22
        y = rng.uniform(-0.16, 1.08) * low_size[1] - time_value * rng.uniform(0.4, 1.2)
        rx = rng.uniform(38, 120)
        ry = rng.uniform(18, 74)
        draw.ellipse((x - rx, y - ry, x + rx, y + ry), fill=rng.randint(10, 33))
    mask = mask.filter(ImageFilter.GaussianBlur(28)).resize(size, Image.Resampling.BILINEAR)
    layer = Image.new("RGBA", size, (59, 71, 72, 0))
    layer.putalpha(mask)
    return layer


def make_dust(size: tuple[int, int], time_value: float, seed: int = 491) -> Image.Image:
    width, height = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    rng = random.Random(seed)
    for index in range(74):
        x = (rng.random() * width + math.sin(time_value * 0.19 + index) * 18.0) % width
        y = (rng.random() * height - time_value * rng.uniform(4.0, 16.0)) % height
        flicker = 0.36 + 0.64 * abs(math.sin(time_value * rng.uniform(0.3, 1.1) + index))
        radius = rng.choice((0.6, 0.8, 1.0, 1.4))
        alpha = round(rng.uniform(14, 66) * flicker)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(177, 189, 179, alpha))
    return layer.filter(ImageFilter.GaussianBlur(0.45))


def make_scratches(size: tuple[int, int], time_value: float) -> Image.Image:
    width, height = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    rng = random.Random(9000 + int(time_value * 3.0))
    for _ in range(5):
        y = rng.randint(80, height - 80)
        start = rng.randint(-80, width // 2)
        length = rng.randint(width // 5, width)
        draw.line((start, y, start + length, y + rng.randint(-1, 1)), fill=(163, 179, 175, rng.randint(5, 17)), width=1)
    return layer.filter(ImageFilter.GaussianBlur(0.35))


def make_board(size: tuple[int, int], time_value: float, strength: float) -> Image.Image:
    width, height = size
    board = Image.new("RGBA", (1180, 720), (0, 0, 0, 0))
    draw = ImageDraw.Draw(board)
    color = (151, 137, 111, round(62 * strength))
    for index in range(13):
        x = 120 + index * 78
        draw.line((x, 72, x, 650), fill=color, width=1)
    for index in range(9):
        y = 74 + index * 72
        draw.line((120, y, 1056, y), fill=color, width=1)
    stones = [(3, 2, "black"), (5, 3, "white"), (7, 4, "black"), (9, 5, "white"), (6, 6, "black"), (4, 7, "white")]
    for x_index, y_index, tone in stones:
        x, y = 120 + x_index * 78, 74 + y_index * 72
        radius = 22
        if tone == "white":
            fill = (189, 183, 166, round(95 * strength))
            outline = (215, 205, 179, round(110 * strength))
        else:
            fill = (8, 12, 14, round(165 * strength))
            outline = (117, 122, 113, round(70 * strength))
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill, outline=outline, width=2)
    board = board.rotate(-7.0 + math.sin(time_value * 0.11) * 0.8, resample=Image.Resampling.BICUBIC, expand=True)
    board = board.filter(ImageFilter.GaussianBlur(0.6))
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    layer.alpha_composite(board, (round(width * 0.5 - board.width / 2), round(height * 0.52 - board.height / 2)))
    return layer


def make_text_asset(
    size: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    center: tuple[float, float],
    seed: int,
    color: tuple[int, int, int],
) -> dict:
    width, height = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.text((center[0] * width, center[1] * height), text, font=font, fill=244, anchor="mm")
    texture = organic_noise(size, seed + 71, blur=0.72).point(lambda value: 178 + value // 4)
    rgba = Image.merge(
        "RGBA",
        (
            texture.point(lambda value: min(255, value + color[0] - 208)),
            texture.point(lambda value: min(255, value + color[1] - 208)),
            texture.point(lambda value: max(0, value + color[2] - 208)),
            mask,
        ),
    )
    return {
        "rgba": rgba,
        "mask": mask,
        "organic": organic_noise(size, seed + 403, blur=1.25),
        "glow": mask.filter(ImageFilter.GaussianBlur(10)),
    }


def text_state(
    local_time: float,
    duration: float,
    delay: float,
    reveal: float,
    dissolve: float,
    exit_advance: float = 0.0,
) -> tuple[float, float, float]:
    adjusted = local_time - delay
    if adjusted <= 0.0:
        return 0.0, 0.0, 0.0
    if adjusted < reveal:
        entrance = smoothstep(adjusted / reveal)
    else:
        entrance = 1.0
    exit_progress = smoothstep((local_time - (duration - dissolve - exit_advance)) / dissolve)
    dissolve_progress = smoothstep((exit_progress - 0.22) / 0.78)
    visibility = entrance * (1.0 - dissolve_progress)
    fade = entrance * (1.0 - smoothstep(exit_progress))
    return visibility, exit_progress, fade


def composite_text_motion(
    frame: Image.Image,
    layer: Image.Image,
    exit_progress: float,
    scale_end: float,
    blur_end: float,
    drift_y: float,
) -> Image.Image:
    if exit_progress <= 0.001:
        return Image.alpha_composite(frame, layer)
    bbox = layer.getchannel("A").getbbox()
    if bbox is None:
        return frame
    padding = round(blur_end * 4.0) + 12
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(frame.width, bbox[2] + padding)
    bottom = min(frame.height, bbox[3] + padding)
    cropped = layer.crop((left, top, right, bottom))
    motion = smoothstep(exit_progress)
    scale = lerp(1.0, scale_end, motion)
    cropped = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    blur = lerp(0.0, blur_end, motion)
    if blur > 0.05:
        cropped = cropped.filter(ImageFilter.GaussianBlur(blur))
    center_x = (left + right) / 2.0
    center_y = (top + bottom) / 2.0 + drift_y * motion
    destination = (round(center_x - cropped.width / 2.0), round(center_y - cropped.height / 2.0))
    transformed = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    transformed.alpha_composite(cropped, destination)
    return Image.alpha_composite(frame, transformed)


def add_organic_text(
    frame: Image.Image,
    asset: dict,
    visibility: float,
    exit_progress: float = 0.0,
    fade: float = 1.0,
    opacity: float = 1.0,
    scale_end: float = 0.88,
    blur_end: float = 7.2,
    drift_y: float = -14.0,
) -> Image.Image:
    if visibility <= 0.001:
        return frame
    threshold = round(lerp(-10.0, 269.0, visibility))
    reveal = asset["organic"].point(lambda value: 255 if value <= threshold else 0)
    alpha = ImageChops.multiply(asset["mask"], reveal).point(lambda value: round(value * opacity * fade))
    glow_alpha = ImageChops.multiply(asset["glow"], reveal).point(lambda value: round(value * opacity * fade * 0.14))
    glow = Image.new("RGBA", frame.size, (124, 148, 146, 0))
    glow.putalpha(glow_alpha)
    frame = composite_text_motion(frame, glow, exit_progress, scale_end, blur_end * 0.64, drift_y)
    text = asset["rgba"].copy()
    text.putalpha(alpha)
    return composite_text_motion(frame, text, exit_progress, scale_end, blur_end, drift_y)


def make_scene_assets(config: dict, config_path: Path, size: tuple[int, int]) -> dict[str, dict]:
    main_path = resolve_path(config_path, config["main_font_path"])
    subtitle_path = resolve_path(config_path, config["subtitle_font_path"])
    result = {}
    for scene_index, scene in enumerate(config["scenes"]):
        main_font = ImageFont.truetype(str(main_path), int(scene["font_size"]))
        subtitle_font = ImageFont.truetype(str(subtitle_path), 30, index=0)
        kicker_font = ImageFont.truetype(str(subtitle_path), 24, index=0)
        x, y = scene["text_position"]
        line_gap = int(scene["font_size"] * 1.18)
        line_assets = []
        for line_index, line in enumerate(scene["lines"]):
            line_y = float(y) + (line_index - (len(scene["lines"]) - 1) / 2) * line_gap / size[1]
            line_assets.append(make_text_asset(size, line, main_font, (float(x), line_y), 1400 + scene_index * 97 + line_index * 23, (222, 223, 209)))
        subtitle = make_text_asset(size, scene["subtitle"], subtitle_font, (0.5, 0.81), 3200 + scene_index * 61, (244, 244, 238))
        kicker = make_text_asset(size, scene["kicker"], kicker_font, (0.5, 0.33), 4800 + scene_index * 43, (189, 198, 188)) if scene.get("kicker") else None
        seal = make_text_asset(size, scene["seal"], main_font, (0.69, 0.56), 5900 + scene_index * 19, (161, 61, 49)) if scene.get("seal") else None
        result[scene["id"]] = {"lines": line_assets, "subtitle": subtitle, "kicker": kicker, "seal": seal}
    return result


def find_active_scene(scenes: list[dict], time_value: float) -> dict | None:
    for scene in scenes:
        if float(scene["start"]) <= time_value < float(scene["end"]):
            return scene
    return None


def visual_envelope(local_time: float, duration: float) -> float:
    return min(smoothstep(local_time / 0.58), smoothstep((duration - local_time) / 0.62))


def render_frame(
    config: dict,
    backgrounds: list[Image.Image],
    paper: Image.Image,
    vignette: Image.Image,
    assets: dict[str, dict],
    time_value: float,
) -> Image.Image:
    size = (int(config["width"]), int(config["height"]))
    frame = Image.new("RGBA", size, (0, 0, 0, 255))
    scene = find_active_scene(config["scenes"], time_value)
    if scene is None:
        return frame.convert("RGB")
    local_time = time_value - float(scene["start"])
    duration = float(scene["end"]) - float(scene["start"])
    progress = clamp(local_time / duration)
    envelope = visual_envelope(local_time, duration)

    zoom = lerp(float(scene["zoom"][0]), float(scene["zoom"][1]), smoothstep(progress))
    background = cover_resize(backgrounds[int(scene["background"])], size, tuple(scene["focus"]), zoom)
    background = grade_background(background).convert("RGBA")
    background.putalpha(round(255 * envelope))
    frame = Image.alpha_composite(frame, background)
    frame = Image.alpha_composite(frame, make_smoke(size, time_value))

    if scene.get("board"):
        frame = Image.alpha_composite(frame, make_board(size, time_value, float(scene["board"]) * envelope))
    frame = Image.alpha_composite(frame, make_dust(size, time_value))
    frame = Image.alpha_composite(frame, make_scratches(size, time_value))

    paper_layer = paper.convert("RGBA")
    paper_layer.putalpha(round(26 * envelope))
    frame = Image.alpha_composite(frame, paper_layer)
    rgb = ImageChops.multiply(frame.convert("RGB"), Image.merge("RGB", (vignette, vignette, vignette)))
    frame = rgb.convert("RGBA")

    scene_assets = assets[scene["id"]]
    exit_config = config.get("text_exit", {})
    main_dissolve = float(exit_config["title_main_dissolve"] if scene["id"] == "title" else exit_config["main_dissolve"])
    line_exit_stagger = float(exit_config.get("main_line_exit_stagger", 0.0))
    for index, asset in enumerate(scene_assets["lines"]):
        exit_advance = (len(scene_assets["lines"]) - 1 - index) * line_exit_stagger
        visibility, exit_progress, fade = text_state(local_time, duration, index * 0.16, 0.94, main_dissolve, exit_advance)
        frame = add_organic_text(
            frame,
            asset,
            visibility,
            exit_progress,
            fade,
            opacity=0.84,
            scale_end=float(exit_config["main_scale_end"]),
            blur_end=float(exit_config["main_blur_end"]),
            drift_y=float(exit_config["main_drift_y"]),
        )
    subtitle_dissolve = float(exit_config["title_subtitle_dissolve"] if scene["id"] == "title" else exit_config["subtitle_dissolve"])
    subtitle_visibility, subtitle_exit, subtitle_fade = text_state(local_time, duration, 0.46, 0.62, subtitle_dissolve)
    frame = add_organic_text(
        frame,
        scene_assets["subtitle"],
        subtitle_visibility,
        subtitle_exit,
        subtitle_fade,
        opacity=0.84,
        scale_end=float(exit_config["subtitle_scale_end"]),
        blur_end=float(exit_config["subtitle_blur_end"]),
        drift_y=float(exit_config["subtitle_drift_y"]),
    )
    if scene_assets["kicker"] is not None:
        kicker_visibility, kicker_exit, kicker_fade = text_state(local_time, duration, 0.12, 0.48, main_dissolve)
        frame = add_organic_text(frame, scene_assets["kicker"], kicker_visibility, kicker_exit, kicker_fade, opacity=0.68, scale_end=0.94, blur_end=4.8, drift_y=-8.0)
    if scene_assets["seal"] is not None:
        seal_visibility, seal_exit, seal_fade = text_state(local_time, duration, 0.64, 0.56, main_dissolve)
        frame = add_organic_text(frame, scene_assets["seal"], seal_visibility, seal_exit, seal_fade, opacity=0.58, scale_end=0.90, blur_end=5.6, drift_y=-10.0)
    return frame.convert("RGB")


def create_audio(config: dict, output: Path) -> None:
    sample_rate = 48000
    duration = float(config["duration"])
    count = round(sample_rate * duration)
    time = np.arange(count, dtype=np.float64) / sample_rate
    rng = np.random.default_rng(190)

    wind = rng.normal(0.0, 1.0, count)
    wind = np.convolve(wind, np.ones(1700) / 1700.0, mode="same")
    audio = wind * (0.58 + 0.16 * np.sin(time * 0.33) + 0.12 * np.sin(time * 0.14 + 1.3)) * 0.82
    audio += np.sin(time * math.tau * 38.0) * 0.026
    audio += np.sin(time * math.tau * 57.0 + 0.8) * 0.015
    audio += np.sin(time * math.tau * 83.0 + 1.4) * 0.006

    for scene in config["scenes"]:
        start = float(scene["start"])
        intensity = float(scene.get("drum", 0.4))
        local = time - start
        active = (local >= 0.0) & (local < 2.5)
        drum = np.zeros_like(audio)
        drum[active] = np.sin(math.tau * (42.0 * local[active] - 7.0 * local[active] ** 2)) * np.exp(-local[active] * 2.1)
        audio += drum * intensity * 0.34

        whoosh_local = time - (start - 0.46)
        whoosh_active = (whoosh_local >= 0.0) & (whoosh_local < 1.1)
        whoosh_noise = rng.normal(0.0, 1.0, count)
        whoosh_noise = np.convolve(whoosh_noise, np.ones(64) / 64.0, mode="same")
        whoosh_env = np.zeros_like(audio)
        whoosh_env[whoosh_active] = np.sin(math.pi * whoosh_local[whoosh_active] / 1.1) ** 2
        audio += whoosh_noise * whoosh_env * (0.044 + intensity * 0.012)

    fade = np.minimum(np.clip(time / 1.0, 0.0, 1.0), np.clip((duration - time) / 1.9, 0.0, 1.0))
    audio *= fade
    peak = max(0.001, float(np.max(np.abs(audio))))
    audio = audio / peak * 0.72
    stereo = np.column_stack((audio, audio * 0.97 + np.roll(audio, 29) * 0.03))
    pcm = np.int16(np.clip(stereo, -1.0, 1.0) * 32767)
    output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm.tobytes())


def create_preview(config: dict, frames: list[tuple[dict, Image.Image]], output: Path, subtitle_path: Path) -> None:
    cell_width, cell_height = 640, 360
    sheet = Image.new("RGB", (cell_width * 3, cell_height * 2), (0, 0, 0))
    font = ImageFont.truetype(str(subtitle_path), 28, index=0)
    for index, (scene, frame) in enumerate(frames):
        x, y = index % 3 * cell_width, index // 3 * cell_height
        sheet.paste(frame.resize((cell_width, cell_height), Image.Resampling.LANCZOS), (x, y))
        draw = ImageDraw.Draw(sheet)
        draw.rectangle((x, y + cell_height - 40, x + cell_width, y + cell_height), fill=(0, 0, 0))
        draw.text((x + 15, y + cell_height - 33), f"{index + 1}. {scene['id']}", font=font, fill=(222, 222, 216))
    draw = ImageDraw.Draw(sheet)
    x, y = 2 * cell_width, cell_height
    draw.rectangle((x, y, x + cell_width, y + cell_height), fill=(0, 0, 0))
    final_black = float(config["duration"]) - float(config["final_black_start"])
    draw.text((x + cell_width // 2, y + cell_height // 2), f"片尾纯黑 {final_black:.1f} 秒", font=font, fill=(219, 219, 214), anchor="mm")
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, quality=95, subsampling=0)


def create_motion_preview(
    config: dict,
    backgrounds: list[Image.Image],
    paper: Image.Image,
    vignette: Image.Image,
    assets: dict[str, dict],
    output: Path,
    subtitle_path: Path,
) -> None:
    scene_by_id = {scene["id"]: scene for scene in config["scenes"]}
    samples = [
        ("stakes", -2.02),
        ("stakes", -1.42),
        ("stakes", -0.96),
        ("stakes", -0.54),
        ("title", -1.24),
        ("title", -0.36),
    ]
    cell_width, cell_height = 640, 360
    sheet = Image.new("RGB", (cell_width * 3, cell_height * 2), (0, 0, 0))
    font = ImageFont.truetype(str(subtitle_path), 25, index=0)
    for index, (scene_id, offset) in enumerate(samples):
        scene = scene_by_id[scene_id]
        sample_time = float(scene["end"]) + offset
        frame = render_frame(config, backgrounds, paper, vignette, assets, sample_time)
        x, y = index % 3 * cell_width, index // 3 * cell_height
        sheet.paste(frame.resize((cell_width, cell_height), Image.Resampling.LANCZOS), (x, y))
        draw = ImageDraw.Draw(sheet)
        draw.rectangle((x, y + cell_height - 36, x + cell_width, y + cell_height), fill=(0, 0, 0))
        draw.text((x + 14, y + cell_height - 30), f"{scene_id}  退场前 {abs(offset):.2f} 秒", font=font, fill=(228, 228, 222))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, quality=95, subsampling=0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--frames", type=Path)
    parser.add_argument("--audio", type=Path)
    parser.add_argument("--preview", required=True, type=Path)
    parser.add_argument("--motion-preview", type=Path)
    parser.add_argument("--preview-only", action="store_true")
    args = parser.parse_args()

    config_path = args.config.resolve()
    config = load_json(config_path)
    size = (int(config["width"]), int(config["height"]))
    backgrounds = [Image.open(resolve_path(config_path, path)).convert("RGB") for path in config["background_paths"]]
    paper = tint_paper(Image.open(resolve_path(config_path, config["paper_path"])), size)
    vignette = make_vignette(size)
    assets = make_scene_assets(config, config_path, size)

    samples = []
    for scene in config["scenes"]:
        sample_time = lerp(float(scene["start"]), float(scene["end"]), 0.56)
        samples.append((scene, render_frame(config, backgrounds, paper, vignette, assets, sample_time)))
    create_preview(config, samples, args.preview.resolve(), resolve_path(config_path, config["subtitle_font_path"]))
    print(f"Preview written: {args.preview}", flush=True)
    if args.motion_preview is not None:
        create_motion_preview(
            config,
            backgrounds,
            paper,
            vignette,
            assets,
            args.motion_preview.resolve(),
            resolve_path(config_path, config["subtitle_font_path"]),
        )
        print(f"Motion preview written: {args.motion_preview}", flush=True)
    if args.preview_only:
        return

    if args.frames is None or args.audio is None:
        raise SystemExit("--frames and --audio are required unless --preview-only is used")
    frames_dir = args.frames.resolve()
    frames_dir.mkdir(parents=True, exist_ok=True)
    total_frames = round(float(config["duration"]) * int(config["fps"]))
    for frame_index in range(total_frames):
        frame = render_frame(config, backgrounds, paper, vignette, assets, frame_index / int(config["fps"]))
        frame.save(frames_dir / f"frame_{frame_index:05d}.jpg", quality=92, subsampling=0)
        if frame_index % 90 == 0 or frame_index == total_frames - 1:
            print(f"Rendered {frame_index + 1}/{total_frames} frames", flush=True)
    create_audio(config, args.audio.resolve())
    print(f"Audio written: {args.audio}", flush=True)


if __name__ == "__main__":
    main()
