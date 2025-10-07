
import React, { useRef } from 'react';
import { TemplateIcon, ChevronLeftIcon, ChevronRightIcon, ProductIcon, ExplainerIcon, TravelIcon, MindfulnessIcon, PencilIcon, ChatBubbleLeftRightIcon, GiftIcon, BookOpenIcon, SparklesIcon, UserIcon } from './icons';

export interface Template {
    id: string;
    title: string;
    category: 'Product' | 'Explainer' | 'Travel' | 'Mindfulness' | 'Educational' | 'Corporate' | 'Social' | 'Narrative';
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    thumbnailUrl: string;
    prompt: string;
    voice: string;
}

const templates: Template[] = [
    {
        id: 'faceless-video',
        title: 'Faceless Video',
        category: 'Social',
        icon: UserIcon,
        thumbnailUrl: 'https://images.pexels.com/photos/4049870/pexels-photo-4049870.jpeg?auto=compress&cs=tinysrgb&w=400',
        prompt: 'POV shot of hands performing a task, like cooking or crafting. Focus on the action and texture, with shallow depth of field. Maintain a consistent aesthetic and smooth, natural movements. Avoid showing any faces. Style: UGC, handheld camera.',
        voice: 'en-warm-female'
    },
    {
        id: 'product-showcase',
        title: 'Product Showcase',
        category: 'Product',
        icon: ProductIcon,
        thumbnailUrl: `https://picsum.photos/seed/product/400/300`,
        prompt: 'A cinematic, slow-motion wide shot of [YOUR PRODUCT], with dramatic lighting on a modern, clean background, highlighting its key features.',
        voice: 'deep-male'
    },
    {
        id: 'explainer-video',
        title: 'Explainer Video',
        category: 'Explainer',
        icon: ExplainerIcon,
        thumbnailUrl: `https://picsum.photos/seed/explainer/400/300`,
        prompt: 'A simple, animated graphic explaining the core concept of [YOUR TOPIC], starting with the problem it solves and ending with the positive outcome.',
        voice: 'warm-female'
    },
    {
        id: 'travel-vlog',
        title: 'Travel Vlog',
        category: 'Travel',
        icon: TravelIcon,
        thumbnailUrl: `https://picsum.photos/seed/travel/400/300`,
        prompt: 'A breathtaking travel vlog of [YOUR DESTINATION] with drone shots at sunrise, a fast-paced montage of cultural scenes, and a beautiful sunset over a key landmark.',
        voice: 'upbeat-male'
    },
    {
        id: 'meditation-guide',
        title: 'Meditation Guide',
        category: 'Mindfulness',
        icon: MindfulnessIcon,
        thumbnailUrl: `https://picsum.photos/seed/meditation/400/300`,
        prompt: 'A calming, slow-panning shot of a serene nature scene, like a peaceful forest, with tranquil close-ups of gentle waves and a time-lapse of clouds.',
        voice: 'calm-female'
    },
    {
        id: 'recipe-tutorial',
        title: 'Quick Recipe',
        category: 'Educational',
        icon: PencilIcon,
        thumbnailUrl: `https://picsum.photos/seed/recipe/400/300`,
        prompt: "A quick and snappy recipe video. Show top-down shots of ingredients being added to a bowl one by one: [INGREDIENT 1], [INGREDIENT 2], [INGREDIENT 3]. Use quick cuts and on-screen text labels for each ingredient. End with a delicious shot of the final dish.",
        voice: 'warm-female'
    },
    {
        id: 'interview-intro',
        title: 'Interview Intro',
        category: 'Corporate',
        icon: ChatBubbleLeftRightIcon,
        thumbnailUrl: `https://picsum.photos/seed/interview/400/300`,
        prompt: "A professional and clean intro sequence. Start with an animated logo reveal of [YOUR BRAND], followed by a lower-third graphic with the text '[INTERVIEWEE NAME]' and '[INTERVIEWEE TITLE]'. Use smooth transitions and a subtle, corporate background.",
        voice: 'warm-female'
    },
    {
        id: 'product-unboxing',
        title: 'Product Unboxing',
        category: 'Social',
        icon: GiftIcon,
        thumbnailUrl: `https://picsum.photos/seed/unboxing/400/300`,
        prompt: "A trendy, fast-paced unboxing video of [YOUR PRODUCT]. Show dynamic close-ups of the packaging, the satisfying moment of opening, and a 360-degree showcase of the product against a vibrant, energetic background. Use upbeat music.",
        voice: 'upbeat-male'
    },
    {
        id: 'book-trailer',
        title: 'Book Trailer',
        category: 'Narrative',
        icon: BookOpenIcon,
        thumbnailUrl: `https://picsum.photos/seed/book/400/300`,
        prompt: "A mysterious and cinematic book trailer for '[BOOK TITLE]'. Use dark, moody shots of key symbols from the story, like [SYMBOL 1] and [SYMBOL 2]. Overlay quotes from the book in a dramatic font. Build suspense and end with a shot of the book cover.",
        voice: 'deep-male'
    },
    {
        id: 'motivational-quote',
        title: 'Motivational Quote',
        category: 'Social',
        icon: SparklesIcon,
        thumbnailUrl: `https://picsum.photos/seed/quote/400/300`,
        prompt: "An inspiring quote video. Display the text '[YOUR QUOTE]' over a beautiful, slowly panning landscape video (e.g., sunrise over mountains). Use an elegant, readable font. End with the author's name '[AUTHOR]'.",
        voice: 'deep-male'
    }
];


interface VideoTemplatesProps {
    onSelectTemplate: (template: Template) => void;
    selectedTemplateId?: string | null;
}

export const VideoTemplates: React.FC<VideoTemplatesProps> = ({ onSelectTemplate, selectedTemplateId }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full max-w-3xl mt-8">
            <h3 className="text-lg font-semibold text-center text-gray-400 mb-4 flex items-center justify-center gap-2">
                <TemplateIcon className="h-5 w-5 text-indigo-400" />
                Or start with a template
            </h3>
            <div className="relative group">
                 <button 
                    onClick={() => scroll('left')}
                    className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                <div 
                    ref={scrollContainerRef}
                    className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 -mx-4 px-4"
                >
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            className={`flex-shrink-0 w-48 group bg-gray-800 rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 border-2 ${selectedTemplateId === template.id ? 'border-indigo-500' : 'border-gray-700'}`}
                        >
                            <div className="w-full h-28 bg-gray-700 overflow-hidden relative">
                                <img src={template.thumbnailUrl} alt={template.title} className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="p-3 text-left">
                                <h4 className="text-sm font-semibold text-white truncate">{template.title}</h4>
                                 <div className="flex items-center gap-1.5 mt-1">
                                    <template.icon className="h-3.5 w-3.5 text-gray-400" />
                                    <p className="text-xs text-gray-400">{template.category}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => scroll('right')}
                    className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Scroll right"
                >
                    <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>
            </div>
        </div>
    );
};
