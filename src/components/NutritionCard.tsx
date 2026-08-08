import React from 'react';
import { Recipe } from '../types';
import { getRecipeNutrition, DAILY_VALUES } from '../utils/nutrition';
import { Flame, Dumbbell, Wheat, Droplet, Activity, Info } from 'lucide-react';

interface NutritionCardProps {
  recipe: Recipe;
  servingMultiplier?: number;
  className?: string;
}

interface CircularProgressProps {
  value: number;
  unit: string;
  label: string;
  percentage: number;
  icon: React.ReactNode;
  strokeColor: string;
  gradientId: string;
  gradientColors: [string, string];
  dailyTargetStr: string;
}

const CircularProgressMetric: React.FC<CircularProgressProps> = ({
  value,
  unit,
  label,
  percentage,
  icon,
  gradientId,
  gradientColors,
  dailyTargetStr
}) => {
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius; // ~201.06
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (circumference * clampedPct) / 100;

  return (
    <div className="flex flex-col items-center p-3.5 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/40 rounded-2xl transition-all group">
      {/* Label and Icon Header */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="p-1 rounded-lg bg-[#23211E] text-xs">
          {icon}
        </span>
        <span className="text-xs font-bold text-[#F5F2EB] tracking-wide">{label}</span>
      </div>

      {/* SVG Circular Ring */}
      <div className="relative w-24 h-24 flex items-center justify-center my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#2A2724"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Foreground Animated Progress Ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
          <span className="font-extrabold text-base text-[#F5F2EB] leading-none tracking-tight">
            {value}
            <span className="text-[10px] font-semibold text-[#C2BCB2] ml-0.5">{unit}</span>
          </span>
          <span className="text-[10px] font-extrabold mt-1 px-1.5 py-0.2 rounded bg-[#23211E] text-[#D4AF37] border border-[#2A2724]">
            {clampedPct}% DV
          </span>
        </div>
      </div>

      {/* Subtext Target Reference */}
      <span className="text-[10px] text-[#A39C90] mt-2 font-medium">
        {dailyTargetStr}
      </span>
    </div>
  );
};

export const NutritionCard: React.FC<NutritionCardProps> = ({
  recipe,
  servingMultiplier = 1,
  className = ''
}) => {
  const nutritionData = getRecipeNutrition(recipe, servingMultiplier);
  const { calories, protein, carbs, fats, fiber, sodium, caloriesPct, proteinPct, carbsPct, fatsPct, macroCaloriesRatio } = nutritionData;

  return (
    <div className={`bg-[#1A1918] border border-[#2A2724] rounded-3xl p-6 shadow-xl space-y-5 ${className}`}>
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2724] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-extrabold shadow-md">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#F5F2EB]">Nutritional Information</h3>
            <p className="text-xs text-[#A39C90]">
              Estimated per serving {servingMultiplier !== 1 && `(${servingMultiplier}x scaled serving)`}
            </p>
          </div>
        </div>

        {/* Serving Badge Indicator */}
        <div className="self-start sm:self-center px-3 py-1 rounded-full bg-[#23211E] border border-[#2A2724] text-xs text-[#D4AF37] font-extrabold flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#E5C158]" />
          <span>{calories} kcal / serving</span>
        </div>
      </div>

      {/* 4 Circular Progress Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Calories Circle */}
        <CircularProgressMetric
          value={calories}
          unit="kcal"
          label="Energy"
          percentage={caloriesPct}
          icon={<Flame className="w-3.5 h-3.5 text-[#E5C158]" />}
          strokeColor="#D4AF37"
          gradientId="grad-calories"
          gradientColors={['#D4AF37', '#E5C158']}
          dailyTargetStr={`Target: ${DAILY_VALUES.calories} kcal/day`}
        />

        {/* Protein Circle */}
        <CircularProgressMetric
          value={protein}
          unit="g"
          label="Protein"
          percentage={proteinPct}
          icon={<Dumbbell className="w-3.5 h-3.5 text-[#E6A135]" />}
          strokeColor="#E6A135"
          gradientId="grad-protein"
          gradientColors={['#E6A135', '#F3C64F']}
          dailyTargetStr={`DV: ${DAILY_VALUES.protein}g / day`}
        />

        {/* Carbs Circle */}
        <CircularProgressMetric
          value={carbs}
          unit="g"
          label="Carbs"
          percentage={carbsPct}
          icon={<Wheat className="w-3.5 h-3.5 text-emerald-400" />}
          strokeColor="#10B981"
          gradientId="grad-carbs"
          gradientColors={['#10B981', '#34D399']}
          dailyTargetStr={`DV: ${DAILY_VALUES.carbs}g / day`}
        />

        {/* Fats Circle */}
        <CircularProgressMetric
          value={fats}
          unit="g"
          label="Fats"
          percentage={fatsPct}
          icon={<Droplet className="w-3.5 h-3.5 text-rose-400" />}
          strokeColor="#F43F5E"
          gradientId="grad-fats"
          gradientColors={['#F43F5E', '#FB7185']}
          dailyTargetStr={`DV: ${DAILY_VALUES.fats}g / day`}
        />
      </div>

      {/* Macro Energy Ratio Distribution Bar */}
      <div className="bg-[#1E1D1B] border border-[#2A2724] p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F5F2EB] flex items-center gap-1.5">
            Macro Energy Ratio
          </span>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-[#E6A135]">
              <span className="w-2 h-2 rounded-full bg-[#E6A135]"></span>
              {macroCaloriesRatio.proteinRatio}% Protein
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {macroCaloriesRatio.carbsRatio}% Carbs
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              {macroCaloriesRatio.fatsRatio}% Fat
            </span>
          </div>
        </div>

        {/* Segmented Macro Bar */}
        <div className="w-full h-2.5 bg-[#23211E] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-[#2A2724]">
          <div
            style={{ width: `${macroCaloriesRatio.proteinRatio}%` }}
            className="h-full bg-gradient-to-r from-[#E6A135] to-[#F3C64F] rounded-l-full transition-all duration-500"
            title={`Protein: ${macroCaloriesRatio.proteinRatio}% of calories`}
          />
          <div
            style={{ width: `${macroCaloriesRatio.carbsRatio}%` }}
            className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-500"
            title={`Carbs: ${macroCaloriesRatio.carbsRatio}% of calories`}
          />
          <div
            style={{ width: `${macroCaloriesRatio.fatsRatio}%` }}
            className="h-full bg-gradient-to-r from-[#F43F5E] to-[#FB7185] rounded-r-full transition-all duration-500"
            title={`Fats: ${macroCaloriesRatio.fatsRatio}% of calories`}
          />
        </div>
      </div>

      {/* Secondary Micronutrients Badges (Fiber & Sodium) */}
      {(fiber !== undefined || sodium !== undefined) && (
        <div className="flex flex-wrap items-center justify-between text-xs text-[#C2BCB2] pt-1 border-t border-[#2A2724]/60 gap-2">
          <div className="flex items-center gap-4">
            {fiber !== undefined && (
              <span className="flex items-center gap-1">
                <span className="text-[#A39C90]">Dietary Fiber:</span>
                <strong className="text-[#F5F2EB]">{fiber}g</strong>
                <span className="text-[10px] text-[#A39C90]">({Math.round((fiber / DAILY_VALUES.fiber) * 100)}% DV)</span>
              </span>
            )}
            {sodium !== undefined && (
              <span className="flex items-center gap-1">
                <span className="text-[#A39C90]">Sodium:</span>
                <strong className="text-[#F5F2EB]">{sodium}mg</strong>
                <span className="text-[10px] text-[#A39C90]">({Math.round((sodium / DAILY_VALUES.sodium) * 100)}% DV)</span>
              </span>
            )}
          </div>

          <span className="text-[10px] text-[#A39C90] italic flex items-center gap-1">
            <Info className="w-3 h-3 text-[#D4AF37]" /> Percent Daily Values (% DV) are based on a 2,000 calorie diet.
          </span>
        </div>
      )}
    </div>
  );
};
