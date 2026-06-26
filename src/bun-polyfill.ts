import fs from "node:fs/promises";

export function file(path: string) {
  return {
    exists: () => fs.access(path).then(() => true).catch(() => false),
    arrayBuffer: async () => {
      const buf = await fs.readFile(path);
      return buf.buffer;
    },
    write: (data: Buffer | string) => fs.writeFile(path, data)
  };
}
