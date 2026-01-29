import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import type { Category } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface LoadCategoriesOptions {
  cwd?: string;
}

async function loadCategoriesFromDir(dir: string): Promise<Category[]> {
  if (!existsSync(dir)) {
    return [];
  }

  try {
    const files = await readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const categories: Category[] = [];

    for (const file of jsonFiles) {
      try {
        const content = await readFile(join(dir, file), "utf-8");
        const category = JSON.parse(content) as Category;
        categories.push(category);
      } catch (error) {
        console.warn(`Warning: Failed to load category from ${join(dir, file)}:`, error);
      }
    }

    return categories;
  } catch {
    return [];
  }
}

export async function loadCategories(options: LoadCategoriesOptions = {}): Promise<Category[]> {
  const cwd = options.cwd ?? process.cwd();

  const paths = [
    join(cwd, "effect-agent", "categories"),
    join(homedir(), ".effect-agent", "categories"),
    join(__dirname, "builtin"),
  ];

  const seenIds = new Set<string>();
  const categories: Category[] = [];

  for (const dir of paths) {
    const loaded = await loadCategoriesFromDir(dir);

    for (const category of loaded) {
      if (!seenIds.has(category.id)) {
        seenIds.add(category.id);
        categories.push(category);
      }
    }
  }

  return categories;
}

export async function loadCategoriesSync(options: LoadCategoriesOptions = {}): Promise<Category[]> {
  return loadCategories(options);
}
