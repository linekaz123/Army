// Procedurally draws the BitePal mascot mark and encodes it as PNG using only
// Node's built-in zlib — no image dependencies required (keeps the stack 100% free).
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");
mkdirSync(OUT_DIR, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw, { level: 9 }));
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function drawIcon(size, { padded = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  // Maskable icons need content inside the safe zone (~80% of the canvas).
  const scale = padded ? 0.78 : 1;

  const bgTop = [249, 168, 212]; // Kooky pink
  const bgBottom = [236, 72, 153];
  const earColor = [251, 207, 232];
  const innerEarColor = [254, 243, 199]; // cream
  const cornerRadius = padded ? 0 : size * 0.22;

  const faceR = size * 0.29 * scale;
  const faceCx = cx;
  const faceCy = cy + size * 0.05 * scale;

  const eyeR = size * 0.03 * scale;
  const eyeDx = size * 0.1 * scale;
  const eyeDy = size * 0.025 * scale;

  const cheekR = size * 0.042 * scale;

  // Bunny ears: two tilted ellipses sitting above the head.
  const earRy = size * 0.21 * scale;
  const earRx = size * 0.095 * scale;
  const earCy = cy - size * 0.29 * scale;
  const earDx = size * 0.12 * scale;
  const earTilt = 0.22; // radians

  function inRotatedEllipse(px, py, ecx, ecy, rx, ry, angle) {
    const dx = px - ecx;
    const dy = py - ecy;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rxp = dx * cos + dy * sin;
    const ryp = -dx * sin + dy * cos;
    return (rxp * rxp) / (rx * rx) + (ryp * ryp) / (ry * ry) <= 1;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Rounded-rect background mask.
      let inside = true;
      if (cornerRadius > 0) {
        const nx = x < cornerRadius ? cornerRadius - x : x > size - cornerRadius ? x - (size - cornerRadius) : 0;
        const ny = y < cornerRadius ? cornerRadius - y : y > size - cornerRadius ? y - (size - cornerRadius) : 0;
        if (nx > 0 && ny > 0) {
          inside = nx * nx + ny * ny <= cornerRadius * cornerRadius;
        }
      }

      if (!inside) {
        rgba[i] = 0;
        rgba[i + 1] = 0;
        rgba[i + 2] = 0;
        rgba[i + 3] = 0;
        continue;
      }

      const t = y / size;
      let r = mix(bgTop[0], bgBottom[0], t);
      let g = mix(bgTop[1], bgBottom[1], t);
      let b = mix(bgTop[2], bgBottom[2], t);

      // Ears (drawn behind the head, only visible above the face circle).
      const leftEarOuter = inRotatedEllipse(x, y, cx - earDx, earCy, earRx, earRy, -earTilt);
      const rightEarOuter = inRotatedEllipse(x, y, cx + earDx, earCy, earRx, earRy, earTilt);
      const leftEarInner = inRotatedEllipse(x, y, cx - earDx, earCy + size * 0.02, earRx * 0.45, earRy * 0.6, -earTilt);
      const rightEarInner = inRotatedEllipse(x, y, cx + earDx, earCy + size * 0.02, earRx * 0.45, earRy * 0.6, earTilt);
      if (leftEarOuter || rightEarOuter) {
        if (leftEarInner || rightEarInner) {
          r = innerEarColor[0];
          g = innerEarColor[1];
          b = innerEarColor[2];
        } else {
          r = earColor[0];
          g = earColor[1];
          b = earColor[2];
        }
      }

      const dxFace = x - faceCx;
      const dyFace = y - faceCy;
      const distFace = Math.sqrt(dxFace * dxFace + dyFace * dyFace);

      if (distFace <= faceR) {
        // White blob face with a soft anti-aliased edge.
        const edge = faceR - distFace;
        const alpha = Math.min(1, edge / (size * 0.01));
        r = mix(r, 255, alpha);
        g = mix(g, 255, alpha);
        b = mix(b, 255, alpha);

        // Eyes
        const leftEyeDx = x - (faceCx - eyeDx);
        const leftEyeDy = y - (faceCy - eyeDy);
        const rightEyeDx = x - (faceCx + eyeDx);
        const rightEyeDy = y - (faceCy - eyeDy);
        const inLeftEye = leftEyeDx * leftEyeDx + leftEyeDy * leftEyeDy <= eyeR * eyeR;
        const inRightEye = rightEyeDx * rightEyeDx + rightEyeDy * rightEyeDy <= eyeR * eyeR;
        if (inLeftEye || inRightEye) {
          r = 22;
          g = 32;
          b = 26;
        }

        // Cheeks (blush)
        const leftCheekDx = x - (faceCx - eyeDx * 1.7);
        const leftCheekDy = y - (faceCy + eyeDy * 1.6);
        const rightCheekDx = x - (faceCx + eyeDx * 1.7);
        const rightCheekDy = y - (faceCy + eyeDy * 1.6);
        const inLeftCheek =
          leftCheekDx * leftCheekDx + leftCheekDy * leftCheekDy <= cheekR * cheekR;
        const inRightCheek =
          rightCheekDx * rightCheekDx + rightCheekDy * rightCheekDy <= cheekR * cheekR;
        if ((inLeftCheek || inRightCheek) && !inLeftEye && !inRightEye) {
          r = mix(r, 251, 0.55);
          g = mix(g, 146, 0.4);
          b = mix(b, 140, 0.45);
        }

        // Smile: lower arc band of a circle centered below the eyes.
        const mouthCx = faceCx;
        const mouthCy = faceCy + eyeDy * 0.4;
        const mouthR = size * 0.1 * scale;
        const dxMouth = x - mouthCx;
        const dyMouth = y - mouthCy;
        const distMouth = Math.sqrt(dxMouth * dxMouth + dyMouth * dyMouth);
        const thickness = size * 0.018 * scale;
        if (
          distMouth >= mouthR - thickness &&
          distMouth <= mouthR &&
          dyMouth > size * 0.01 * scale &&
          !inLeftEye &&
          !inRightEye
        ) {
          r = 22;
          g = 32;
          b = 26;
        }
      }

      rgba[i] = Math.round(r);
      rgba[i + 1] = Math.round(g);
      rgba[i + 2] = Math.round(b);
      rgba[i + 3] = 255;
    }
  }

  return rgba;
}

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "maskable-512.png", size: 512, padded: true },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  const rgba = drawIcon(t.size, { padded: t.padded });
  const png = encodePNG(t.size, t.size, rgba);
  writeFileSync(join(OUT_DIR, t.name), png);
  console.log(`wrote ${t.name} (${t.size}x${t.size}, ${png.length} bytes)`);
}
