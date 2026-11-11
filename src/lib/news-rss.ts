import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_FEED_BYTES = 1_000_000;
const MAX_ITEMS_PER_FEED = 10;

export interface ImportedRssArticle {
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  authorName: string;
  source: string;
}

export interface RssFeedResult {
  feedUrl: string;
  articles: ImportedRssArticle[];
  rejectedMissingImage: number;
}

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [first, second, third] = octets;
  return !(
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && (second === 0 || second === 168)) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100))) ||
    (first === 203 && second === 0 && third === 113)
  );
}

function parseHttpsUrl(value: string, base?: string): URL | null {
  try {
    const url = base ? new URL(value, base) : new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    return url;
  } catch {
    return null;
  }
}

async function validateFeedUrl(value: string): Promise<URL> {
  const url = parseHttpsUrl(value);
  if (
    !url ||
    isIP(url.hostname) ||
    !url.hostname.includes(".") ||
    url.hostname.endsWith(".") ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".localhost") ||
    url.hostname.endsWith(".local") ||
    url.hostname.endsWith(".internal")
  ) {
    throw new Error("RSS feeds must use a public HTTPS hostname.");
  }

  const addresses = await lookup(url.hostname, { all: true, family: 4, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIpv4(address))) {
    throw new Error("RSS feed host must resolve only to public IPv4 addresses.");
  }
  return url;
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'");
}

function extractElement(block: string, names: string[]): string {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = block.match(
      new RegExp(
        `<(?:[\\w.-]+:)?${escaped}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${escaped}\\s*>`,
        "i"
      )
    );
    if (match) return match[1];
  }
  return "";
}

function extractLink(block: string, baseUrl: string): string | null {
  const tags = [...block.matchAll(/<(?:[\w.-]+:)?link\b([^>]*)\/?>/gi)];
  for (const tag of tags) {
    const attributes = tag[1];
    const href = attributes.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    const relation = attributes.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href && (!relation || relation === "alternate")) {
      const url = parseHttpsUrl(decodeXml(href), baseUrl);
      if (url) return url.href;
    }
  }

  const textLink = extractElement(block, ["link"]);
  const url = parseHttpsUrl(decodeXml(textLink.trim()), baseUrl);
  return url?.href ?? null;
}

function extractAttributeImage(block: string, baseUrl: string): string | null {
  const tags = /<(?:[\w.-]+:)?(?:enclosure|content|thumbnail)\b([^>]*)\/?>/gi;
  for (const match of block.matchAll(tags)) {
    const attributes = match[1];
    const urlValue = attributes.match(/\burl\s*=\s*["']([^"']+)["']/i)?.[1];
    const mediaType = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
    const medium = attributes.match(/\bmedium\s*=\s*["']([^"']+)["']/i)?.[1];
    const isThumbnail = /<(?:[\w.-]+:)?thumbnail\b/i.test(match[0]);
    const isMediaImage = /<media:content\b/i.test(match[0]) && medium?.toLowerCase() === "image";
    const hasImageExtension = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i.test(urlValue ?? "");
    if (!urlValue || !(mediaType?.toLowerCase().startsWith("image/") || isThumbnail || isMediaImage || hasImageExtension)) {
      continue;
    }
    const url = parseHttpsUrl(decodeXml(urlValue), baseUrl);
    if (url) return url.href;
  }

  const imageTag = block.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if (imageTag) {
    const url = parseHttpsUrl(decodeXml(imageTag), baseUrl);
    if (url) return url.href;
  }
  return null;
}

function toPlainText(value: string): string {
  return decodeXml(value)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength: number): string {
  const characters = Array.from(value);
  if (characters.length <= maxLength) return value;
  return `${characters.slice(0, maxLength - 1).join("").trimEnd()}…`;
}

async function readLimitedResponse(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let text = "";
  let bytesRead = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_FEED_BYTES) {
      await reader.cancel();
      throw new Error("RSS feed exceeded the 1 MB size limit.");
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function fetchRssFeed(value: string): Promise<RssFeedResult> {
  const feedUrl = await validateFeedUrl(value);
  const response = await fetch(feedUrl, {
    headers: {
      Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml",
      "User-Agent": "FGS-Software-NewsImporter/1.0",
    },
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`RSS feed responded with ${response.status}.`);
  const xml = await readLimitedResponse(response);
  const entries = [...xml.matchAll(/<(?:[\w.-]+:)?(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?(?:item|entry)\s*>/gi)]
    .slice(0, MAX_ITEMS_PER_FEED);
  const feedTitle = toPlainText(extractElement(xml, ["title"])) || feedUrl.hostname;
  const articles: ImportedRssArticle[] = [];
  let rejectedMissingImage = 0;

  for (const entry of entries) {
    const block = entry[1];
    const title = truncateText(toPlainText(extractElement(block, ["title"])), 200);
    const description = toPlainText(extractElement(block, ["description", "summary", "encoded", "content"]));
    const source = extractLink(block, feedUrl.href);
    const imageUrl = extractAttributeImage(block, feedUrl.href);
    if (!title || !description || !source) continue;
    if (!imageUrl) {
      rejectedMissingImage += 1;
      continue;
    }

    const summary = truncateText(description, 300);
    articles.push({
      title,
      summary,
      content: summary,
      imageUrl,
      authorName: truncateText(feedTitle, 100),
      source,
    });
  }

  return { feedUrl: feedUrl.href, articles, rejectedMissingImage };
}
