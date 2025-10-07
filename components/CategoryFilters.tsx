import React, { useState } from 'react';

const categories = [
  "All", "Faceless", "UGC Ads", "Explainer", "Cinematic", 
  "Travel", "Motivational", "Satisfying", "Product"
];

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
        isActive 
          ? 'bg-amber-500 text-black shadow-md' 
          : 'bg-gray-800 text-gray-400 border border-transparent hover:bg-gray-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
};

export const CategoryFilters: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-4">
        <div className="flex items-center space-x-3 py-4">
            {categories.map((category) => (
            <FilterButton 
                key={category}
                label={category}
                isActive={activeCategory === category}
                onClick={() => setActiveCategory(category)}
            />
            ))}
        </div>
    </div>
  );
};