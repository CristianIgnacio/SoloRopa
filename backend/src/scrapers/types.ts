import mongoose from "mongoose";
import type { CanonicalTags } from "../scrapers/domain/Tag";
import { Gender } from "../scrapers/domain/enums";

export type UpsertProductInput = {
  title: string;
  brand: mongoose.Types.ObjectId;
  url: string;

  images?: { src: string; alt?: string }[];

  price?: number | null;
  currency?: string | null;
  inStock?: boolean | null;
  isActive?: boolean | null;

  category?: string;
  categoryConfidence?: number;
  gender?: Gender;

  tags?: string[];

  canonicalTags?: CanonicalTags;
  tagVersion?: number;

  variants?: { title: string; sku?: string; price?: number; comparePrice?: number; inStock?: boolean }[];

  raw?: any;
};
