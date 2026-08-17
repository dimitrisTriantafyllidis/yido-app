import type { PackageTier } from "./types";

export interface PackageLimits {
  maxGuests: number;
  maxLocations: number;
  maxGalleryPhotos: number;
  hasTimeline: boolean;
  hasGallery: boolean;
  hasCustomColors: boolean;
  hasSeating: boolean;
  hasCustomDomain: boolean;
  hasWishBook: boolean;
}

const LIMITS: Record<PackageTier, PackageLimits> = {
  basic: {
    maxGuests: 100,
    maxLocations: 1,
    maxGalleryPhotos: 0,
    hasTimeline: false,
    hasGallery: false,
    hasCustomColors: false,
    hasSeating: false,
    hasCustomDomain: false,
    hasWishBook: false,
  },
  premium: {
    maxGuests: Infinity,
    maxLocations: Infinity,
    maxGalleryPhotos: 500,
    hasTimeline: true,
    hasGallery: true,
    hasCustomColors: true,
    hasSeating: true,
    hasCustomDomain: false,
    hasWishBook: true,
  },
  gold: {
    maxGuests: Infinity,
    maxLocations: Infinity,
    maxGalleryPhotos: Infinity,
    hasTimeline: true,
    hasGallery: true,
    hasCustomColors: true,
    hasSeating: true,
    hasCustomDomain: true,
    hasWishBook: true,
  },
};

export function getPackageLimits(tier: PackageTier): PackageLimits {
  return LIMITS[tier];
}

export function canAddGuest(tier: PackageTier, currentCount: number): boolean {
  return currentCount < LIMITS[tier].maxGuests;
}

export function canAddLocation(tier: PackageTier, currentCount: number): boolean {
  return currentCount < LIMITS[tier].maxLocations;
}

export function canAddPhoto(tier: PackageTier, currentCount: number): boolean {
  return LIMITS[tier].hasGallery && currentCount < LIMITS[tier].maxGalleryPhotos;
}

export function getUpgradeTier(currentTier: PackageTier): PackageTier | null {
  if (currentTier === "basic") return "premium";
  if (currentTier === "premium") return "gold";
  return null;
}
