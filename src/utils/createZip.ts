import * as Minizip from 'minizip-asm.js';

const zip = new Minizip();

export function createZipBuffer(
  files: { name: string; buffer: Buffer }[],
): Buffer {
  const password = process.env.FILES_PASSWORD;

  files.forEach((file) => {
    zip.append(file.name, file.buffer, password && { password });
  });

  return zip.zip();
}
