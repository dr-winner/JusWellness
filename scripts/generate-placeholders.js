/**
 * Generate placeholder product images as SVGs for local development.
 * Each product gets a beautiful gradient card with its name and an emoji.
 * These are served from /public/products/ until real Cloudinary images are uploaded.
 */

const fs = require("fs");
const path = require("path");

const products = [
  { id: "img-000", name: "Better Off Red", emoji: "❤️", gradient: ["#c0392b", "#e74c3c", "#922B21"] },
  { id: "img-001", name: "Takes Two to Mango", emoji: "🥭", gradient: ["#f39c12", "#e67e22", "#d35400"] },
  { id: "img-002", name: "Beach Body", emoji: "🏖️", gradient: ["#e74c3c", "#ff6b6b", "#ee5a6f"] },
  { id: "img-003", name: "Sun Kissed", emoji: "☀️", gradient: ["#f39c12", "#f1c40f", "#e67e22"] },
  { id: "img-004", name: "Lil Miss Sunshine", emoji: "🍊", gradient: ["#e67e22", "#f39c12", "#d35400"] },
  { id: "img-005", name: "Take Me Higher", emoji: "⬆️", gradient: ["#8e6d47", "#a0522d", "#6d4c30"] },
  { id: "img-006", name: "Heart of Gold", emoji: "💛", gradient: ["#f1c40f", "#f39c12", "#e8a838"] },
  { id: "img-007", name: "Ms Fit", emoji: "💪", gradient: ["#27ae60", "#2ecc71", "#1abc9c"] },
  { id: "img-008", name: "Lover's Rock", emoji: "💕", gradient: ["#c0392b", "#9b59b6", "#8e44ad"] },
  { id: "img-009", name: "Ginga Yourself", emoji: "🔥", gradient: ["#d35400", "#e67e22", "#f39c12"] },
  { id: "img-010", name: "Citrus Kick", emoji: "🍋", gradient: ["#f1c40f", "#e67e22", "#f39c12"] },
  { id: "img-011", name: "The Joy", emoji: "😊", gradient: ["#f1c40f", "#e74c3c", "#e67e22"] },
  { id: "img-012", name: "Rise & Shine", emoji: "🌅", gradient: ["#f39c12", "#27ae60", "#1abc9c"] },
  { id: "img-013", name: "Pineapple of My Eye", emoji: "🍍", gradient: ["#f1c40f", "#27ae60", "#f39c12"] },
  { id: "img-014", name: "Real Good", emoji: "✅", gradient: ["#c0392b", "#d35400", "#27ae60"] },
  { id: "img-015", name: "Something's Brewing?", emoji: "🤔", gradient: ["#2c3e50", "#34495e", "#7f8c8d"] },
  { id: "img-016", name: "Coconut Water", emoji: "🥥", gradient: ["#deb887", "#f5f5dc", "#8fbc8f"] },
  { id: "img-017", name: "Coconut + Chia", emoji: "🥥", gradient: ["#8fbc8f", "#deb887", "#2e8b57"] },
  { id: "img-018", name: "Coconut Mint Lime", emoji: "🌿", gradient: ["#2ecc71", "#1abc9c", "#27ae60"] },
  { id: "img-019", name: "Bougie Mashke", emoji: "👑", gradient: ["#8e44ad", "#9b59b6", "#e8a838"] },
  { id: "img-020", name: "Ginger Shot", emoji: "⚡", gradient: ["#d35400", "#e67e22", "#c0392b"] },
  { id: "img-021", name: "De-bloat Shot", emoji: "🧘", gradient: ["#27ae60", "#2ecc71", "#1abc9c"] },
];

const outputDir = path.join(__dirname, "..", "public", "products");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const product of products) {
  const [c1, c2, c3] = product.gradient;
  const textColor = "#fff";

  // Escape special XML characters in name
  const safeName = product.name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="50%" style="stop-color:${c2}"/>
      <stop offset="100%" style="stop-color:${c3}"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="30%" r="60%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.15)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" rx="40" fill="url(#bg)"/>
  <rect width="800" height="800" rx="40" fill="url(#glow)"/>
  <text x="400" y="340" text-anchor="middle" font-size="120" fill="${textColor}">${product.emoji}</text>
  <text x="400" y="450" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="700" fill="${textColor}">${safeName}</text>
  <text x="400" y="500" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="rgba(255,255,255,0.6)">Jus Wellness</text>
  <rect x="320" y="520" width="160" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
</svg>`;

  const filePath = path.join(outputDir, `${product.id}.svg`);
  fs.writeFileSync(filePath, svg);
}

console.log(`✅ Generated ${products.length} product images in ${outputDir}`);
