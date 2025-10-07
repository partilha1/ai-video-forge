import React from 'react';
import { 
    MootionLogo, GenerateIcon, AIToolsIcon, ProjectsIcon, MediaIcon, GalleryIcon, 
    GiftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon
} from './icons';

interface NavLinkProps {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    active?: boolean;
    onClick?: () => void;
    isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon: Icon, label, active, onClick, isCollapsed }) => (
    <button 
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${ isCollapsed ? 'justify-center' : '' } ${
        active 
            ? 'bg-amber-500/10 text-amber-400' 
            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
        }`}
        title={isCollapsed ? label : undefined}
    >
        <Icon className={`h-5 w-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''} ${active ? 'text-amber-400' : 'text-gray-500'}`} />
        {!isCollapsed && label}
    </button>
);

interface SidebarProps {
    currentUser: { username: string } | null;
    logout: () => void;
    onToggleHistory: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, logout, onToggleHistory, isCollapsed, onToggleCollapse }) => {
    return (
        <aside className={`bg-[#111827] border-r border-gray-800/50 flex flex-col flex-shrink-0 p-4 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center gap-2 px-2 mb-8 ${isCollapsed ? 'justify-center' : ''}`}>
                <MootionLogo className="text-amber-500 flex-shrink-0" />
                {!isCollapsed && <span className="text-xl font-bold text-white whitespace-nowrap">AI Video Forge</span>}
            </div>
            
            <nav className="flex-grow space-y-1">
                <NavLink icon={GenerateIcon} label="Director's Desk" active isCollapsed={isCollapsed} />
                <NavLink icon={AIToolsIcon} label="Editing Suite" isCollapsed={isCollapsed} />
                <NavLink icon={ProjectsIcon} label="Productions" onClick={onToggleHistory} isCollapsed={isCollapsed} />
                <NavLink icon={MediaIcon} label="Asset Library" isCollapsed={isCollapsed} />
                <NavLink icon={GalleryIcon} label="Screenings" isCollapsed={isCollapsed} />
            </nav>
            
            <div className="flex-shrink-0">
                <div className="space-y-4">
                    <div className={`p-3 rounded-lg bg-gray-800/50 border border-gray-700 ${isCollapsed ? 'p-2' : 'p-3'}`}>
                        <div className="flex items-center justify-between">
                            <div className={`flex items-center ${isCollapsed ? 'w-full justify-center' : ''}`}>
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`}></div>
                                {!isCollapsed && (
                                    <div>
                                        <p className="font-semibold text-sm text-white truncate">{currentUser?.username}</p>
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && <ChevronRightIcon className="h-5 w-5 text-gray-500" />}
                        </div>
                    </div>

                    <button className={`flex items-center justify-center w-full bg-gray-700/50 border border-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm`}>
                        <GiftIcon className={`h-5 w-5 flex-shrink-0 ${!isCollapsed ? 'mr-2' : ''} text-gray-400`} />
                        {!isCollapsed && <span className="whitespace-nowrap">Invite a friend</span>}
                    </button>

                    <div className="bg-gray-800/50 text-center p-3 rounded-lg">
                        {!isCollapsed ? (
                            <>
                                <p className="font-bold text-white">Free Plan</p>
                                <p className="text-sm text-gray-400">68 credits left</p>
                            </>
                        ) : (
                            <div>
                               <p className="font-bold text-white text-lg">68</p>
                               <p className="text-xs text-gray-500">Left</p>
                            </div>
                        )}
                    </div>
                </div>

                {!isCollapsed && (
                    <div className="text-xs text-gray-500 text-center space-x-4 pt-4 mt-4 border-t border-gray-700">
                        <a href="#" className="hover:underline">Terms of Service</a>
                        <a href="#" className="hover:underline">Privacy</a>
                    </div>
                )}
                
                <div className="pt-4 mt-4 border-t border-gray-700">
                    <button 
                        onClick={onToggleCollapse} 
                        className="w-full flex items-center justify-center p-2 text-gray-400 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        </aside>
    );
};