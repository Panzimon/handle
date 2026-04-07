#!/usr/bin/env python3
"""Generate architecture.png for the Handle project."""

import sys
import os

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL not found, installing...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "Pillow"], check=True)
    from PIL import Image, ImageDraw, ImageFont

# ── Canvas ────────────────────────────────────────────────────────────────────
W, H = 1400, 860
bg = (248, 249, 250)
img = Image.new("RGB", (W, H), bg)
draw = ImageDraw.Draw(img)

# ── Fonts ─────────────────────────────────────────────────────────────────────
def load_font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

font_title  = load_font(28, bold=True)
font_layer  = load_font(17, bold=True)
font_item   = load_font(15)
font_sub    = load_font(13)

# ── Helper ────────────────────────────────────────────────────────────────────
def rect(x, y, w, h, fill, radius=14, border=None):
    draw.rounded_rectangle([x, y, x+w, y+h], radius=radius,
                           fill=fill, outline=border or fill, width=2)

def text_centered(txt, cx, y, font, color=(50, 50, 60)):
    bb = draw.textbbox((0, 0), txt, font=font)
    tw = bb[2] - bb[0]
    draw.text((cx - tw//2, y), txt, font=font, fill=color)

def text_left(txt, x, y, font, color=(60, 65, 80)):
    draw.text((x, y), txt, font=font, fill=color)

def arrow(x1, y1, x2, y2, color=(160, 160, 180), width=2):
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
    # arrowhead
    import math
    angle = math.atan2(y2-y1, x2-x1)
    size = 9
    for da in [0.45, -0.45]:
        ax = x2 - size * math.cos(angle - da)
        ay = y2 - size * math.sin(angle - da)
        draw.line([(x2, y2), (ax, ay)], fill=color, width=width)

# ── Title ─────────────────────────────────────────────────────────────────────
text_centered("Handle  —  Architecture Overview", W//2, 28, font_title, (40, 40, 50))
draw.line([(60, 68), (W-60, 68)], fill=(210, 215, 225), width=1)

# ── Layer definitions ─────────────────────────────────────────────────────────
# Each layer: (x, label, bg_color, border_color, items)
TOP = 90
LH  = 680   # layer box height
LW  = 265   # layer box width
GAP = 28    # gap between layers

layers = [
    {
        "x": 40,
        "label": "① Data Layer",
        "bg":     (232, 244, 252),
        "border": (150, 200, 230),
        "label_color": (30, 100, 160),
        "items": [
            ("words.ts", "成语词库", None),
            ("pinyin.ts", "拼音处理", ["声母 / 韵母 / 声调"]),
            ("types.ts",  "类型定义", ["CellData", "GameState", "HintUsage"]),
        ]
    },
    {
        "x": 40 + LW + GAP,
        "label": "② Core Logic",
        "bg":     (240, 232, 252),
        "border": (170, 140, 220),
        "label_color": (90, 50, 160),
        "items": [
            ("useGame.ts", "核心状态管理 (React Hook)", [
                "grid 状态",
                "currentInput",
                "gameState (playing/won/lost)",
                "Timer 计时器",
                "提示系统 (HintUsage)",
                "playAgain / changeWord",
            ]),
        ]
    },
    {
        "x": 40 + (LW + GAP)*2,
        "label": "③ UI Components",
        "bg":     (232, 248, 238),
        "border": (120, 200, 150),
        "label_color": (30, 130, 80),
        "items": [
            ("App.tsx",      "页面主入口", ["输入处理", "动画控制", "状态组织"]),
            ("Cell.tsx",     "单元格 + 拼音反馈", None),
            ("Keyboard.tsx", "虚拟键盘", None),
            ("Toast.tsx",    "消息提示", None),
        ]
    },
    {
        "x": 40 + (LW + GAP)*3,
        "label": "④ Utilities",
        "bg":     (255, 243, 224),
        "border": (220, 170, 100),
        "label_color": (160, 90, 20),
        "items": [
            ("utils/share.ts",      "文字分享", ["生成分享文本", "复制到剪贴板"]),
            ("utils/imageShare.ts", "图片分享", ["html-to-image", "html2canvas"]),
        ]
    },
]

layer_centers = []

for layer in layers:
    lx = layer["x"]
    rect(lx, TOP, LW, LH, layer["bg"], radius=16, border=layer["border"])
    text_centered(layer["label"], lx + LW//2, TOP + 14, font_layer, layer["label_color"])
    draw.line([(lx+16, TOP+46), (lx+LW-16, TOP+46)], fill=layer["border"], width=1)
    layer_centers.append(lx + LW)

    iy = TOP + 58
    for (name, desc, subs) in layer["items"]:
        # item box
        rect(lx+12, iy, LW-24, 24, (255,255,255,200), radius=6, border=layer["border"])
        text_left(f"  {name}", lx+14, iy+4, font_item, (40,40,50))
        iy += 28
        text_left(f"    {desc}", lx+14, iy, font_sub, (100,110,120))
        iy += 18
        if subs:
            for s in subs:
                text_left(f"      · {s}", lx+14, iy, font_sub, (130,140,150))
                iy += 16
        iy += 8

# ── Arrows between layers ─────────────────────────────────────────────────────
arrow_color = (170, 175, 200)
for i in range(len(layers) - 1):
    x1 = layers[i]["x"] + LW
    x2 = layers[i+1]["x"]
    mid_y = TOP + LH//2
    arrow(x1, mid_y, x2, mid_y, color=arrow_color, width=3)

# ── Footer note ───────────────────────────────────────────────────────────────
note = "Vite 构建  |  React 18  |  TypeScript  |  Jest 测试覆盖"
text_centered(note, W//2, H-34, font_sub, (150, 155, 170))

# ── Save ──────────────────────────────────────────────────────────────────────
out = os.path.join(os.path.dirname(__file__), "architecture.png")
img.save(out, "PNG")
print(f"Saved: {out}")
