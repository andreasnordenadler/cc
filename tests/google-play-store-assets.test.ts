import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const storeIconPath = path.resolve(
  "apps/mobile/store-assets/google-play/store-icon-512.png",
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

function readPngHeader(bytes: Buffer) {
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    "store icon must be a PNG",
  );

  const chunks: Array<{ type: string; data: Buffer }> = [];
  let offset = 8;
  let reachedEnd = false;

  while (offset < bytes.length) {
    assert.ok(offset + 12 <= bytes.length, "store icon must be a complete PNG");
    const length = bytes.readUInt32BE(offset);
    const chunkEnd = offset + 12 + length;
    assert.ok(chunkEnd <= bytes.length, "store icon must be a complete PNG");

    const typeBytes = bytes.subarray(offset + 4, offset + 8);
    const type = typeBytes.toString("ascii");
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const expectedCrc = bytes.readUInt32BE(offset + 8 + length);
    assert.equal(
      crc32(Buffer.concat([typeBytes, data])),
      expectedCrc,
      `store icon PNG ${type} chunk must have a valid CRC`,
    );
    chunks.push({ type, data });
    offset = chunkEnd;

    if (type === "IEND") {
      assert.equal(length, 0, "store icon PNG IEND chunk must be empty");
      reachedEnd = true;
      break;
    }
  }

  assert.ok(reachedEnd && offset === bytes.length, "store icon must be a complete PNG");
  assert.equal(chunks[0]?.type, "IHDR");

  const headerBytes = chunks[0].data;
  const width = headerBytes.readUInt32BE(0);
  const height = headerBytes.readUInt32BE(4);
  const bitDepth = headerBytes[8];
  const colorType = headerBytes[9];
  const imageData = inflateSync(
    Buffer.concat(chunks.filter(({ type }) => type === "IDAT").map(({ data }) => data)),
  );
  const rowLength = width * 4 + 1;

  assert.equal(
    imageData.length,
    height * rowLength,
    "store icon PNG must contain complete RGBA scanlines",
  );
  for (let row = 0; row < height; row += 1) {
    assert.ok(imageData[row * rowLength] <= 4, "store icon PNG has an invalid row filter");
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
