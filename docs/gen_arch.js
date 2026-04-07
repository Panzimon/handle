const fs = require('fs');
const path = require('path');

// ── 画布 ──────────────────────────────────────────────────────────────────────
const W = 1400, H = 900;

// ── 字体大小 & 行高 ───────────────────────────────────────────────────────────
const F_TITLE  = 26;
const F_LAYER  = 16;
const F_NAME   = 14;
const F_DESC   = 13;
const F_SUB    = 12;
const F_FOOTER = 12;

// SVG text 的 dominant-baseline="hanging" 让 y 坐标代表文字顶部，排版更直观

// ── 数据 ──────────────────────────────────────────────────────────────────────
const layers = [
  {
    label: '① Data Layer',
    bg: '#e8f4fc', border: '#7ab8d8', lc: '#1e64a0',
    items: [
      { name: 'words.ts',   desc: '成语词库',   subs: [] },
      { name: 'pinyin.ts',  desc: '拼音处理',   subs: ['声母 / 韵母 / 声调'] },
      { name: 'types.ts',   desc: '类型定义',   subs: ['CellData', 'GameState', 'HintUsage'] },
    ]
  },
  {
    label: '② Core Logic',
    bg: '#f0e8fc', border: '#a07acc', lc: '#5a32a0',
    items: [
      { name: 'useGame.ts', desc: '核心状态管理 (Hook)', subs: [
        'grid 状态',
        'currentInput',
        'gameState（playing / won / lost）',
        'Timer 计时器',
        '提示系统（HintUsage）',
        'playAgain / changeWord',
      ]},
    ]
  },
  {
    label: '③ UI Components',
    bg: '#e8f8ee', border: '#5ab87a', lc: '#1e7850',
    items: [
      { name: 'App.tsx',       desc: '页面主入口',       subs: ['输入处理', '动画控制', '状态组织'] },
      { name: 'Cell.tsx',      desc: '单元格 + 拼音反馈', subs: [] },
      { name: 'Keyboard.tsx',  desc: '虚拟键盘',         subs: [] },
      { name: 'Toast.tsx',     desc: '消息提示',         subs: [] },
    ]
  },
  {
    label: '④ Utilities',
    bg: '#fff3e0', border: '#d09050', lc: '#904010',
    items: [
      { name: 'utils/share.ts',      desc: '文字分享', subs: ['生成分享文本', '复制到剪贴板'] },
      { name: 'utils/imageShare.ts', desc: '图片分享', subs: ['html-to-image', 'html2canvas'] },
    ]
  },
];

// ── 布局常量 ──────────────────────────────────────────────────────────────────
const TITLE_Y   = 28;          // 标题顶部 y
const TITLE_H   = 60;          // 标题区域高度（含分割线）
const BOX_TOP   = TITLE_H + 10;// 层盒子顶部 y
const BOX_H     = H - BOX_TOP - 40; // 层盒子高度
const N_LAYERS  = layers.length;
const TOTAL_GAP = 26 * (N_LAYERS - 1);
const BOX_W     = Math.floor((W - 80 - TOTAL_GAP) / N_LAYERS);
const BOX_X0    = 40;          // 第一个盒子 x

const LABEL_PADDING_TOP = 18;  // 层标签距盒子顶部
const DIVIDER_OFFSET    = 48;  // 分割线距盒子顶部
const CONTENT_TOP       = 58;  // 内容区距盒子顶部

// 每个条目的行高参数
const ITEM_BOX_H    = 30;      // 白色方块高度
const ITEM_NAME_DY  = 9;       // item name 在白块内的 top offset（让文字垂直居中）
const ITEM_DESC_MT  = 4;       // desc 距白块底部的 margin
const SUB_LINE_H    = 17;      // sub 行高
const ITEM_GAP      = 12;      // 条目之间的额外间距

// ── 计算各层 items 总占高，取最大值校验是否放得下 ──────────────────────────────
function itemsHeight(items) {
  let h = 0;
  for (const item of items) {
    h += ITEM_BOX_H;
    h += ITEM_DESC_MT + F_DESC + 2;
    h += (item.subs.length) * SUB_LINE_H;
    h += ITEM_GAP;
  }
  return h;
}

// ── SVG builder ───────────────────────────────────────────────────────────────
let parts = [];

parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
parts.push(`<defs>
  <style>
    .font-base { font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif; }
  </style>
  <filter id="sh">
    <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#00000018"/>
  </filter>
</defs>`);

// BG
parts.push(`<rect width="${W}" height="${H}" fill="#f8f9fa"/>`);

// Title
const titleX = W / 2;
const titleY = TITLE_Y;
parts.push(`<text x="${titleX}" y="${titleY}" dominant-baseline="hanging" text-anchor="middle"
  class="font-base" font-size="${F_TITLE}" font-weight="bold" fill="#282830"
>Handle  —  Architecture Overview</text>`);
parts.push(`<line x1="60" y1="${TITLE_Y + F_TITLE + 14}" x2="${W - 60}" y2="${TITLE_Y + F_TITLE + 14}" stroke="#d2d7e1" stroke-width="1"/>`);

// Arrow defs
for (let i = 0; i < N_LAYERS - 1; i++) {
  parts.push(`<defs><marker id="arr${i}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#c0c8d8"/>
  </marker></defs>`);
}

// Layers
const layerXArr = [];
layers.forEach((layer, i) => {
  const lx = BOX_X0 + i * (BOX_W + 26);
  layerXArr.push(lx);

  // Layer box
  parts.push(`<rect x="${lx}" y="${BOX_TOP}" width="${BOX_W}" height="${BOX_H}" rx="16"
    fill="${layer.bg}" stroke="${layer.border}" stroke-width="2" filter="url(#sh)"/>`);

  // Layer label
  const labelY = BOX_TOP + LABEL_PADDING_TOP;
  parts.push(`<text x="${lx + BOX_W / 2}" y="${labelY}" dominant-baseline="hanging" text-anchor="middle"
    class="font-base" font-size="${F_LAYER}" font-weight="bold" fill="${layer.lc}"
  >${layer.label}</text>`);

  // Divider
  const divY = BOX_TOP + DIVIDER_OFFSET;
  parts.push(`<line x1="${lx + 16}" y1="${divY}" x2="${lx + BOX_W - 16}" y2="${divY}" stroke="${layer.border}" stroke-width="1"/>`);

  // Items
  let curY = BOX_TOP + CONTENT_TOP;
  const PAD = 14;  // 左右 padding

  for (const item of layer.items) {
    const bx = lx + PAD;
    const bw = BOX_W - PAD * 2;

    // White item box
    parts.push(`<rect x="${bx}" y="${curY}" width="${bw}" height="${ITEM_BOX_H}" rx="7"
      fill="white" stroke="${layer.border}" stroke-width="1.5"/>`);

    // Item name — vertically centered in the box
    const nameY = curY + ITEM_NAME_DY;
    parts.push(`<text x="${bx + 10}" y="${nameY}" dominant-baseline="hanging"
      class="font-base" font-size="${F_NAME}" font-weight="bold" fill="#1a1a28"
    >${item.name}</text>`);

    curY += ITEM_BOX_H + ITEM_DESC_MT;

    // Desc
    parts.push(`<text x="${bx + 10}" y="${curY}" dominant-baseline="hanging"
      class="font-base" font-size="${F_DESC}" fill="#606878"
    >${item.desc}</text>`);
    curY += F_DESC + 4;

    // Subs
    for (const s of item.subs) {
      parts.push(`<text x="${bx + 18}" y="${curY}" dominant-baseline="hanging"
        class="font-base" font-size="${F_SUB}" fill="#8a9298"
      >· ${s}</text>`);
      curY += SUB_LINE_H;
    }

    curY += ITEM_GAP;
  }
});

// Arrows
for (let i = 0; i < N_LAYERS - 1; i++) {
  const x1 = layerXArr[i] + BOX_W;
  const x2 = layerXArr[i + 1];
  const my = BOX_TOP + BOX_H / 2;
  parts.push(`<line x1="${x1}" y1="${my}" x2="${x2 - 2}" y2="${my}"
    stroke="#c0c8d8" stroke-width="3" marker-end="url(#arr${i})"/>`);
}

// Footer
parts.push(`<text x="${W / 2}" y="${H - 14}" dominant-baseline="auto" text-anchor="middle"
  class="font-base" font-size="${F_FOOTER}" fill="#a0a8b8"
>Vite 构建  |  React 18  |  TypeScript  |  Jest 测试覆盖</text>`);

parts.push(`</svg>`);

// ── Write ─────────────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'architecture.svg');
fs.writeFileSync(outPath, parts.join('\n'), 'utf-8');
console.log('Saved:', outPath);
