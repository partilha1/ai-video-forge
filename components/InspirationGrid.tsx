import React from 'react';
import { 
    UserIcon, FaceSmileIcon, ExplainerIcon, ProductIcon, TravelIcon, SparklesIcon,
    MindfulnessIcon, PencilIcon, GiftIcon, BuildingLibraryIcon, BookOpenIcon, BeakerIcon
} from './icons';

interface Inspiration {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  thumbnail: string;
  prompt: string;
}

const inspirations: Inspiration[] = [
    { label: 'Coffee Morning', icon: UserIcon, thumbnail: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'POV shot of hands pouring hot coffee into a mug on a rustic wooden table, steam rising gracefully. Morning light from a window. Faceless video style.' },
    { label: 'Skincare UGC', icon: FaceSmileIcon, thumbnail: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'UGC style video. A smiling woman films herself with a smartphone, showing a new skincare serum. She applies it and gives a thumbs up. Natural lighting in a bathroom.' },
    { label: 'Crypto Explained', icon: ExplainerIcon, thumbnail: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'Minimalist 3D animation explaining blockchain. A chain of glowing blocks is formed with icons representing transactions. Clean, modern, on a dark background.' },
    { label: 'Watch Ad', icon: ProductIcon, thumbnail: 'https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'Cinematic macro shot of a luxury watch. Slow-motion pan over the watch face, highlighting the intricate details and gears. Dramatic, high-contrast lighting.' },
    { label: 'Italy Dreams', icon: TravelIcon, thumbnail: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'Breathtaking travel montage of the Amalfi Coast, Italy. Fast-paced cuts of drone shots over cliffs, charming towns, and a beautiful sunset over the sea.' },
    { label: 'Sunrise Quote', icon: SparklesIcon, thumbnail: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'Inspiring quote video. A stunning time-lapse of a sunrise over misty mountains. The text \'The journey of a thousand miles begins with a single step\' appears in an elegant font.' },
    { label: 'Paint Mixing', icon: BeakerIcon, thumbnail: 'https://images.pexels.com/photos/4198151/pexels-photo-4198151.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'A mesmerizing top-down macro view of different colors of thick paint being mixed together. Slow, satisfying swirls and patterns emerge.' },
    { label: 'Quick Recipe', icon: PencilIcon, thumbnail: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'Quick and snappy recipe video. Top-down shots of ingredients for a salad being added to a bowl one by one. Use quick cuts and on-screen text labels for each ingredient.' },
    { label: 'Tech Unboxing', icon: GiftIcon, thumbnail: 'https://images.pexels.com/photos/7974/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'UGC style product unboxing of a new smartphone. Shows hands opening the box, close-ups of the phone, and a quick shot of it being turned on for the first time.' },
    { label: 'Cyberpunk Alley', icon: BuildingLibraryIcon, thumbnail: 'https://images.pexels.com/photos/2179603/pexels-photo-2179603.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'A moody, cinematic shot of a rainy cyberpunk alleyway at night. Neon signs reflect in the puddles on the ground. A mysterious figure walks away from the camera.' },
    { label: 'History Short', icon: BookOpenIcon, thumbnail: 'https://images.pexels.com/photos/161401/capitol-washington-dc-government-building-161401.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'An animated history lesson about ancient Rome, for children. Cute cartoon characters explain the Colosseum and Roman life.' },
    { label: 'Meditation Moment', icon: MindfulnessIcon, thumbnail: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400', prompt: 'A calming, slow-panning shot of a serene nature scene, like a peaceful forest, with tranquil close-ups of gentle waves and a time-lapse of clouds.' },
];

interface InspirationGridProps {
    onSelectPrompt: (prompt: string) => void;
}

export const InspirationGrid: React.FC<InspirationGridProps> = ({ onSelectPrompt }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 my-8">
      {inspirations.map(({ label, thumbnail, prompt }) => (
        <button 
            key={label} 
            onClick={() => onSelectPrompt(prompt)}
            className="group relative aspect-[4/3] w-full rounded-lg overflow-hidden border-2 border-gray-700/80 hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500"
        >
          <img src={thumbnail} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <p className="absolute bottom-2 left-2 text-sm font-semibold text-white">{label}</p>
        </button>
      ))}
    </div>
  );
};