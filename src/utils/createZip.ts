import * as Minizip from 'minizip-asm.js';

export function createZipBuffer(
  files: { name: string; buffer: Buffer }[],
): Buffer {
  const password = process.env.FILES_PASSWORD;
  const zip = new Minizip();

  files.forEach((file) => {
    zip.append(file.name, file.buffer, password && { password });
  });

  return zip.zip();
}
