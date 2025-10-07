
import React, { useMemo } from 'react';
import { HistoryItem, VOICES } from '../App';
// fix: Import DashboardIcon and other missing icons
import { AspectRatioIcon, VoiceIcon, GenerateIcon, CopyIcon, SparklesIcon, DashboardIcon } from './icons';

interface DashboardProps {
  history: HistoryItem[];
  onUsePrompt: (prompt: string) => void;
}

// Define an interface for the stats object to ensure type safety.
interface Stats {
    totalGenerations: number;
    avgPromptLength: number;
    mostUsedAspectRatio: string;
    mostUsedVoice: string;
    activityLast7Days: number[];
    aspectRatioCounts: { [key: string]: number };
    voiceCounts: { [key: string]: number };
}

// Add explicit return type `Stats` to the function signature.
// This corrects type inference issues when an empty history causes the function to return empty objects for counts.
const calculateStats = (history: HistoryItem[]): Stats => {
    if (history.length === 0) {
        return {
            totalGenerations: 0,
            avgPromptLength: 0,
            mostUsedAspectRatio: 'N/A',
            mostUsedVoice: 'N/A',
            activityLast7Days: Array(7).fill(0),
            aspectRatioCounts: {},
            voiceCounts: {}
        };
    }

    const aspectRatioCounts: { [key: string]: number } = {};
    const voiceCounts: { [key: string]: number } = {};
    let totalPromptLength = 0;

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of 7 days ago

    const activityLast7Days = Array(7).fill(0);

    history.forEach(item => {
        totalPromptLength += item.prompt.length;
        aspectRatioCounts[item.aspectRatio] = (aspectRatioCounts[item.aspectRatio] || 0) + 1;
        voiceCounts[item.voice] = (voiceCounts[item.voice] || 0) + 1;

        const itemDate = new Date(item.timestamp);
        if (itemDate >= sevenDaysAgo && itemDate <= today) {
            const diffTime = Math.abs(today.getTime() - itemDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            activityLast7Days[6 - diffDays]++;
        }
    });

    const findMostUsed = (counts: { [key: string]: number }) => {
        if (Object.keys(counts).length === 0) return 'N/A';
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };
    
    const voiceNameMap = new Map(VOICES.map(v => [v.id, v.name]));

    const mostUsedVoiceId = findMostUsed(voiceCounts);
    const mostUsedVoiceName = voiceNameMap.get(mostUsedVoiceId) || mostUsedVoiceId;

    return {
        totalGenerations: history.length,
        avgPromptLength: Math.round(totalPromptLength / history.length),
        mostUsedAspectRatio: findMostUsed(aspectRatioCounts),
        mostUsedVoice: mostUsedVoiceName,
        activityLast7Days,
        aspectRatioCounts,
        voiceCounts,
    };
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex items-start gap-4">
        <div className="bg-gray-700/50 p-3 rounded-lg text-indigo-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const ActivityChart: React.FC<{ data: number[] }> = ({ data }) => {
    const maxVal = Math.max(...data, 1);
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const todayIndex = new Date().getDay();
    
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Generation Activity (Last 7 Days)</h3>
            <div className="flex justify-between items-end h-48 gap-3">
                {data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                            className="w-full bg-indigo-600/50 hover:bg-indigo-500/80 rounded-t-md transition-all duration-300" 
                            style={{ height: `${(value / maxVal) * 100}%` }}
                            title={`${value} generation(s)`}
                        />
                        <span className={`text-xs font-medium ${index === 6 ? 'text-indigo-400' : 'text-gray-500'}`}>
                           {days[(todayIndex - (6-index) + 7) % 7]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UsageChart: React.FC<{ title: string; data: { [key: string]: number }, icon: React.ReactNode }> = ({ title, data, icon }) => {
    // FIX: Ensure `total` is correctly calculated as a number, even if Object.values returns `unknown[]`.
    // Fix: Explicitly type the `sum` accumulator as a number to prevent TypeScript from inferring it as `unknown`, which resolves all related type errors.
    const total = Object.values(data).reduce((sum: number, val) => sum + Number(val), 0);
    // FIX: Correctly sort entries by ensuring values are treated as numbers.
    const sortedData = Object.entries(data).sort((a, b) => Number(b[1]) - Number(a[1]));
    const voiceNameMap = useMemo(() => new Map(VOICES.map(v => [v.id, v.name])), []);

    return (
         <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">{icon}{title}</h3>
            <div className="space-y-3">
                {sortedData.map(([key, value]) => {
                    // FIX: Ensure percentage calculation is safe by casting `value` and `total` to a number.
                    // This resolves errors where `total` could be inferred as `unknown`, causing issues with comparisons and arithmetic operations.
                     const percentage = Number(total) > 0 ? (Number(value) / Number(total)) * 100 : 0;
                     const name = title.includes('Voice') ? voiceNameMap.get(key) || key : key;
                     return (
                        <div key={key}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-gray-300">{name}</span>
                                <span className="text-gray-400 font-medium">{String(value)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    )
                })}
                 {sortedData.length === 0 && <p className="text-sm text-gray-500">No data available.</p>}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ history, onUsePrompt }) => {
  const stats = useMemo(() => calculateStats(history), [history]);

  if (history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <DashboardIcon className="h-24 w-24 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300">Your Dashboard is Empty</h3>
            <p>Generate your first video to see your stats here.</p>
        </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Generations" value={stats.totalGenerations} icon={<GenerateIcon className="w-6 h-6"/>} />
        <StatCard title="Avg. Prompt Length" value={`${stats.avgPromptLength} chars`} icon={<SparklesIcon className="w-6 h-6"/>} />
        <StatCard title="Favorite Aspect Ratio" value={stats.mostUsedAspectRatio} icon={<AspectRatioIcon className="w-6 h-6"/>} />
        <StatCard title="Favorite Voice" value={stats.mostUsedVoice} icon={<VoiceIcon className="w-6 h-6"/>} />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ActivityChart data={stats.activityLast7Days} />
        </div>
        <div className="space-y-6">
            <UsageChart title="Aspect Ratio Usage" data={stats.aspectRatioCounts} icon={<AspectRatioIcon className="w-5 h-5"/>} />
            <UsageChart title="Narration Voice Usage" data={stats.voiceCounts} icon={<VoiceIcon className="w-5 h-5"/>} />
        </div>
      </div>

      {/* Recent Generations */}
       <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Generations</h3>
            <ul className="space-y-3">
                {history.slice(0, 5).map(item => (
                    <li key={item.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex items-center gap-4">
                        <video src={item.videoUrl} poster={item.imageBase64} className="w-24 h-16 rounded-md object-cover bg-black flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                            <p className="text-sm text-gray-300 truncate">{item.prompt}</p>
                            <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={() => onUsePrompt(item.prompt)}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex-shrink-0"
                        >
                            <CopyIcon className="h-3.5 w-3.5"/>
                            Use Prompt
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};
