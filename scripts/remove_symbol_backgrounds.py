from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path("/Users/sabrinahoffer/Documents/Codex/2026-06-18/product-design-plugin-product-design-openai/work/prototype/src/assets")
TARGETS = [
    "blonde-cat-girl.png",
    "blonde-heart-girl.png",
    "dark-wolf-full.png",
    "pink-elf-girl.png",
    "sheep-symbol-new.png",
    "white-wolf-boy.png",
]


def is_background(pixel):
    r, g, b, a = pixel
    if a == 0:
        return True

    values = np.array([r, g, b], dtype=np.int16)
    brightness = values.mean()
    spread = values.max() - values.min()

    return brightness >= 232 and spread <= 26


def build_mask(pixels):
    height, width, _ = pixels.shape
    visited = np.zeros((height, width), dtype=bool)
    queue = deque()

    def push(x, y):
        if visited[y, x]:
            return
        if not is_background(pixels[y, x]):
            return
        visited[y, x] = True
        queue.append((x, y))

    for x in range(width):
        push(x, 0)
        push(x, height - 1)

    for y in range(height):
        push(0, y)
        push(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx = x + dx
            ny = y + dy
            if 0 <= nx < width and 0 <= ny < height:
                push(nx, ny)

    return visited


def should_trim_outline(pixels, x, y, mask):
    r, g, b, a = pixels[y, x]
    if a == 0:
        return False

    values = np.array([r, g, b], dtype=np.int16)
    brightness = values.mean()
    spread = values.max() - values.min()
    if brightness < 240 or spread > 22:
        return False

    bright_neighbors = 0
    transparent_neighbors = 0

    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            nx = x + dx
            ny = y + dy
            if ny < 0 or nx < 0 or ny >= mask.shape[0] or nx >= mask.shape[1]:
                continue
            if mask[ny, nx]:
                transparent_neighbors += 1
                continue

            nr, ng, nb, _ = pixels[ny, nx]
            neighbor_values = np.array([nr, ng, nb], dtype=np.int16)
            if neighbor_values.mean() >= 236 and (neighbor_values.max() - neighbor_values.min()) <= 26:
                bright_neighbors += 1

    return transparent_neighbors >= 1 and bright_neighbors >= 3


def trim_outline(pixels, mask):
    trimmed = mask.copy()
    changed = True

    while changed:
        changed = False
        to_trim = []
        height, width = trimmed.shape

        for y in range(height):
            for x in range(width):
                if trimmed[y, x]:
                    continue
                if should_trim_outline(pixels, x, y, trimmed):
                    to_trim.append((x, y))

        for x, y in to_trim:
            trimmed[y, x] = True
            changed = True

    return trimmed


def soften_edge(pixels, mask):
    height, width = mask.shape
    softened = pixels.copy()

    for y in range(height):
        for x in range(width):
            if mask[y, x]:
                softened[y, x, 3] = 0
                continue

            r, g, b, a = softened[y, x]
            values = np.array([r, g, b], dtype=np.int16)
            brightness = values.mean()
            spread = values.max() - values.min()

            if brightness < 216 or spread > 36:
                continue

            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                nx = x + dx
                ny = y + dy
                if 0 <= nx < width and 0 <= ny < height and mask[ny, nx]:
                    alpha = int(max(0, min(a, 255 - (brightness - 215) * 6)))
                    softened[y, x, 3] = alpha
                    break

    return softened


def process_image(path):
    image = Image.open(path).convert("RGBA")
    pixels = np.array(image)
    mask = build_mask(pixels)
    mask = trim_outline(pixels, mask)
    output_pixels = soften_edge(pixels, mask)
    output_path = path.with_name(f"{path.stem}-cut.png")
    Image.fromarray(output_pixels, "RGBA").save(output_path)
    return output_path.name


def main():
    for name in TARGETS:
        result = process_image(ROOT / name)
        print(result)


if __name__ == "__main__":
    main()
