/**
 * File-based content system for scam prevention guides.
 *
 * Guides live in content/guides/*.md with YAML front matter. They are read at
 * build time only, so no database or CMS is needed. Front matter is validated
 * strictly: a guide with a missing field, a bad date or an unknown source id
 * fails the build instead of publishing something broken.
 */

import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { getSource, type Source } from "@/data/sources";
import { TOOLS, type ToolId } from "@/lib/site";
import { slugify } from "./slugify";

export interface GuideHeading {
  id: string;
  text: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  summary: string;
  category: string;
  published: string;
  updated: string;
  relatedTools: ToolId[];
  relatedGuides: string[];
  sources: Source[];
  body: string;
  headings: GuideHeading[];
  readingMinutes: number;
}

export const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOOL_IDS = new Set<string>(TOOLS.map((tool) => tool.id));

function fail(file: string, message: string): never {
  throw new Error(`Invalid guide ${file}: ${message}`);
}

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim().length === 0) fail(file, `"${key}" must be a non-empty string`);
  return value.trim();
}

function requireDate(data: Record<string, unknown>, key: string, file: string): string {
  const raw = data[key];
  const value = raw instanceof Date ? raw.toISOString().slice(0, 10) : raw;
  if (typeof value !== "string" || !DATE.test(value) || Number.isNaN(Date.parse(value))) {
    fail(file, `"${key}" must be a date in YYYY-MM-DD format`);
  }
  return value;
}

function stringList(data: Record<string, unknown>, key: string, file: string): string[] {
  const value = data[key] ?? [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(file, `"${key}" must be a list of strings`);
  }
  return value as string[];
}

export function parseGuide(file: string, raw: string): Guide {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) fail(file, "missing front matter block");
  const data = parse(match[1]!) as Record<string, unknown> | null;
  if (!data || typeof data !== "object") fail(file, "front matter is empty");
  const body = match[2]!.trim();

  const slug = file.replace(/\.md$/, "");
  if (!SLUG.test(slug)) fail(file, "file name must be a lowercase slug");

  const description = requireString(data, "description", file);
  if (description.length < 70 || description.length > 170) {
    fail(file, `"description" should be 70-170 characters (currently ${description.length})`);
  }

  const relatedTools = stringList(data, "relatedTools", file);
  for (const tool of relatedTools) if (!TOOL_IDS.has(tool)) fail(file, `unknown tool "${tool}"`);

  const sources = stringList(data, "sources", file).map((id) => getSource(id) ?? fail(file, `unknown source id "${id}"`));
  if (sources.length === 0) fail(file, "at least one source is required");

  const published = requireDate(data, "published", file);
  const updated = requireDate(data, "updated", file);
  if (updated < published) fail(file, '"updated" cannot be earlier than "published"');

  if (/^#\s/m.test(body)) fail(file, "body must not contain a level-1 heading (the title is the page's h1)");

  const headings = Array.from(body.matchAll(/^##\s+(.+?)\s*$/gm), (heading) => ({
    id: slugify(heading[1]!),
    text: heading[1]!.replace(/[*_`]/g, ""),
  }));
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: requireString(data, "title", file),
    description,
    summary: requireString(data, "summary", file),
    category: requireString(data, "category", file),
    published,
    updated,
    relatedTools: relatedTools as ToolId[],
    relatedGuides: stringList(data, "relatedGuides", file),
    sources,
    body,
    headings,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

let cache: Guide[] | null = null;

/** All guides, newest first. */
export function getAllGuides(): Guide[] {
  if (cache) return cache;
  const files = fs.readdirSync(GUIDES_DIR).filter((file) => file.endsWith(".md"));
  const guides = files.map((file) => parseGuide(file, fs.readFileSync(path.join(GUIDES_DIR, file), "utf8")));
  const slugs = new Set(guides.map((guide) => guide.slug));
  for (const guide of guides) {
    for (const related of guide.relatedGuides) {
      if (!slugs.has(related)) throw new Error(`Invalid guide ${guide.slug}.md: unknown related guide "${related}"`);
    }
  }
  cache = guides.sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title));
  return cache;
}

export function getGuide(slug: string): Guide | undefined {
  return getAllGuides().find((guide) => guide.slug === slug);
}

export function getGuidesForTool(tool: ToolId): Guide[] {
  return getAllGuides().filter((guide) => guide.relatedTools.includes(tool));
}
