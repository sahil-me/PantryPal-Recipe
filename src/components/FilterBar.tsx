import React from 'react';
import { Filter, SlidersHorizontal, Clock, ArrowUpDown, Search } from 'lucide-react';
import { FilterOptions, MealCategory, DietaryPreference } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  totalResultsCount: number;
}

const CATEGORIES: MealCategory[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIETARY_OPTIONS: DietaryPreference[] = ['Any', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalResultsCount,
}) => {
  return (
    <div className="bg-[#FAF8F5] rounded-2xl shadow-2xs border border-[#EAE7E2] p-4 space-y-3">
      
      {/* Top Bar: Results Count + Quick Search Query + Sort dropdown */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Results Badge */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#7A8B74] text-white rounded-lg">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2926]">
              Matched Recipes ({totalResultsCount})
            </h3>
            <p className="text-xs text-[#7A746E]">Sorted by best match quality</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Text Query Filter */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 text-[#A59E96] absolute left-2.5 top-2.5" />
            <input
              id="filter-keyword-input"
              type="text"
              value={filters.query || ''}
              onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
              placeholder="Search in recipes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white focus:bg-white border border-[#DED9D2] rounded-xl focus:outline-none focus:border-[#7A8B74] focus:ring-1 focus:ring-[#7A8B74] text-[#2D2926]"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DED9D2] rounded-xl px-2.5 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A8B74]" />
            <select
              id="sort-by-select"
              value={filters.sortBy || 'bestMatch'}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as FilterOptions['sortBy'] })}
              className="bg-transparent text-xs font-semibold text-[#2D2926] focus:outline-none cursor-pointer pr-1"
            >
              <option value="bestMatch">Best Match %</option>
              <option value="fewestMissing">Fewest Missing Ingredients</option>
              <option value="prepTime">Shortest Time</option>
            </select>
          </div>
        </div>

      </div>

      {/* Category Pills & Dietary Tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#EAE7E2]">
        
        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#A59E96] mr-1 hidden sm:inline">Category:</span>
          {CATEGORIES.map((cat) => {
            const isActive = (filters.category || 'All') === cat;
            return (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase()}`}
                onClick={() => onFilterChange({ ...filters, category: cat })}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  isActive
                    ? 'bg-[#7A8B74] text-white font-bold shadow-2xs'
                    : 'bg-white hover:bg-[#F0F4EF] text-[#2D2926] border border-[#DED9D2]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Dietary Dropdown & Time Filter */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Time Filter */}
          <div className="flex items-center gap-1 bg-white border border-[#DED9D2] rounded-xl px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 text-[#7A8B74]" />
            <select
              id="max-time-select"
              value={filters.maxTotalTimeMinutes || 0}
              onChange={(e) => onFilterChange({ ...filters, maxTotalTimeMinutes: Number(e.target.value) })}
              className="bg-transparent text-xs text-[#2D2926] focus:outline-none cursor-pointer font-medium"
            >
              <option value={0}>Any Cook Time</option>
              <option value={10}>Under 10 mins</option>
              <option value={15}>Under 15 mins</option>
              <option value={30}>Under 30 mins</option>
              <option value={60}>Under 1 hour</option>
            </select>
          </div>

          {/* Dietary Filter */}
          <div className="flex items-center gap-1 bg-white border border-[#DED9D2] rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-[#7A8B74]" />
            <select
              id="dietary-select"
              value={filters.dietary || 'Any'}
              onChange={(e) => onFilterChange({ ...filters, dietary: e.target.value as DietaryPreference })}
              className="bg-transparent text-xs text-[#2D2926] focus:outline-none cursor-pointer font-medium"
            >
              {DIETARY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt === 'Any' ? 'Any Diet' : opt}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

    </div>
  );
};
