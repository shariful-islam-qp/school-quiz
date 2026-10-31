/**
 * Language-neutral picture groups shared by the English and Bangla
 * "everyday knowledge" questions. Each language supplies its own wording.
 */

export type PictureCategory = "fruit" | "animal" | "bird" | "vehicle";

export const CATEGORY_PICTURES: Record<PictureCategory, string[]> = {
  fruit: ["🍎", "🍌", "🥭", "🍊", "🍇", "🍉", "🍓"],
  animal: ["🐄", "🐶", "🐈", "🦁", "🐘", "🐐", "🐇"],
  bird: ["🐦", "🦆", "🦅", "🐓", "🦜", "🦉"],
  vehicle: ["🚗", "🚌", "🚲", "✈️", "🚢", "🚂"],
};

/** Birds are animals too, so "which is an animal?" must not offer a bird. */
const NOT_WITH: Partial<Record<PictureCategory, PictureCategory[]>> = {
  animal: ["bird"],
};

export function categoryDistractors(category: PictureCategory): string[] {
  const blocked = new Set([category, ...(NOT_WITH[category] ?? [])]);
  return (Object.keys(CATEGORY_PICTURES) as PictureCategory[])
    .filter((other) => !blocked.has(other))
    .flatMap((other) => CATEGORY_PICTURES[other]);
}

/**
 * Animals by size tier, far enough apart that "biggest"/"smallest" is never
 * debatable: one answer comes from an end tier, the rest from other tiers.
 */
export const SIZE_TIERS: string[][] = [
  ["🐜", "🐞", "🐁"],
  ["🐈", "🐇", "🐓"],
  ["🐄", "🐴", "🦁"],
  ["🐘", "🦒", "🐋"],
];
