import React from 'react';

export const RecipeSkeletonCard: React.FC = () => {
  return (
    <div className="bg-[#1E1D1B] rounded-2xl border border-[#2A2724] p-4 space-y-4 animate-pulse shadow-md">
      {/* Image Skeleton */}
      <div className="w-full h-44 bg-[#23211E] rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2A2724]/30 to-transparent animate-shimmer" />
      </div>

      {/* Title & Metadata Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-[#23211E] rounded-md w-3/4" />
        <div className="h-3 bg-[#23211E] rounded-md w-1/2" />
      </div>

      {/* Ingredient Chip Badges Skeleton */}
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-16 bg-[#23211E] rounded-full" />
        <div className="h-6 w-20 bg-[#23211E] rounded-full" />
        <div className="h-6 w-14 bg-[#23211E] rounded-full" />
      </div>

      {/* Button Action Skeleton */}
      <div className="pt-2 border-t border-[#2A2724] flex items-center justify-between">
        <div className="h-3 bg-[#23211E] rounded-md w-24" />
        <div className="h-8 bg-[#23211E] rounded-xl w-20" />
      </div>
    </div>
  );
};
