import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Folder, Plus, Search, Film, Star, Trash2, BookOpen, Clapperboard,
    User, X, Edit3, CheckSquare, Grid, Eye, Save, Menu, ChevronLeft,
    ChevronRight, Upload, Download, HardDrive, Sparkles, LayoutDashboard,
    PieChart, MonitorPlay, Calendar, MoreVertical, ExternalLink, FileSpreadsheet,
    Moon, Sun, BarChart3, TrendingUp, Award, QrCode, CreditCard
} from 'lucide-react';

// --- CONSTANTS & CONFIG ---

const OMDB_API_KEY = 'cb00e7be';
const DEFAULT_USER_DATA = {
    name: "
<<<<<<< HEAD
    name: "Vanit",
    idNo: "1",
    issued: "FEB 2005",
    memberType: "THE CREATOR"
=======
    name: "Ethan",
    idNo: "8821-039X",
    issued: "NOV 2024",
    memberType: "LIFETIME MEMBER"
>>>>>>> 861c437 (Update app.jsx)
};

// --- HELPER FUNCTIONS ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown Date';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const parseCSV = (csvText, isWatchlist) => {
    const lines = csvText.trim().split('\n');
    const result = [];
    const startIndex = lines[0].toLowerCase().includes('title') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        const title = values[1]?.replace(/^"|"$/g, '') || "Untitled";
        const year = values[2] || "N/A";
        const director = values[3]?.replace(/^"|"$/g, '') || "Unknown";
        const imdbRating = values[5];
        const posterUrl = values[7]?.replace(/^"|"$/g, '');
        
        const rating = imdbRating ? (parseFloat(imdbRating) / 2).toFixed(1) : 0;

        result.push({
            id: generateId(),
            title: title,
            year: year,
            director: director,
            rating: rating,
            poster: posterUrl && posterUrl.length > 5 ? posterUrl : 'N/A',
            notes: '',
            folder: isWatchlist ? 'Watchlist' : null,
            watched: !isWatchlist,
            addedAt: new Date().toISOString()
        });
    }
    return result;
};

// --- COMPONENTS ---

// 1. UI PRIMITIVES

const NeoCard = ({ children, className = "", onClick, color = "bg-white dark:bg-gray-800", style = {} }) => (
    <div
        onClick={onClick}
        style={style}
        className={`
            border-2 border-black dark:border-white rounded-xl p-5 relative isolate transition-all duration-200
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]
            hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]
            hover:-translate-y-1 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]
            text-black dark:text-white
            ${color} ${className} ${onClick ? 'cursor-pointer' : ''}
        `}
    >
        {children}
    </div>
);

// Fixed Badge: Removed hardcoded text colors from base class to allow overrides
const Badge = ({ children, color = "bg-gray-100 dark:bg-gray-700 text-black dark:text-white", className = "" }) => (
    <span className={`px-2 py-1 rounded-md border border-black dark:border-white text-[10px] font-bold uppercase tracking-wide ${color} ${className}`}>
        {children}
    </span>
);

const NeoButton = ({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) => {
    const variants = {
        primary: "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
        secondary: "bg-white text-black hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
        accent: "bg-[#FF0055] text-white hover:bg-[#D90048] border-black dark:border-white", // Adjusted pink for better contrast
        danger: "bg-red-500 text-white hover:bg-red-600 border-black dark:border-white",
        success: "bg-[#00Dfa2] text-black hover:bg-[#00c48f]",
        ghost: "bg-transparent border-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/10 dark:text-white text-black"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-black dark:border-white
                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]
                active:translate-y-[2px] active:shadow-none
                transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant] || variants.primary} ${className}
            `}
        >
            {children}
        </button>
    );
};

// 2. LAYOUT COMPONENTS

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onSyncClick, darkMode, toggleDarkMode }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'collections', label: 'Collections', icon: Folder },
        { id: 'database', label: 'Database', icon: Film },
        { id: 'watchlist', label: 'Watchlist', icon: Eye },
        { id: 'statistics', label: 'Statistics', icon: PieChart },
        { id: 'idcard', label: 'My ID Card', icon: CreditCard },
    ];

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-950 border-r-2 border-black dark:border-white z-50 flex flex-col
                transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header */}
                <div className="h-20 bg-[#FFD700] dark:bg-[#FFD700] border-b-2 border-black dark:border-white flex items-center px-6 shrink-0 relative">
                    <div className="flex items-center gap-2 select-none">
                        <Clapperboard size={28} className="text-black fill-black flex-shrink-0" />
                        <h1 className="font-serif font-black text-2xl tracking-tight text-black">
                            Cine<span className="text-pink-600">Folder</span>
                            <span className="text-[10px] bg-black text-white px-1 py-0.5 ml-1 rounded font-sans tracking-widest align-top">PRO</span>
                        </h1>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded"
                    >
                        <X size={20} className="text-black" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                            className={`
                                w-full flex items-center px-4 py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 group
                                ${activeTab === item.id
                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] translate-x-1'
                                    : 'bg-white text-gray-700 border-transparent hover:border-black dark:bg-gray-900 dark:text-gray-300 dark:hover:border-white hover:bg-gray-50 hover:translate-x-1'}
                            `}
                        >
                            <div className="w-8 flex justify-center flex-shrink-0">
                                <item.icon size={20} />
                            </div>
                            <span className="whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900 space-y-3">
                    <button 
                        onClick={onSyncClick}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors group text-sm font-bold text-black dark:text-white"
                    >
                        <Upload size={16} className="text-blue-600 dark:text-blue-400" />
                        Sync Data
                    </button>
                    
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black transition-all hover:opacity-90 font-bold text-sm"
                    >
                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>
            </aside>
        </>
    );
};

// 3. FEATURE COMPONENTS

const SearchBar = ({ onSearch, value }) => (
    <div className="relative w-full max-w-md group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
        <input 
            type="text" 
            value={value}
            placeholder="Search database..." 
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-black dark:border-white font-bold text-sm outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
    </div>
);

const MovieCard = ({ movie, onClick }) => (
    <NeoCard onClick={onClick} className="group p-0 overflow-hidden flex flex-col h-full bg-white dark:bg-gray-800 hover:z-10">
        <div className="aspect-[2/3] w-full relative overflow-hidden bg-gray-100 dark:bg-gray-700 border-b-2 border-black dark:border-white">
            {movie.poster && movie.poster !== 'N/A' ? (
                <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x450/pink/black?text=No+Img'; }}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-500 bg-gray-50 dark:bg-gray-800">
                    <Film size={48} />
                    <span className="text-xs font-bold mt-2 px-4 text-center text-gray-400 dark:text-gray-500 leading-tight">{movie.title}</span>
                </div>
            )}
            <div className="absolute top-2 right-2 z-10">
                 {movie.watched && movie.rating > 0 && (
                    <div className="bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded border border-black shadow-sm flex items-center gap-1">
                        <Star size={10} fill="black" /> {movie.rating}
                    </div>
                 )}
            </div>
            {!movie.watched && (
                <div className="absolute top-2 left-2 z-10">
                    <Badge color="bg-green-400 text-black border-black shadow-sm">To Watch</Badge>
                </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-1 gap-2">
            <h4 className="font-bold text-base leading-tight line-clamp-2 dark:text-white" title={movie.title}>{movie.title}</h4>
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-dashed border-gray-200 dark:border-gray-600">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{movie.year}</span>
                {movie.folder && <Badge color="bg-pink-100 dark:bg-pink-900 text-black dark:text-pink-100">{movie.folder}</Badge>}
            </div>
        </div>
    </NeoCard>
);

const TaskWidget = ({ tasks, setTasks }) => {
    const [newTask, setNewTask] = useState('');

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: generateId(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (e, id) => {
        e.stopPropagation();
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <NeoCard className="h-full bg-white dark:bg-gray-800 flex flex-col">
            <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2 border-b-2 border-dashed border-gray-200 dark:border-gray-600 pb-2 dark:text-white">
                Quick Tasks
                <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-0.5 rounded-full font-sans ml-auto">
                    {tasks.filter(t => !t.completed).length} Pending
                </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar pr-2">
                {tasks.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-sm italic text-center mt-4">No tasks yet.</p>}
                {tasks.map(task => (
                    <div 
                        key={task.id} 
                        onClick={() => toggleTask(task.id)}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                    >
                        <div className={`
                            w-5 h-5 rounded border-2 border-black dark:border-white flex items-center justify-center mt-0.5 transition-colors flex-shrink-0
                            ${task.completed ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-gray-800'}
                        `}>
                            {task.completed && <CheckSquare size={12} />}
                        </div>
                        <span className={`text-sm font-medium transition-all ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                            {task.text}
                        </span>
                        <button 
                            onClick={(e) => removeTask(e, task.id)}
                            className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={addTask} className="relative mt-auto">
                <input 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="+ Add task..." 
                    className="w-full p-2 pr-10 border-b-2 border-gray-200 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none font-medium text-sm bg-transparent placeholder-gray-400 dark:placeholder-gray-500 dark:text-white"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-110 transition-transform">
                    <Plus size={12} />
                </button>
            </form>
        </NeoCard>
    );
};

// 4. VIEWS

const Dashboard = ({ movies, tasks, setTasks, onAddMovie, onMovieClick, userData }) => {
    // Get last 3 added movies
    const recentMovies = [...movies].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 3);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="rounded-3xl border-2 border-black dark:border-white bg-[#FFF8DC] dark:bg-[#2C2C2E] p-8 md:p-12 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white leading-tight">
                        Welcome back, <br/>{userData.name}
                    </h2>
                    <p className="font-mono text-sm md:text-base text-gray-700 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
                        Database contains <span className="bg-black text-white dark:bg-white dark:text-black px-1 font-bold">{movies.length} entries</span>. 
                        You have <span className="border-b-2 border-black dark:border-white font-bold">{tasks.filter(t => !t.completed).length} tasks</span> pending.
                    </p>
                    <NeoButton 
                        onClick={onAddMovie} 
                        variant="accent"
                        className="px-6 py-3.5 shadow-lg"
                    >
                        <Plus size={18} /> Add New Movie
                    </NeoButton>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300 dark:bg-pink-700 rounded-full border-2 border-black dark:border-white -mr-16 -mt-16 opacity-100"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-blue-300 dark:bg-blue-700 rounded-full border-2 border-black dark:border-white translate-y-1/2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Entries */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-end border-b-2 border-black/10 dark:border-white/20 pb-2">
                        <h3 className="font-serif text-2xl font-bold bg-blue-100 dark:bg-blue-900 dark:text-white px-2 -ml-2 transform -skew-x-12 inline-block border border-black dark:border-white shadow-sm">
                            <span className="block transform skew-x-12">Recent Entries</span>
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentMovies.length > 0 ? recentMovies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
                        )) : (
                            <div className="col-span-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-800/50">
                                No movies added yet. Start your collection!
                            </div>
                        )}
                    </div>
                </div>

                {/* Task Widget */}
                <div className="lg:col-span-1 h-full min-h-[300px]">
                     <TaskWidget tasks={tasks} setTasks={setTasks} />
                </div>
            </div>
        </div>
    );
};

const CollectionsView = ({ folders, onFolderClick, onAddFolder }) => (
    <div className="animate-in fade-in duration-500">
        <h3 className="font-serif text-3xl font-bold mb-6 dark:text-white">Collections</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {folders.map(folder => (
                <NeoCard 
                    key={folder.id} 
                    onClick={() => onFolderClick(folder.name)}
                    color={folder.color}
                    className="aspect-[4/3] flex flex-col items-center justify-center gap-3 group"
                >
                    {/* Folder Tab Effect */}
                    <div 
                        className="absolute -top-3 left-0 w-1/2 h-4 rounded-t-lg border-2 border-b-0 border-black dark:border-white z-0 transition-colors"
                        style={{ backgroundColor: folder.tabColor }}
                    ></div>
                    
                    <div className="w-12 h-12 rounded-full bg-white/50 border-2 border-black dark:border-white flex items-center justify-center group-hover:scale-110 transition-transform text-black">
                        {folder.icon === 'film' && <Film size={20} />}
                        {folder.icon === 'star' && <Star size={20} />}
                        {folder.icon === 'ghost' && <div className="text-lg">👻</div>}
                        {folder.icon === 'heart' && <div className="text-lg">❤️</div>}
                        {!folder.icon && <Folder size={20} />}
                    </div>
                    
                    <div className="text-center z-10 text-black">
                        <h4 className="font-serif font-bold text-lg leading-tight">{folder.name}</h4>
                        <span className="text-[10px] font-mono border border-black dark:border-white px-1.5 py-0.5 rounded bg-white mt-1 inline-block">
                            {folder.count} files
                        </span>
                    </div>
                </NeoCard>
            ))}
            
            <button 
                onClick={onAddFolder}
                className="aspect-[4/3] border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800 transition-all"
            >
                <Plus size={32} />
                <span className="font-bold text-sm">New Folder</span>
            </button>
        </div>
    </div>
);

const DatabaseView = ({ movies, searchQuery, onMovieClick, isWatchlistMode }) => {
    const filtered = movies.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              m.director?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = isWatchlistMode ? !m.watched : m.watched;
        return matchesSearch && matchesType;
    });

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-3xl font-bold dark:text-white">{isWatchlistMode ? 'Watchlist' : 'Database'}</h3>
                <span className="text-sm font-mono bg-white dark:bg-gray-800 dark:text-white border border-black dark:border-white px-2 py-1 rounded shadow-sm">
                    {filtered.length} Entries
                </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                {filtered.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
                ))}
            </div>
            
            {filtered.length === 0 && (
                <div className="text-center py-20 opacity-50 dark:text-white">
                    <Film size={48} className="mx-auto mb-4" />
                    <p>No {isWatchlistMode ? 'watchlist items' : 'movies'} found matching "{searchQuery}"</p>
                    <p className="text-xs mt-2">Try importing your CSV files via the "Sync Data" button in the sidebar.</p>
                </div>
            )}
        </div>
    );
};

const StatisticsView = ({ movies }) => {
    const watchedMovies = movies.filter(m => m.watched);
    const watchlistMovies = movies.filter(m => !m.watched);
    
    // Calculate simple stats
    const totalWatched = watchedMovies.length;
    
    const genreCounts = {};
    watchedMovies.forEach(m => {
        const genre = m.genre?.split(',')[0].trim() || 'Unsorted';
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    
    const sortedGenres = Object.entries(genreCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const maxGenreCount = sortedGenres[0]?.[1] || 1;

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <h3 className="font-serif text-3xl font-bold dark:text-white">Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <NeoCard className="bg-[#FFD700] dark:bg-[#bfa200] flex flex-col items-center justify-center py-8">
                    <Film size={40} className="mb-2 text-black" />
                    <span className="text-5xl font-black text-black">{totalWatched}</span>
                    <span className="text-sm font-bold uppercase tracking-widest mt-2 text-black">Films Watched</span>
                 </NeoCard>
                 <NeoCard className="bg-pink-300 dark:bg-pink-700 flex flex-col items-center justify-center py-8">
                    <Eye size={40} className="mb-2 text-black dark:text-white" />
                    <span className="text-5xl font-black text-black dark:text-white">{watchlistMovies.length}</span>
                    <span className="text-sm font-bold uppercase tracking-widest mt-2 text-black dark:text-white">To Watch</span>
                 </NeoCard>
            </div>

            <NeoCard className="p-8 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-6 border-b-2 border-black/10 dark:border-white/10 pb-4">
                     <BarChart3 size={24} />
                     <h4 className="font-bold text-xl">Top Genres</h4>
                </div>
                <div className="space-y-6">
                    {sortedGenres.map(([genre, count]) => (
                        <div key={genre}>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span>{genre}</span>
                                <span>{count} films</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-5 rounded-full overflow-hidden border border-black dark:border-white relative">
                                <div 
                                    className="h-full bg-black dark:bg-white transition-all duration-1000 relative" 
                                    style={{ width: `${(count / maxGenreCount) * 100}%` }}
                                >
                                     {/* Striped Pattern Overlay */}
                                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {sortedGenres.length === 0 && <p className="text-center opacity-50 italic">No data available. Add some watched movies!</p>}
                </div>
            </NeoCard>
        </div>
    );
};

const IDCardView = ({ userData, setUserData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(userData);

    const handleSave = () => {
        setUserData(formData);
        setIsEditing(false);
    };

    return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)] animate-in zoom-in-95 duration-500">
            <div className="relative group perspective-1000">
                 {/* Lanyard String */}
                 <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-4 h-32 bg-red-600 z-0 border-x-2 border-black"></div>
                 
                 {/* Badge */}
                 <div className="relative w-[340px] h-[520px] bg-white dark:bg-gray-900 border-4 border-black dark:border-white rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.8)] flex flex-col transition-transform duration-500">
                     {/* Holo header */}
                     <div className="h-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center border-b-4 border-black dark:border-white relative overflow-hidden">
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                         <h2 className="font-serif font-black text-3xl text-white tracking-tighter drop-shadow-md relative z-10">CineFolder PRO</h2>
                         
                         <button 
                             onClick={() => setIsEditing(!isEditing)}
                             className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-colors"
                         >
                             <Edit3 size={16} />
                         </button>
                     </div>
                     
                     <div className="flex-1 flex flex-col items-center p-6 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] relative">
                         <div className="w-32 h-32 rounded-full border-4 border-black dark:border-white overflow-hidden bg-yellow-400 mb-6 shadow-xl">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="avatar" className="w-full h-full object-cover" />
                         </div>
                         
                         {isEditing ? (
                            <div className="w-full space-y-2 mb-4">
                                <input 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2 border-2 border-black text-center font-bold text-lg rounded bg-white text-black"
                                    placeholder="Name"
                                />
                                <input 
                                    value={formData.memberType}
                                    onChange={e => setFormData({...formData, memberType: e.target.value})}
                                    className="w-full p-2 border-2 border-black text-center font-bold text-xs rounded bg-white text-black uppercase"
                                    placeholder="Member Type"
                                />
                            </div>
                         ) : (
                             <>
                                <h1 className="font-black text-3xl uppercase mb-1 dark:text-white text-center leading-none tracking-tight">{userData.name}</h1>
                                {/* Fixed Badge colors for visibility in dark mode */}
                                <Badge color="bg-black text-white dark:bg-white dark:text-black mb-6 mt-2 shadow-sm">{userData.memberType}</Badge>
                             </>
                         )}
                         
                         <div className="w-full space-y-3 mt-auto bg-white/50 dark:bg-gray-800/80 p-4 rounded-xl border-2 border-black/10 dark:border-white/20 backdrop-blur-sm">
                             <div className="flex justify-between items-center border-b border-dashed border-gray-400 dark:border-gray-500 pb-2">
                                 <span className="font-mono text-gray-600 dark:text-gray-300 font-bold text-xs">ID NO.</span>
                                 {isEditing ? (
                                    <input 
                                        value={formData.idNo}
                                        onChange={e => setFormData({...formData, idNo: e.target.value})}
                                        className="w-24 p-1 border border-black text-right font-mono font-bold text-xs rounded bg-white text-black"
                                    />
                                 ) : (
                                     <span className="font-mono font-black dark:text-white">{userData.idNo}</span>
                                 )}
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="font-mono text-gray-600 dark:text-gray-300 font-bold text-xs">ISSUED</span>
                                 {isEditing ? (
                                    <input 
                                        value={formData.issued}
                                        onChange={e => setFormData({...formData, issued: e.target.value})}
                                        className="w-24 p-1 border border-black text-right font-mono font-bold text-xs rounded bg-white text-black"
                                    />
                                 ) : (
                                     <span className="font-mono font-black dark:text-white">{userData.issued}</span>
                                 )}
                             </div>
                         </div>
                         
                         {isEditing && (
                             <div className="mt-4 w-full">
                                <NeoButton onClick={handleSave} variant="success" className="w-full py-2">Save Changes</NeoButton>
                             </div>
                         )}
                         
                         {!isEditing && (
                             <div className="mt-6 w-full flex justify-center">
                                 <div className="p-2 bg-white border-2 border-black rounded-lg">
                                    <QrCode size={40} className="text-black" />
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
            </div>
        </div>
    );
};

// 5. MODALS

const DataSyncModal = ({ isOpen, onClose, onSync }) => {
    const fileInputRefDB = useRef(null);
    const fileInputRefWL = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (isWatchlist) => {
        const inputRef = isWatchlist ? fileInputRefWL : fileInputRefDB;
        const file = inputRef.current.files[0];
        if (file) {
            setLoading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                onSync(e.target.result, isWatchlist);
                setLoading(false);
            };
            reader.readAsText(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 border-4 border-black dark:border-white rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="bg-blue-100 dark:bg-blue-900 border-b-2 border-black dark:border-white p-4 flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold flex items-center gap-2 dark:text-white">
                        <Upload size={20} /> Sync Data
                    </h3>
                    <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 border-2 border-black dark:border-white hover:rotate-90 transition-transform">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Import your existing CSV files. The app will automatically fetch covers for titles without images in the background.
                    </p>

                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-black dark:border-white rounded-xl p-4 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <FileSpreadsheet className="text-green-600 dark:text-green-400" size={24} />
                                <div className="dark:text-white">
                                    <h4 className="font-bold text-sm">Database CSV</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Watched films</p>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                accept=".csv"
                                ref={fileInputRefDB}
                                onChange={() => handleFileUpload(false)}
                                disabled={loading}
                                className="w-full text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-black dark:file:border-white file:text-xs file:font-bold file:bg-white dark:file:bg-black file:text-black dark:file:text-white hover:file:bg-black hover:file:text-white transition-all cursor-pointer"
                            />
                        </div>

                        <div className="border-2 border-dashed border-black dark:border-white rounded-xl p-4 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <FileSpreadsheet className="text-purple-600 dark:text-purple-400" size={24} />
                                <div className="dark:text-white">
                                    <h4 className="font-bold text-sm">Watchlist CSV</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Films to watch</p>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                accept=".csv"
                                ref={fileInputRefWL}
                                onChange={() => handleFileUpload(true)}
                                disabled={loading}
                                className="w-full text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-black dark:file:border-white file:text-xs file:font-bold file:bg-white dark:file:bg-black file:text-black dark:file:text-white hover:file:bg-black hover:file:text-white transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                    {loading && <div className="text-center font-bold text-blue-600 animate-pulse">Processing...</div>}
                </div>
            </div>
        </div>
    );
};

const MovieDetailModal = ({ movie, onClose, onEdit }) => {
    if (!movie) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-900 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                {/* Poster Section */}
                <div className="w-full md:w-2/5 bg-gray-100 dark:bg-gray-800 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white relative min-h-[300px]">
                    <img 
                        src={movie.poster !== 'N/A' ? movie.poster : 'https://placehold.co/400x600?text=No+Poster'} 
                        className="w-full h-full object-cover absolute inset-0"
                        alt="Poster" 
                        onError={(e) => { e.target.src = 'https://placehold.co/400x600?text=No+Poster'; }}
                    />
                    <button className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors">
                         <ExternalLink size={16} />
                    </button>
                    {!movie.watched && (
                        <div className="absolute top-4 left-4">
                            <Badge color="bg-green-400 text-black border-black shadow-md">To Watch</Badge>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto bg-[#Fdfdfd] dark:bg-gray-900">
                    <div className="flex justify-between items-start mb-2">
                        <Badge color="bg-yellow-200 text-yellow-900 border-yellow-900">{movie.director || 'Unknown Director'}</Badge>
                        <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 border-2 border-black dark:border-white transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <h2 className="font-serif text-3xl md:text-4xl font-black mb-2 leading-tight dark:text-white">{movie.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">{movie.year} • {movie.genre || 'Film'} • {movie.runtime || 'N/A'}</p>

                    {movie.watched ? (
                        <div className="flex items-center gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star} 
                                    size={24} 
                                    className={`${star <= Math.round(movie.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                />
                            ))}
                            <span className="ml-2 font-bold text-lg dark:text-white">{movie.rating}/5</span>
                        </div>
                    ) : (
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 p-3 rounded-lg text-blue-800 dark:text-blue-300 text-sm font-bold flex items-center gap-2">
                            <Eye size={16} /> In Watchlist
                        </div>
                    )}

                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-dashed border-black/20 dark:border-white/20 p-4 rounded-xl mb-8 relative">
                         <span className="absolute -top-3 left-4 bg-yellow-300 border border-black px-2 py-0.5 text-[10px] font-bold uppercase text-black">My Notes</span>
                         <p className="font-serif italic text-lg text-gray-800 dark:text-gray-300 leading-relaxed">
                            "{movie.notes || 'No notes added yet.'}"
                         </p>
                    </div>

                    <div className="mt-auto pt-4 flex gap-4">
                        <NeoButton onClick={() => onEdit(movie)} variant="primary" className="flex-1 py-3 text-base">
                            <Edit3 size={18} /> Edit Entry
                        </NeoButton>
                        <NeoButton variant="danger" className="px-4">
                            <Trash2 size={18} />
                        </NeoButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditEntryModal = ({ movie, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '', year: '', director: '', rating: 0, notes: '', poster: '', folder: '', watched: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (movie) {
            setFormData(movie);
        } else {
            setFormData({ title: '', year: new Date().getFullYear(), director: '', rating: 0, notes: '', poster: '', folder: '', watched: true });
        }
    }, [movie, isOpen]);

    const handleFetch = async () => {
        if (!formData.title) return;
        setLoading(true);
        try {
            const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(formData.title)}&apikey=${OMDB_API_KEY}`);
            const data = await res.json();
            if (data.Response === 'True') {
                setFormData(prev => ({
                    ...prev,
                    title: data.Title,
                    year: parseInt(data.Year) || prev.year,
                    director: data.Director,
                    poster: data.Poster,
                    runtime: data.Runtime,
                    genre: data.Genre
                }));
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: movie?.id || generateId(), addedAt: movie?.addedAt || new Date().toISOString() });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 border-4 border-black dark:border-white rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="bg-[#00Dfa2] border-b-2 border-black dark:border-white p-4 flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-black">
                        {movie ? <Edit3 size={20} /> : <Plus size={20} />}
                        {movie ? 'Edit Entry' : 'New Log'}
                    </h3>
                    <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 border-2 border-black dark:border-white hover:rotate-90 transition-transform">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {/* Fetcher */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1 block">Movie Title</label>
                            <input 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full p-2.5 border-2 border-black dark:border-white rounded-lg font-bold outline-none focus:bg-yellow-50 dark:focus:bg-gray-800 transition-colors bg-white dark:bg-gray-800 dark:text-white"
                                placeholder="e.g. Interstellar"
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={handleFetch}
                            disabled={loading || !formData.title}
                            className="mt-6 px-4 bg-blue-500 text-white font-bold rounded-lg border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
                        >
                            {loading ? <Sparkles className="animate-spin" size={16}/> : 'Fetch'}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                         <label className="flex items-center gap-2 cursor-pointer select-none border-2 border-black dark:border-white rounded-lg p-2 flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                            <input 
                                type="checkbox" 
                                checked={formData.watched} 
                                onChange={e => setFormData({...formData, watched: e.target.checked})}
                                className="accent-black dark:accent-white w-5 h-5"
                            />
                            <span className="font-bold text-sm">Watched</span>
                         </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1 block">Year</label>
                            <input 
                                type="number"
                                value={formData.year}
                                onChange={e => setFormData({...formData, year: e.target.value})}
                                className="w-full p-2.5 border-2 border-black dark:border-white rounded-lg font-bold outline-none bg-white dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1 block">Director</label>
                            <input 
                                value={formData.director}
                                onChange={e => setFormData({...formData, director: e.target.value})}
                                className="w-full p-2.5 border-2 border-black dark:border-white rounded-lg font-bold outline-none bg-white dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {formData.watched && (
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1 block">Rating</label>
                            <div className="flex items-center gap-4 border-2 border-black dark:border-white p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                <input 
                                    type="range" min="0" max="5" step="0.5"
                                    value={formData.rating}
                                    onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
                                    className="flex-1 accent-black dark:accent-white h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="bg-yellow-400 border border-black px-2 py-1 rounded font-black min-w-[3rem] text-center text-black">
                                    {formData.rating}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1 block">Collection</label>
                        <select 
                            value={formData.folder || ''} 
                            onChange={e => setFormData({...formData, folder: e.target.value})}
                            className="w-full p-2.5 border-2 border-black dark:border-white rounded-lg font-bold outline-none bg-white dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">No Collection</option>
                            <option value="Ghibli Vibes">Ghibli Vibes</option>
                            <option value="Wes Anderson">Wes Anderson</option>
                            <option value="Horror 2025">Horror 2025</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1 block">Notes / Review</label>
                        <textarea 
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            rows={3}
                            className="w-full p-2.5 border-2 border-black dark:border-white rounded-lg font-medium outline-none resize-none bg-white dark:bg-gray-800 dark:text-white"
                            placeholder="What did you think?"
                        />
                    </div>

                    <div className="pt-2">
                        <NeoButton type="submit" className="w-full py-4 text-base bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black">
                            <Save size={18} /> Save Entry
                        </NeoButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 6. MAIN APP

export default function App() {
    // State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Initialize dark mode from localStorage
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('cine_darkmode');
        return saved ? JSON.parse(saved) : false;
    });
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('cine_user');
        return saved ? JSON.parse(saved) : DEFAULT_USER_DATA;
    });
    
    // Data State
    const [movies, setMovies] = useState(() => {
        const saved = localStorage.getItem('cine_movies');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map(m => ({ ...m, watched: m.watched !== undefined ? m.watched : true }));
        }
        return [
            { id: '1', title: 'Spirited Away', year: 2001, director: 'Hayao Miyazaki', rating: 5, poster: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', folder: 'Ghibli Vibes', notes: 'Masterpiece.', watched: true, addedAt: new Date().toISOString() },
            { id: '2', title: 'Grand Budapest Hotel', year: 2014, director: 'Wes Anderson', rating: 4.5, poster: 'https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_SX300.jpg', folder: 'Wes Anderson', notes: 'Symmetry!', watched: true, addedAt: new Date().toISOString() },
            { id: '3', title: 'Nosferatu', year: 2024, director: 'Robert Eggers', rating: 0, poster: 'https://upload.wikimedia.org/wikipedia/en/2/23/Nosferatu_2024_poster.jpeg', folder: 'Horror 2025', notes: 'Cannot wait for this.', watched: false, addedAt: new Date().toISOString() }
        ];
    });

    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('cine_tasks');
        return saved ? JSON.parse(saved) : [
            { id: 't1', text: 'Rewatch Interstellar', completed: false },
            { id: 't2', text: 'Buy tickets for Wicked', completed: true },
        ];
    });

    const [folders, setFolders] = useState([
        { id: 'f1', name: 'Ghibli Vibes', count: 1, color: 'bg-pink-100 dark:bg-pink-900', tabColor: '#F472B6', icon: 'heart' },
        { id: 'f2', name: 'Wes Anderson', count: 1, color: 'bg-yellow-100 dark:bg-yellow-900', tabColor: '#FACC15', icon: 'film' },
        { id: 'f3', name: 'Horror 2025', count: 1, color: 'bg-purple-100 dark:bg-purple-900', tabColor: '#A855F7', icon: 'ghost' },
        { id: 'f4', name: 'Classics', count: 0, color: 'bg-blue-100 dark:bg-blue-900', tabColor: '#60A5FA', icon: 'star' },
        { id: 'f5', name: 'Watchlist', count: 0, color: 'bg-green-100 dark:bg-green-900', tabColor: '#4ADE80', icon: 'eye' },
    ]);

    // Modal State
    const [selectedMovie, setSelectedMovie] = useState(null); // For Detail View
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For Edit Form
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false); // For CSV Sync
    const [movieToEdit, setMovieToEdit] = useState(null); // Data for Edit Form

    // Effects
    useEffect(() => { localStorage.setItem('cine_movies', JSON.stringify(movies)); }, [movies]);
    useEffect(() => { localStorage.setItem('cine_tasks', JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem('cine_user', JSON.stringify(userData)); }, [userData]);
    useEffect(() => { localStorage.setItem('cine_darkmode', JSON.stringify(darkMode)); }, [darkMode]);

    // Handlers
    const handleAddMovie = () => {
        setMovieToEdit(null);
        setIsEditModalOpen(true);
    };

    const handleEditMovie = (movie) => {
        setSelectedMovie(null); // Close detail modal
        setMovieToEdit(movie);
        setIsEditModalOpen(true);
    };

    const handleSaveMovie = (movie) => {
        setMovies(prev => {
            const exists = prev.find(m => m.id === movie.id);
            if (exists) return prev.map(m => m.id === movie.id ? movie : m);
            return [movie, ...prev];
        });
        setIsEditModalOpen(false);
    };

    const handleSyncData = async (csvContent, isWatchlist) => {
        try {
            const newItems = parseCSV(csvContent, isWatchlist);
            
            // 1. Immediate Update & Persistence
            let currentMovies = [];
            setMovies(prev => {
                currentMovies = [...prev, ...newItems];
                return currentMovies;
            });
            
            localStorage.setItem('cine_movies', JSON.stringify(currentMovies));
            setIsSyncModalOpen(false);

            // 2. Background Fetch for Metadata
            const itemsToFetch = newItems.filter(i => i.poster === 'N/A');
            
            if (itemsToFetch.length > 0) {
                (async () => {
                    for (const item of itemsToFetch) {
                        try {
                            const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(item.title)}&apikey=${OMDB_API_KEY}`);
                            const data = await res.json();
                            
                            if (data.Response === 'True') {
                                setMovies(prev => {
                                    const updated = prev.map(m => {
                                        if (m.id === item.id) {
                                            return {
                                                ...m,
                                                poster: data.Poster !== "N/A" ? data.Poster : m.poster,
                                                year: data.Year || m.year,
                                                director: data.Director || m.director,
                                                genre: data.Genre || m.genre
                                            };
                                        }
                                        return m;
                                    });
                                    // Save progress incrementally
                                    localStorage.setItem('cine_movies', JSON.stringify(updated));
                                    return updated;
                                });
                            }
                        } catch (e) { console.error(e); }
                        await new Promise(r => setTimeout(r, 200));
                    }
                })();
            }
            alert(`Imported ${newItems.length} items. Covers are updating in the background...`);
        } catch (error) {
            console.error(error);
            alert("Error parsing CSV. Please check the file format.");
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.length > 0 && activeTab !== 'database' && activeTab !== 'watchlist') {
            setActiveTab('database');
        }
    };

    // Derived Data
    const folderCounts = useMemo(() => {
        const counts = {};
        movies.forEach(m => {
            if (m.folder) counts[m.folder] = (counts[m.folder] || 0) + 1;
        });
        return counts;
    }, [movies]);

    // Sync counts to folders object for display
    useEffect(() => {
        setFolders(prev => prev.map(f => ({ ...f, count: folderCounts[f.name] || 0 })));
    }, [folderCounts]);

    return (
        <div className={`flex h-screen font-sans overflow-hidden relative ${darkMode ? 'dark' : ''}`}>
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 bg-blue-50 dark:bg-gray-950 transition-colors duration-300">
                <div 
                    className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10"
                    style={{ 
                        backgroundImage: `linear-gradient(${darkMode ? '#444' : '#fff'} 2px, transparent 2px), linear-gradient(90deg, ${darkMode ? '#444' : '#fff'} 2px, transparent 2px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onSyncClick={() => setIsSyncModalOpen(true)}
                darkMode={darkMode}
                toggleDarkMode={() => setDarkMode(!darkMode)}
            />

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 flex flex-col h-full relative z-10 overflow-hidden text-gray-900 dark:text-white">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-gray-900 border-b-2 border-black dark:border-white flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                         <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg dark:text-white">
                            <Menu size={24} />
                        </button>
                        <div className="hidden md:block">
                            <h2 className="font-serif text-3xl font-bold dark:text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatDate(new Date())}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <div className="hidden md:block w-64">
                            <SearchBar value={searchQuery} onSearch={handleSearch} />
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-full pl-1 pr-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-gray-200 border border-black dark:border-white overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="avatar" />
                            </div>
                            <span className="font-bold text-sm dark:text-white">MOVIEBUFF</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable View Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto pb-20">
                        {activeTab === 'dashboard' && (
                            <Dashboard 
                                movies={movies} 
                                tasks={tasks} 
                                setTasks={setTasks}
                                onAddMovie={handleAddMovie}
                                onMovieClick={setSelectedMovie}
                                userData={userData}
                            />
                        )}
                        {activeTab === 'collections' && (
                            <CollectionsView 
                                folders={folders} 
                                onAddFolder={() => alert("Feature coming soon!")}
                                onFolderClick={(name) => { setSearchQuery(name); setActiveTab('database'); }}
                            />
                        )}
                        {activeTab === 'database' && (
                            <DatabaseView 
                                movies={movies} 
                                searchQuery={searchQuery}
                                onMovieClick={setSelectedMovie}
                                isWatchlistMode={false}
                            />
                        )}
                        {activeTab === 'watchlist' && (
                            <DatabaseView 
                                movies={movies} 
                                searchQuery={searchQuery}
                                onMovieClick={setSelectedMovie}
                                isWatchlistMode={true}
                            />
                        )}
                         {activeTab === 'statistics' && (
                            <StatisticsView movies={movies} />
                        )}
                        {activeTab === 'idcard' && (
                            <IDCardView userData={userData} setUserData={setUserData} />
                        )}
                    </div>
                </div>

                {/* Mobile Floating Action Button */}
                <button 
                    onClick={handleAddMovie}
                    className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full border-2 border-white dark:border-black shadow-xl flex items-center justify-center z-30"
                >
                    <Plus size={24} />
                </button>
            </main>

            {/* Modals */}
            <MovieDetailModal 
                movie={selectedMovie} 
                onClose={() => setSelectedMovie(null)} 
                onEdit={handleEditMovie}
            />
            
            <EditEntryModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                movie={movieToEdit}
                onSave={handleSaveMovie}
            />

            <DataSyncModal 
                isOpen={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                onSync={handleSyncData}
            />

<<<<<<< HEAD
=======

>>>>>>> 861c437 (Update app.jsx)
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Grotesk:wght@400;500;700&display=swap');
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? '#fff' : '#000'}; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> 861c437 (Update app.jsx)
