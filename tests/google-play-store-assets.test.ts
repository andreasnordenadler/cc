import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const storeIconPath = path.resolve(
  "apps/mobile/store-assets/google-play/store-icon-512.png",
);
const featureGraphicPath = path.resolve(
  "apps/mobile/store-assets/google-play/feature-graphic-1024x500.png",
);

function crc32(bytes: Buffer) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function readPngHeader(
  bytes: Buffer,
  {
    asset = "store icon",
    channels = 4,
    expectedWidth = 512,
    expectedHeight = 512,
    expectedColorType = 6,
  }: {
    asset?: string;
    channels?: number;
    expectedWidth?: number;
    expectedHeight?: number;
    expectedColorType?: number;
  } = {},
) {
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    `${asset} must be a PNG`,
  );

  const chunks: Array<{ type: string; data: Buffer }> = [];
  let offset = 8;
  let reachedEnd = false;
  let reachedImageData = false;
  let endedImageData = false;

  while (offset < bytes.length) {
    assert.ok(offset + 12 <= bytes.length, `${asset} must be a complete PNG`);
    const length = bytes.readUInt32BE(offset);
    const chunkEnd = offset + 12 + length;
    assert.ok(chunkEnd <= bytes.length, `${asset} must be a complete PNG`);

    const typeBytes = bytes.subarray(offset + 4, offset + 8);
    assert.ok(
      [...typeBytes].every((byte) =>
        (byte >= 0x41 && byte <= 0x5a) || (byte >= 0x61 && byte <= 0x7a),
      ),
      `${asset} PNG has an invalid chunk type`,
    );
    assert.equal(typeBytes[2] & 0x20, 0, `${asset} PNG chunk reserved bit must be valid`);
    const type = typeBytes.toString("ascii");
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const expectedCrc = bytes.readUInt32BE(offset + 8 + length);
    assert.equal(
      crc32(Buffer.concat([typeBytes, data])),
      expectedCrc,
      `${asset} PNG ${type} chunk must have a valid CRC`,
    );
    if (type === "IHDR") {
      assert.equal(chunks.length, 0, `${asset} PNG IHDR must be first and unique`);
      assert.equal(length, 13, `${asset} PNG IHDR must be 13 bytes`);
    } else if (type === "IDAT") {
      assert.ok(!endedImageData, `${asset} PNG IDAT chunks must be contiguous`);
      reachedImageData = true;
    } else {
      if (reachedImageData) endedImageData = true;
      const isCritical = type[0] === type[0].toUpperCase();
      assert.ok(!isCritical || type === "IEND", `${asset} PNG has an unknown critical chunk`);
    }
    chunks.push({ type, data });
    offset = chunkEnd;

    if (type === "IEND") {
      assert.equal(length, 0, `${asset} PNG IEND chunk must be empty`);
      reachedEnd = true;
      break;
    }
  }

  assert.ok(reachedEnd && offset === bytes.length, `${asset} must be a complete PNG`);
  assert.equal(chunks[0]?.type, "IHDR");
  assert.ok(reachedImageData, `${asset} PNG must contain image data`);

  const headerBytes = chunks[0].data;
  const width = headerBytes.readUInt32BE(0);
  const height = headerBytes.readUInt32BE(4);
  const bitDepth = headerBytes[8];
  const colorType = headerBytes[9];
  assert.equal(width, expectedWidth, `${asset} PNG width must match the listing contract`);
  assert.equal(height, expectedHeight, `${asset} PNG height must match the listing contract`);
  assert.equal(bitDepth, 8, `${asset} PNG must use 8-bit channels`);
  assert.equal(colorType, expectedColorType, `${asset} PNG color type must match the listing contract`);
  assert.equal(headerBytes[10], 0, `${asset} PNG compression method must be valid`);
  assert.equal(headerBytes[11], 0, `${asset} PNG filter method must be valid`);
  assert.equal(headerBytes[12], 0, `${asset} PNG must be non-interlaced`);
  const rowLength = width * channels + 1;
  const expectedImageDataLength = height * rowLength;
  const imageData = inflateSync(
    Buffer.concat(chunks.filter(({ type }) => type === "IDAT").map(({ data }) => data)),
    { maxOutputLength: expectedImageDataLength },
  );

  assert.equal(
    imageData.length,
    expectedImageDataLength,
    `${asset} PNG must contain complete scanlines`,
  );
  for (let row = 0; row < height; row += 1) {
    assert.ok(imageData[row * rowLength] <= 4, `${asset} PNG has an invalid row filter`);
  }

  return {
    width,
    height,
    bitDepth,
    colorType,
  };
}

test("Google Play store icon is a compliant 512px 32-bit PNG", async () => {
  const [bytes, metadata] = await Promise.all([
    readFile(storeIconPath),
    stat(storeIconPath),
  ]);
  const header = readPngHeader(bytes);

  assert.deepEqual(header, {
    width: 512,
    height: 512,
    bitDepth: 8,
    colorType: 6,
  });
  assert.ok(metadata.size <= 1_048_576, "store icon must not exceed 1,024 KB");
});

test("Google Play store icon validation rejects a truncated PNG", async () => {
  const bytes = await readFile(storeIconPath);

  assert.throws(
    () => readPngHeader(bytes.subarray(0, 33)),
    /complete PNG/,
  );
});

test("Google Play feature graphic is a compliant 1024 by 500 no-alpha PNG", async () => {
  const bytes = await readFile(featureGraphicPath);
  const header = readPngHeader(bytes, {
    asset: "feature graphic",
    channels: 3,
    expectedWidth: 1_024,
    expectedHeight: 500,
    expectedColorType: 2,
  });

  assert.deepEqual(header, {
    width: 1_024,
    height: 500,
    bitDepth: 8,
    colorType: 2,
  });
});

test("Google Play feature graphic validation rejects a truncated PNG", async () => {
  const bytes = await readFile(featureGraphicPath);

  assert.throws(
    () => readPngHeader(bytes.subarray(0, 33), {
      asset: "feature graphic",
      channels: 3,
      expectedWidth: 1_024,
      expectedHeight: 500,
      expectedColorType: 2,
    }),
    /complete PNG/,
  );
});

test("Google Play feature graphic validation rejects an invalid compression method", async () => {
  const bytes = Buffer.from(await readFile(featureGraphicPath));
  bytes[26] = 1;
  bytes.writeUInt32BE(crc32(bytes.subarray(12, 29)), 29);

  assert.throws(
    () => readPngHeader(bytes, {
      asset: "feature graphic",
      channels: 3,
      expectedWidth: 1_024,
      expectedHeight: 500,
      expectedColorType: 2,
    }),
    /compression method/,
  );
});

test("Google Play feature graphic validation rejects high-bit chunk-name bytes", async () => {
  const bytes = Buffer.from(await readFile(featureGraphicPath));
  bytes[12] = 0xc9;
  bytes.writeUInt32BE(crc32(bytes.subarray(12, 29)), 29);

  assert.throws(
    () => readPngHeader(bytes, {
      asset: "feature graphic",
      channels: 3,
      expectedWidth: 1_024,
      expectedHeight: 500,
      expectedColorType: 2,
    }),
    /invalid chunk type/,
  );
});
