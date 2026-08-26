import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const mobileRoot = path.resolve("apps/mobile");
const appConfigPath = path.join(mobileRoot, "app.json");
const foregroundPath = path.join(mobileRoot, "assets/app-icon-foreground.png");
const legacyIconPath = path.join(mobileRoot, "assets/app-icon-light-blue.png");
const publicForegroundPath = path.resolve("public/mobile-source/app-icon-foreground.png");
const publicLegacyIconPath = path.resolve("public/mobile-source/app-icon-light-blue.png");
const background = [0x9e, 0xd8, 0xff] as const;
const adaptiveLayerSize = 108;
const guaranteedSafeZoneSize = 66;
const iconAssetSize = 1024;
const safeZoneSize = (iconAssetSize * guaranteedSafeZoneSize) / adaptiveLayerSize;

function paeth(left: number, up: number, upperLeft: number) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  return upDistance <= upperLeftDistance ? up : upperLeft;
}

function decodeRgbaPng(bytes: Buffer) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const imageData: Buffer[] = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8, "icon must use 8-bit channels");
      colorType = data[9];
      assert.ok(colorType === 2 || colorType === 6, "icon must be RGB or RGBA");
      assert.equal(data[12], 0, "icon must be non-interlaced");
    }
    if (type === "IDAT") imageData.push(data);
    offset += 12 + length;
    if (type === "IEND") break;
  }
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const encoded = inflateSync(Buffer.concat(imageData));
  const decoded = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y += 1) {
    const filter = encoded[y * (stride + 1)];
    for (let x = 0; x < stride; x += 1) {
      const source = encoded[y * (stride + 1) + 1 + x];
      const target = y * stride + x;
      const left = x >= channels ? decoded[target - channels] : 0;
      const up = y > 0 ? decoded[target - stride] : 0;
      const upperLeft = y > 0 && x >= channels ? decoded[target - stride - channels] : 0;
      if (filter === 0) decoded[target] = source;
      else if (filter === 1) decoded[target] = (source + left) & 0xff;
      else if (filter === 2) decoded[target] = (source + up) & 0xff;
      else if (filter === 3) decoded[target] = (source + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) decoded[target] = (source + paeth(left, up, upperLeft)) & 0xff;
      else assert.fail(`unsupported PNG filter ${filter}`);
    }
  }
  if (channels === 4) return { width, height, pixels: decoded };
  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    rgba[pixel * 4] = decoded[pixel * 3];
    rgba[pixel * 4 + 1] = decoded[pixel * 3 + 1];
    rgba[pixel * 4 + 2] = decoded[pixel * 3 + 2];
    rgba[pixel * 4 + 3] = 255;
  }
  return { width, height, pixels: rgba };
}

function assertAppStoreIconIsOpaqueRgbPng(bytes: Buffer) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR");
  assert.equal(bytes[25], 2, "App Store icon must not contain an alpha channel");
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    assert.ok(offset + 12 + length <= bytes.length, "App Store icon must be a complete PNG");
    const expectedCrc = bytes.readUInt32BE(offset + 8 + length);
    const actualCrc = pngCrc32(bytes.subarray(offset + 4, offset + 8 + length));
    assert.equal(actualCrc, expectedCrc, "App Store icon contains a PNG chunk with an invalid CRC");
    assert.notEqual(type, "tRNS", "App Store icon must not contain a transparency chunk");
    offset += 12 + length;
    if (type === "IEND") {
      assert.equal(offset, bytes.length, "App Store icon must end exactly at the IEND chunk");
      return;
    }
  }
  assert.fail("App Store icon must contain an IEND chunk");
}

function pngCrc32(bytes: Buffer) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunkFixture(type: string, data = Buffer.alloc(0)) {
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, "ascii");
  data.copy(chunk, 8);
  chunk.writeUInt32BE(pngCrc32(chunk.subarray(4, 8 + data.length)), 8 + data.length);
  return chunk;
}

function rgbPngChunkFixture(...additionalChunks: Buffer[]) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0);
  header.writeUInt32BE(1, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunkFixture("IHDR", header),
    ...additionalChunks,
    pngChunkFixture("IEND"),
  ]);
}

function effectiveAppStoreIcon(config: { expo: { icon: string; ios?: { icon?: string } } }) {
  return config.expo.ios?.icon ?? config.expo.icon;
}

function contentBounds(
  image: ReturnType<typeof decodeRgbaPng>,
  isContent: (red: number, green: number, blue: number, alpha: number) => boolean,
) {
  let left = image.width;
  let top = image.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      if (!isContent(image.pixels[offset], image.pixels[offset + 1], image.pixels[offset + 2], image.pixels[offset + 3])) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  assert.ok(right >= left && bottom >= top, "icon must contain visible artwork");
  return { left, top, right: right + 1, bottom: bottom + 1, width: right - left + 1, height: bottom - top + 1 };
}

function assertFitsLauncherSafeZone(bounds: ReturnType<typeof contentBounds>, asset: string) {
  const maximumContentSize = Math.floor(safeZoneSize);
  const minimumInset = Math.ceil((iconAssetSize - safeZoneSize) / 2);
  assert.ok(bounds.width <= maximumContentSize, `${asset} artwork width ${bounds.width}px exceeds the ${maximumContentSize}px launcher safe zone`);
  assert.ok(bounds.height <= maximumContentSize, `${asset} artwork height ${bounds.height}px exceeds the ${maximumContentSize}px launcher safe zone`);
  assert.ok(bounds.left >= minimumInset, `${asset} artwork is too close to the left mask edge`);
  assert.ok(bounds.top >= minimumInset, `${asset} artwork is too close to the top mask edge`);
  assert.ok(bounds.right <= iconAssetSize - minimumInset, `${asset} artwork is too close to the right mask edge`);
  assert.ok(bounds.bottom <= iconAssetSize - minimumInset, `${asset} artwork is too close to the bottom mask edge`);
}

function assertFitsCircularSafeZone(
  image: ReturnType<typeof decodeRgbaPng>,
  isContent: (red: number, green: number, blue: number, alpha: number) => boolean,
  asset: string,
) {
  const center = iconAssetSize / 2;
  let maximumRadius = 0;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      if (!isContent(image.pixels[offset], image.pixels[offset + 1], image.pixels[offset + 2], image.pixels[offset + 3])) continue;
      maximumRadius = Math.max(
        maximumRadius,
        Math.hypot(x - center, y - center),
        Math.hypot(x + 1 - center, y - center),
        Math.hypot(x - center, y + 1 - center),
        Math.hypot(x + 1 - center, y + 1 - center),
      );
    }
  }
  assert.ok(
    maximumRadius <= safeZoneSize / 2,
    `${asset} artwork radius ${maximumRadius.toFixed(2)}px exceeds the ${(safeZoneSize / 2).toFixed(2)}px circular launcher safe zone`,
  );
}

test("Android launcher artwork stays inside the adaptive-icon safe zone", async () => {
  const appConfig = JSON.parse(await readFile(appConfigPath, "utf8"));
  assert.equal(appConfig.expo.android.adaptiveIcon.foregroundImage, "./assets/app-icon-foreground.png");
  assert.equal(appConfig.expo.android.adaptiveIcon.backgroundColor, "#9ED8FF");

  const foreground = decodeRgbaPng(await readFile(foregroundPath));
  assert.deepEqual([foreground.width, foreground.height], [1024, 1024]);
  const foregroundBounds = contentBounds(foreground, (_red, _green, _blue, alpha) => alpha > 8);
  assertFitsLauncherSafeZone(foregroundBounds, "adaptive foreground");
  assertFitsCircularSafeZone(foreground, (_red, _green, _blue, alpha) => alpha > 8, "adaptive foreground");
});

test("App Store icon validator rejects PNG alpha channels", async () => {
  const rgbaIcon = await readFile(foregroundPath);
  assert.throws(
    () => assertAppStoreIconIsOpaqueRgbPng(rgbaIcon),
    /App Store icon must not contain an alpha channel/,
  );
});

test("App Store icon validator rejects RGB PNG transparency chunks", () => {
  const transparentRgbIcon = rgbPngChunkFixture(pngChunkFixture("tRNS", Buffer.from([0, 0, 0, 0, 0, 0])));
  assert.throws(
    () => assertAppStoreIconIsOpaqueRgbPng(transparentRgbIcon),
    /App Store icon must not contain a transparency chunk/,
  );
});

test("App Store icon validator rejects content after the PNG end marker", () => {
  const iconWithTrailingContent = Buffer.concat([rgbPngChunkFixture(), Buffer.from("unexpected")]);
  assert.throws(
    () => assertAppStoreIconIsOpaqueRgbPng(iconWithTrailingContent),
    /App Store icon must end exactly at the IEND chunk/,
  );
});

test("App Store icon validator rejects corrupted PNG chunks", () => {
  const corruptedIcon = rgbPngChunkFixture();
  corruptedIcon[20] ^= 1;
  assert.throws(
    () => assertAppStoreIconIsOpaqueRgbPng(corruptedIcon),
    /App Store icon contains a PNG chunk with an invalid CRC/,
  );
});

test("App Store icon contract follows an iOS-specific icon override", () => {
  assert.equal(
    effectiveAppStoreIcon({ expo: { icon: "./shared.png", ios: { icon: "./ios.png" } } }),
    "./ios.png",
  );
});

test("legacy launcher icon keeps the complete coat of arms away from mask edges", async () => {
  const appConfig = JSON.parse(await readFile(appConfigPath, "utf8"));
  const configuredIcon = effectiveAppStoreIcon(appConfig);
  assert.equal(configuredIcon, "./assets/app-icon-light-blue.png");

  const iconBytes = await readFile(path.resolve(mobileRoot, configuredIcon));
  assertAppStoreIconIsOpaqueRgbPng(iconBytes);
  const icon = decodeRgbaPng(iconBytes);
  assert.deepEqual([icon.width, icon.height], [1024, 1024]);
  const artworkBounds = contentBounds(icon, (red, green, blue, alpha) =>
    alpha > 8 && Math.max(Math.abs(red - background[0]), Math.abs(green - background[1]), Math.abs(blue - background[2])) > 12,
  );
  assertFitsLauncherSafeZone(artworkBounds, "legacy icon");
  assertFitsCircularSafeZone(
    icon,
    (red, green, blue, alpha) =>
      alpha > 8 && Math.max(Math.abs(red - background[0]), Math.abs(green - background[1]), Math.abs(blue - background[2])) > 12,
    "legacy icon",
  );
});

test("public mobile-source launcher icons mirror the packaged assets", async () => {
  assert.deepEqual(await readFile(publicForegroundPath), await readFile(foregroundPath));
  assert.deepEqual(await readFile(publicLegacyIconPath), await readFile(legacyIconPath));
});
