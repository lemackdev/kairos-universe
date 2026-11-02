import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const version = "16.21.1";
const baseUrl = `https://ddragon.leagueoflegends.com/cdn/${version}`;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "website", "public", "champion-icons", version);
const manifestPath = path.join(outputDir, "manifest.json");
const verifyOnly = process.argv.includes("--verify");
const pngSignature = Buffer.from("89504e470d0a1a0a", "hex");

function inspectPng(bytes, filename) {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(pngSignature)) {
    throw new Error(`${filename} is not a valid PNG`);
  }
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

async function fetchBytes(url) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt === 3) throw new Error(`Could not fetch ${url}: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
}

async function readExisting(filename) {
  try {
    return await readFile(path.join(outputDir, filename));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function verify() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.version !== version || manifest.count !== manifest.icons.length) {
    throw new Error("Champion icon manifest version or count is invalid");
  }
  const filenames = new Set();
  for (const icon of manifest.icons) {
    if (!/^[A-Za-z0-9]+\.png$/.test(icon.file) || filenames.has(icon.file)) {
      throw new Error(`Invalid or duplicate icon filename: ${icon.file}`);
    }
    filenames.add(icon.file);
    const bytes = await readFile(path.join(outputDir, icon.file));
    const actual = inspectPng(bytes, icon.file);
    if (actual.sha256 !== icon.sha256 || actual.width !== icon.width || actual.height !== icon.height) {
      throw new Error(`Champion icon does not match manifest: ${icon.file}`);
    }
  }
  console.log(`Verified ${manifest.count} champion icons for Data Dragon ${version}.`);
}

async function download() {
  const metadataUrl = `${baseUrl}/data/en_US/champion.json`;
  const metadata = JSON.parse((await fetchBytes(metadataUrl)).toString("utf8"));
  if (metadata.version !== version) throw new Error(`Unexpected Data Dragon version: ${metadata.version}`);
  const champions = Object.values(metadata.data).sort((a, b) => a.id.localeCompare(b.id));
  const filenames = new Set();
  for (const champion of champions) {
    const filename = champion.image?.full;
    if (!/^[A-Za-z0-9]+\.png$/.test(filename) || filenames.has(filename)) {
      throw new Error(`Invalid or duplicate filename in Riot metadata: ${filename}`);
    }
    filenames.add(filename);
  }

  await mkdir(outputDir, { recursive: true });
  const icons = new Array(champions.length);
  let next = 0;
  let completed = 0;
  async function worker() {
    while (next < champions.length) {
      const index = next++;
      const champion = champions[index];
      const file = champion.image.full;
      const existing = await readExisting(file);
      const bytes = existing ?? await fetchBytes(`${baseUrl}/img/champion/${file}`);
      const details = inspectPng(bytes, file);
      if (!existing) {
        try {
          await writeFile(path.join(outputDir, file), bytes, { flag: "wx" });
        } catch (error) {
          if (error.code !== "EEXIST") throw error;
          const actual = inspectPng(await readFile(path.join(outputDir, file)), file);
          if (actual.sha256 !== details.sha256) throw new Error(`Existing file differs: ${file}`);
        }
      }
      icons[index] = { id: champion.id, name: champion.name, file, ...details };
      completed += 1;
      if (completed % 25 === 0 || completed === champions.length) {
        console.log(`Processed ${completed}/${champions.length} champion icons.`);
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, () => worker()));
  const manifest = {
    version,
    source: metadataUrl,
    count: icons.length,
    icons,
  };
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  try {
    await writeFile(manifestPath, serialized, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    if ((await readFile(manifestPath, "utf8")) !== serialized) {
      throw new Error("Existing manifest differs; refusing to overwrite it");
    }
  }
  await verify();
}

await (verifyOnly ? verify() : download());
