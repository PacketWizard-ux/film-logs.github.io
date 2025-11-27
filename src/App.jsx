import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, Plus, Search, Film, Star, 
  Trash2, BookOpen, Quote, Clapperboard, 
  User, X, Edit3, CheckSquare, 
  Music, Clock, Grid, List, Filter, Heart, Upload, Calendar,
  Tv, BarChart3, Download, Trophy, Award, Sparkles, SortAsc,
  Moon, Sun, Eye, FolderPlus, ArrowRight, Save, FileJson, AlertCircle, PlayCircle,
  Smile, Meh, Frown, Menu
} from 'lucide-react';

// --- Assets & Constants ---

const AVATARS = [
  { id: 'pikachu', name: 'Sparky', color: 'bg-yellow-300', icon: '⚡' },
  { id: 'gengar', name: 'Shadow', color: 'bg-purple-400', icon: '👻' },
  { id: 'charizard', name: 'Blaze', color: 'bg-orange-400', icon: '🔥' },
  { id: 'squirtle', name: 'Splash', color: 'bg-blue-300', icon: '💧' },
  { id: 'bulbasaur', name: 'Leafy', color: 'bg-green-300', icon: '🍃' },
  { id: 'eevee', name: 'Vee', color: 'bg-amber-200', icon: '🦊' },
  { id: 'jiggly', name: 'Singer', color: 'bg-pink-200', icon: '🎤' },
  { id: 'snorlax', name: 'Dozer', color: 'bg-teal-200', icon: '💤' },
];

const ROULETTE_OPTIONS = ['Sci-Fi', 'Biopic', 'Rom-Com', 'Horror', 'Indie', 'Anime', 'Documentary', 'Thriller'];

// --- Seed Data (Matches your database.json) ---
const SEED_DATA = {
  user: {
    name: "Admin",
    role: "PRO",
    avatar: { id: "snorlax", name: "Dozer", color: "bg-teal-200", icon: "💤" }
  },
  movies: [
    {
      id: 1,
      title: "Fallout",
      year: 2024,
      director: "Jonathan Nolan",
      type: "TV Series",
      season: "Season 1",
      rating: 4.5,
      watched: true,
      poster: "https://image.tmdb.org/t/p/w500/8c0ap7rG6S513yv6gN8xJ27T28.jpg",
      notes: "\"War never changes.\" A masterpiece adaptation.",
      genre: "Sci-Fi",
      date: "2024-04-12",
      folder: "Sci-Fi"
    },
    {
      id: 2,
      title: "Dune: Part Two",
      year: 2024,
      director: "Denis Villeneuve",
      type: "Film / Movie",
      rating: 5,
      watched: true,
      poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      notes: "\"Visual perfection. Lisan al Gaib!\"",
      genre: "Sci-Fi",
      date: "2024-03-05",
      folder: "Sci-Fi"
    },
    {
      id: 3,
      title: "Spirited Away",
      year: 2001,
      director: "Hayao Miyazaki",
      type: "Anime",
      rating: 5,
      watched: true,
      poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUKGudW53yY.jpg",
      notes: "Pure magic.",
      genre: "Fantasy",
      date: "2024-01-10",
      folder: "Ghibli Vibes"
    }
  ],
  watchlist: [
    {
      id: 101,
      title: "Poor Things",
      year: 2023,
      type: "Film / Movie",
      poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxc.jpg"
    }
  ],
  journals: [
    {
      id: 201,
      title: "Why I love Cinema",
      date: "2024-11-01",
      displayDate: "Friday | 1st November, 2024",
      text: "Cinema is more than just entertainment. It is a window into the soul of humanity. Today I realized how much lighting affects emotion...",
      mood: "happy"
    }
  ],
  folders: [
    { id: 1, name: "Sci-Fi", count: 2 },
    { id: 2, name: "Ghibli Vibes", count: 1 }
  ]
};

// --- Utility Components ---

const NeoCard = ({ children, className = "", onClick, noShadow = false, style = {} }) => (
  <div 
    onClick={onClick}
    style={style}
    className={`
      border-2 border-black rounded-xl p-4 transition-all duration-200 relative isolate
      ${!noShadow ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-0.5 z-0 hover:z-20 cursor-pointer active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    pink: "bg-pink-100 text-pink-900 dark:bg-pink-900 dark:text-pink-100",
    yellow: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
    blue: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
    purple: "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
    green: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
    black: "bg-black text-white dark:bg-white dark:text-black",
    orange: "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md border border-black text-[10px] font-bold uppercase tracking-wide ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const CustomDatePicker = ({ value, onChange, className, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Safety check for date value
    const safeDate = value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date();
    
    // Format: "Thursday | 26th April, 2025"
    const dayName = safeDate.toLocaleDateString('en-US', { weekday: 'long' });
    const fullDate = safeDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    const handleDateChange = (e) => {
        onChange(e.target.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 border-2 border-black rounded-xl flex items-center justify-between cursor-pointer transition-colors ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
            >
                <div className="flex items-center gap-3">
                    <span className={`font-black text-sm uppercase tracking-wider border-r-2 pr-3 ${darkMode ? 'text-purple-400 border-gray-600' : 'text-purple-600 border-gray-200'}`}>{dayName}</span>
                    <span className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{fullDate}</span>
                </div>
                <Calendar size={16} className="text-gray-400" />
            </div>
            
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">Select Date</label>
                    <input 
                        type="date" 
                        value={value} 
                        onChange={handleDateChange}
                        className="w-full p-2 border-2 border-gray-200 rounded-lg font-mono text-sm outline-none focus:border-black transition-colors"
                    />
                </div>
            )}
        </div>
    );
};

const TiltCard = ({ children }) => {
  const [transform, setTransform] = useState('');
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };
  return (
    <div 
      onMouseMove={handleMouseMove} 
      onMouseLeave={() => setTransform('')}
      style={{ transform, transition: 'transform 0.15s ease-out', transformStyle: 'preserve-3d' }}
      className="h-full w-full relative z-0 hover:z-30"
    >
      {children}
    </div>
  );
};

// --- Sub-Components ---

const Sidebar = ({ activeTab, setActiveTab, darkMode, setDarkMode }) => (
  <div className={`w-64 border-r-2 border-black flex flex-col h-screen fixed left-0 top-0 z-50 hidden md:flex font-sans transition-colors duration-300 ${darkMode ? 'bg-[#0f0c29] border-gray-700' : 'bg-white'}`}>
    <div onClick={() => setActiveTab('dashboard')} className={`h-20 border-b-2 border-black flex items-center px-6 shrink-0 cursor-pointer transition-colors ${darkMode ? 'bg-[#1a1a2e] border-gray-700' : 'bg-[#FFD700] hover:bg-[#ffe033]'}`}>
      <div className="flex items-center gap-2 group select-none">
        <Clapperboard size={28} className={`fill-black text-black group-hover:animate-bounce ${darkMode ? 'text-white fill-white' : ''}`} />
        <h1 className={`font-serif font-black text-2xl tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>CineFolder</h1>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 group-hover:rotate-12 transition-transform ${darkMode ? 'bg-black text-yellow-400' : 'bg-black text-[#FFD700]'}`}>PRO</span>
      </div>
    </div>

    <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
      {[
        { id: 'dashboard', label: 'Dashboard', icon: Grid },
        { id: 'database', label: 'Film Database', icon: Film },
        { id: 'watchlist', label: 'Watchlist', icon: Eye },
        { id: 'collections', label: 'Collections', icon: Folder },
        { id: 'journal', label: 'Journal', icon: BookOpen },
        { id: 'admin', label: 'Admin Dashboard', icon: User },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`
            w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200
            ${activeTab === item.id 
              ? (darkMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/20 shadow-[0px_0px_15px_rgba(124,58,237,0.5)] translate-x-1' : 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] translate-x-1') 
              : (darkMode ? 'text-gray-300 border-transparent hover:border-gray-600 hover:bg-white/5' : 'bg-white text-gray-700 border-transparent hover:border-gray-200 hover:bg-gray-50 hover:translate-x-1')}
          `}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>

    <div className="p-6 shrink-0 mt-auto">
        <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`w-full mb-4 flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-bold text-xs transition-all ${darkMode ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10' : 'border-black text-black hover:bg-gray-100'}`}
        >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

      <div className={`rounded-xl p-4 border-2 shadow-lg relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 ${darkMode ? 'bg-black border-gray-700 text-white' : 'bg-black text-white border-gray-800'}`}>
         <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-20 group-hover:opacity-30 transition-opacity"></div>
         <div className="relative z-10 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-black animate-spin-slow shrink-0">
             <Music size={16} />
           </div>
           <div className="overflow-hidden">
             <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Now Playing</p>
             <p className="text-xs font-bold truncate">Cornfield Chase</p>
           </div>
         </div>
      </div>
    </div>
  </div>
);

// New Mobile Bottom Navigation
const BottomNav = ({ activeTab, setActiveTab, darkMode }) => (
    <div className={`md:hidden fixed bottom-0 left-0 w-full h-20 border-t-2 border-black z-50 flex justify-around items-center px-2 pb-2 ${darkMode ? 'bg-[#0f0c29] border-gray-700' : 'bg-white'}`}>
        {[
            { id: 'dashboard', icon: Grid, label: 'Dash' },
            { id: 'database', icon: Film, label: 'Films' },
            { id: 'watchlist', icon: Eye, label: 'List' },
            { id: 'collections', icon: Folder, label: 'Folders' },
            { id: 'admin', icon: User, label: 'Profile' },
        ].map(item => (
            <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${activeTab === item.id ? (darkMode ? 'text-yellow-400 bg-white/10' : 'text-black bg-gray-100') : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}
            >
                <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
                <span className="text-[9px] font-bold mt-1">{item.label}</span>
            </button>
        ))}
    </div>
);

const TopBar = ({ title, user, searchQuery, setSearchQuery, setShowAddModal, movies, darkMode, setActiveTab, activeTab }) => {
    const searchRef = useRef(null);
    const [showResults, setShowResults] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const filteredResults = movies.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 3);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

    // Handle "View All" click
    const handleViewAll = () => {
        setActiveTab('database');
        setShowResults(false);
    };

    return (
      <div className={`h-20 border-b-2 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-sm shrink-0 transition-colors duration-300 ${darkMode ? 'bg-[#0f0c29] border-gray-700' : 'bg-white border-black'}`}>
        {/* Mobile Header */}
        <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 bg-[#FFD700] rounded-lg border-2 border-black flex items-center justify-center">
                <Clapperboard size={16} className="text-black" />
            </div>
            <h2 className={`font-serif text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{title}</h2>
        </div>

        {/* Desktop Title */}
        <h2 className={`font-serif text-3xl font-bold animate-in slide-in-from-top-4 hidden md:block ${darkMode ? 'text-white' : 'text-black'}`}>{title}</h2>
        
        <div className="flex items-center gap-4 relative">
          
          {/* Mobile Search Toggle */}
          <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className={`md:hidden p-2 rounded-full ${darkMode ? 'text-white' : 'text-black'}`}>
              <Search size={20} />
          </button>

          {/* Desktop Search */}
          <div className="relative hidden md:block group z-50" ref={searchRef}>
             <input 
               value={searchQuery}
               onFocus={() => setShowResults(true)}
               onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
               placeholder="Search database..." 
               className={`pl-11 pr-4 py-2.5 rounded-full border-2 font-medium transition-all w-72 text-sm focus:outline-none focus:w-96 ${darkMode ? 'bg-white/10 border-gray-600 text-white focus:bg-gray-800 shadow-none' : 'bg-gray-50 border-black focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white'}`}
             />
             <Search size={18} className="absolute left-4 top-3 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
             
             {showResults && searchQuery.length > 0 && (
                <div className="absolute top-16 right-0 w-96 animate-in slide-in-from-top-2 fade-in duration-300 z-[60]">
                    <div className={`border-2 rounded-xl p-3 shadow-xl ${darkMode ? 'bg-[#24243e] border-gray-600' : 'bg-white border-black'}`}>
                        <div className="flex items-center justify-between mb-2 px-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Quick Results</span>
                            <button className="text-[10px] font-bold text-purple-500 cursor-pointer hover:underline" onClick={handleViewAll}>View All</button>
                        </div>
                        {filteredResults.length > 0 ? filteredResults.map(m => (
                            <div key={m.id} onClick={() => { setSearchQuery(m.title); setShowResults(false); setActiveTab('database'); }} className={`p-2 rounded-lg cursor-pointer flex items-center gap-3 mb-1 transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <div className="w-8 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    <img src={m.poster} className="w-full h-full object-cover" onError={(e) => e.target.src='https://placehold.co/100x150?text=NA'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-black'}`}>{m.title}</p>
                                    <p className="text-[10px] opacity-60">{m.year} • {m.type}</p>
                                </div>
                                <ArrowRight size={14} className="ml-auto opacity-50" />
                            </div>
                        )) : (
                            <div className="p-4 text-xs opacity-50 text-center font-bold">No results found for "{searchQuery}"</div>
                        )}
                    </div>
                </div>
             )}
          </div>
    
          <button onClick={() => setShowAddModal(true)} className={`hidden md:flex w-10 h-10 rounded-full border-2 items-center justify-center hover:scale-110 transition-transform active:shadow-none active:translate-y-0.5 ${darkMode ? 'bg-purple-600 border-white/20 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'bg-pink-400 border-black text-black shadow-[2px_2px_0px_0px_#000]'}`}>
             <Plus size={20} strokeWidth={3} />
          </button>
    
          <div onClick={() => setActiveTab('admin')} className={`hidden md:flex items-center gap-3 border-2 rounded-full pl-1.5 pr-5 py-1.5 cursor-pointer transition-all active:translate-y-0.5 active:shadow-none ${darkMode ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-white border-black hover:bg-gray-50 hover:shadow-[3px_3px_0px_0px_#000]'}`}>
            <div className={`${user?.avatar?.color || 'bg-gray-200'} w-9 h-9 rounded-full border border-black flex items-center justify-center text-xl shadow-sm`}>
              {user?.avatar?.icon || '👤'}
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role || 'User'}</span>
              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{user?.name || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {mobileSearchOpen && (
            <div className="absolute top-20 left-0 w-full bg-white border-b-2 border-black p-4 z-50 animate-in slide-in-from-top-2">
                <input 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..." 
                    className="w-full p-3 border-2 border-black rounded-xl font-bold outline-none"
                />
                {searchQuery && (
                    <div className="mt-2 space-y-2">
                        {filteredResults.map(m => (
                            <div key={m.id} onClick={() => { setSearchQuery(m.title); setMobileSearchOpen(false); setActiveTab('database'); }} className="p-2 border-b flex justify-between">
                                <span>{m.title}</span>
                                <span className="text-gray-400 text-xs">Go</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    );
};

const Dashboard = ({ movies, watchlist, user, setActiveTab, setShowAddModal, darkMode }) => {
    const [spinResult, setSpinResult] = useState('???');
    const [isSpinning, setIsSpinning] = useState(false);

    const handleSpin = () => {
        setIsSpinning(true);
        let count = 0;
        const interval = setInterval(() => {
          setSpinResult(ROULETTE_OPTIONS[Math.floor(Math.random() * ROULETTE_OPTIONS.length)]);
          count++;
          if (count > 15) {
            clearInterval(interval);
            setIsSpinning(false);
          }
        }, 100);
    };

    // Calculate Streak (Simulated for Demo)
    const streak = 12; 

    return (
      <div className="p-4 md:p-8 space-y-6 md:space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
        
        {/* Welcome Hero */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className={`flex-1 rounded-3xl p-6 md:p-8 border-2 relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-indigo-500 text-white' : 'bg-black text-white border-black'}`}>
                <div className="relative z-10">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.name || 'Friend'}.</h2>
                    <p className="opacity-80 max-w-md mb-6 font-medium text-sm md:text-base">You've watched {movies.length} titles. Keep the streak alive!</p>
                    <div className="flex gap-3 md:gap-4">
                        <button onClick={() => setShowAddModal(true)} className={`px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 hover:scale-105 transition-transform ${darkMode ? 'bg-white text-black' : 'bg-white text-black'}`}>
                            <Plus size={16} /> Log Entry
                        </button>
                        <button onClick={() => setActiveTab('database')} className={`px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 border-2 hover:bg-white/10 transition-colors ${darkMode ? 'border-white/30 text-white' : 'border-white text-white'}`}>
                            <Film size={16} /> Browse DB
                        </button>
                    </div>
                </div>
                <Sparkles className="absolute top-4 right-4 opacity-20" size={120} />
            </div>

            {/* Decision Paralysis Widget (Restored) */}
            <NeoCard className={`w-full md:w-1/3 flex flex-col items-center justify-center text-center p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${darkMode ? 'bg-[#24243e] border-gray-600' : 'bg-gradient-to-br from-pink-50 to-blue-50 border-black'}`}>
                <h3 className={`font-bold mb-2 text-[10px] uppercase tracking-[0.2em] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Decision Paralysis?</h3>
                <div className="h-16 md:h-20 flex items-center justify-center my-2 relative w-full">
                    <div className={`absolute inset-0 rounded-full blur-2xl transition-colors ${isSpinning ? 'bg-purple-500/20' : 'bg-transparent'}`}></div>
                    <div className={`font-serif text-2xl md:text-3xl font-black relative z-10 transition-all ${isSpinning ? 'text-purple-600 scale-110' : darkMode ? 'text-white' : 'text-black'}`}>
                        {spinResult}
                    </div>
                </div>
                <button 
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className={`w-full font-black text-xs py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-md active:translate-y-0.5 active:shadow-none ${darkMode ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                    {isSpinning ? 'Spinning...' : 'Spin Genre'}
                </button>
            </NeoCard>
        </div>
    
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-end">
                <h3 className={`font-serif text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Recent Activity
                </h3>
                <span className="text-xs font-bold text-purple-500 cursor-pointer hover:underline" onClick={() => setActiveTab('database')}>See all</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {movies.slice(0, 4).map(movie => (
                    <NeoCard key={movie.id} className={`flex gap-5 p-4 cursor-pointer group h-full items-center ${darkMode ? 'bg-[#1a1a2e] border-gray-600 hover:bg-[#202040]' : 'bg-white hover:bg-gray-50'}`}>
                    <div className={`overflow-hidden rounded-lg border-2 shadow-sm w-20 h-28 flex-shrink-0 relative ${darkMode ? 'border-gray-500' : 'border-black'}`}>
                        <img 
                            src={movie.poster} 
                            onError={(e) => { e.target.src='https://placehold.co/300x450/pink/black?text=No+Img'; }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                    </div>
                    <div className="flex flex-col justify-center py-1 min-w-0 h-full flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge color={movie.type === 'TV Series' ? 'purple' : 'green'}>{movie.type === 'TV Series' ? 'SERIES' : 'FILM'}</Badge>
                            <span className="text-[10px] font-bold text-gray-400">{movie.year}</span>
                        </div>
                        <h4 className={`font-bold text-lg leading-tight truncate font-serif mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{movie.title}</h4>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={12} fill="currentColor"/> <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-black'}`}>{movie.rating}</span>
                        </div>
                    </div>
                    </NeoCard>
                ))}
            </div>
          </div>
    
          <div className="space-y-6">
            <h3 className={`font-serif text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Stats</h3>
            
            {/* Streak Widget */}
            <NeoCard className={`p-5 ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-white border-black'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600"><Award size={18} /></div>
                        <div>
                            <p className="text-[10px] font-bold uppercase opacity-60">Cinema Level</p>
                            <p className={`font-bold text-lg leading-none ${darkMode ? 'text-white' : 'text-black'}`}>Level {Math.floor(movies.length / 5) + 1}</p>
                        </div>
                    </div>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-orange-500 w-[60%]"></div>
                </div>
            </NeoCard>

            {/* Watchlist Glance */}
            <div className={`rounded-xl border-2 overflow-hidden ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-white border-black'}`}>
                <div className={`p-3 text-xs font-bold uppercase border-b-2 flex justify-between ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-black'}`}>
                    <span>Up Next</span>
                    <span className="text-purple-500">{watchlist.length}</span>
                </div>
                {watchlist.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className={`p-3 flex items-center justify-between ${idx !== watchlist.slice(0,3).length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={`text-sm font-bold truncate max-w-[150px] ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.title}</span>
                        </div>
                    </div>
                ))}
                <div onClick={() => setActiveTab('watchlist')} className={`p-3 text-center text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 border-t-2 ${darkMode ? 'border-gray-600 text-gray-400' : 'border-black text-gray-500'}`}>
                    View All
                </div>
            </div>
          </div>
        </div>
      </div>
    );
};

const FilmDatabase = ({ movies, darkMode, searchQuery, currentFolder, clearFolderFilter }) => {
    let filtered = movies.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    if (currentFolder) {
        filtered = filtered.filter(m => m.folder === currentFolder);
    }
    
    const [sortMethod, setSortMethod] = useState('date'); // 'date' or 'rating'

    const sorted = [...filtered].sort((a, b) => {
        if (sortMethod === 'rating') return b.rating - a.rating;
        return new Date(b.date) - new Date(a.date);
    });

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <h3 className={`font-serif text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Film Database</h3>
                    {currentFolder && (
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
                            Folder: {currentFolder}
                            <X size={14} className="cursor-pointer hover:text-purple-900" onClick={clearFolderFilter} />
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setSortMethod(sortMethod === 'date' ? 'rating' : 'date')} className={`flex items-center gap-2 px-3 py-1.5 border-2 rounded-lg font-bold text-sm transition-all ${darkMode ? 'border-gray-600 text-white hover:bg-gray-800' : 'border-black bg-white hover:bg-gray-50'}`}>
                        <SortAsc size={14} /> {sortMethod === 'date' ? 'Sort: Date' : 'Sort: Rating'}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sorted.map(movie => (
                    <NeoCard key={movie.id} className={`group ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-white'}`}>
                        <div className="aspect-[2/3] overflow-hidden rounded-lg border-2 border-black/10 relative mb-3">
                            <img src={movie.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src='https://placehold.co/300x450/pink/black?text=No+Img'; }} />
                            <div className="absolute top-2 right-2">
                                <Badge color="yellow">{movie.rating}</Badge>
                            </div>
                            <button className="absolute bottom-2 right-2 bg-white/80 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110">
                                <Heart size={16} fill="currentColor" />
                            </button>
                        </div>
                        <h4 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-black'}`}>{movie.title}</h4>
                        <p className="text-xs text-gray-500">{movie.year} • {movie.director}</p>
                        <div className="mt-2 flex gap-1 flex-wrap">
                            <span className="text-[10px] border px-1 rounded opacity-50 dark:border-gray-500 dark:text-gray-400">{movie.folder || 'Unsorted'}</span>
                        </div>
                    </NeoCard>
                ))}
                {sorted.length === 0 && <div className="col-span-full text-center py-20 text-gray-500 italic">No movies found.</div>}
            </div>
        </div>
    );
};

const Watchlist = ({ watchlist, darkMode, setShowAddModal, setIsWatchlistMode, onDelete }) => {
    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h3 className={`font-serif text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Watchlist</h3>
                <button onClick={() => { setIsWatchlistMode(true); setShowAddModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-500 transition-colors shadow-lg hover:shadow-purple-500/50">
                    <Plus size={16}/> Add Title
                </button>
            </div>
            
            <div className="space-y-4">
                {watchlist.map(item => (
                    <div key={item.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-transform hover:translate-x-1 ${darkMode ? 'bg-[#1a1a2e] border-gray-600 text-white' : 'bg-white border-black'}`}>
                        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img src={item.poster} className="w-full h-full object-cover" onError={(e) => { e.target.src='https://placehold.co/300x450/pink/black?text=No+Img'; }}/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg">{item.title}</h4>
                            <p className="text-xs opacity-60">{item.year} • {item.type}</p>
                        </div>
                        <button onClick={() => onDelete(item.id)} className={`px-4 py-2 rounded-lg font-bold text-xs border-2 flex items-center gap-2 transition-all active:translate-y-0.5 ${darkMode ? 'bg-green-600 border-green-800 text-white hover:bg-green-500' : 'bg-[#00Dfa2] border-black text-black hover:bg-[#00c48f]'}`}>
                            <CheckSquare size={14} /> <span className="hidden md:inline">Mark Watched</span>
                        </button>
                    </div>
                ))}
                {watchlist.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Eye size={48} className="mx-auto mb-4" />
                        <p>Your watchlist is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Collections = ({ folders, darkMode, onFolderClick, onDeleteFolder, onAddFolder }) => (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
        <h3 className={`font-serif text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-black'}`}>Collections</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {folders.map(f => (
                <div key={f.id} className="relative group">
                    <TiltCard>
                        <NeoCard onClick={() => onFolderClick(f.name)} className={`aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer group/card ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-white hover:bg-gray-50'}`}>
                            {/* Mac-Style Folder Icon */}
                            <div className="relative w-20 h-16 transition-transform group-hover/card:scale-110">
                                <div className={`absolute top-0 left-0 w-full h-full rounded-lg shadow-md ${darkMode ? 'bg-blue-600' : 'bg-[#4facfe]'} z-10`}></div>
                                <div className={`absolute -top-1.5 left-0 w-1/2 h-3 rounded-t-md ${darkMode ? 'bg-blue-500' : 'bg-[#4facfe]'}`}></div>
                                <div className="absolute top-2 left-2 right-2 bottom-2 bg-white/20 rounded z-20 backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-white font-black text-xl drop-shadow-md">{f.name[0]}</span>
                                </div>
                            </div>
                            <h4 className={`font-bold text-center mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>{f.name}</h4>
                            <span className="text-[10px] opacity-50 font-bold">{f.count} items</span>
                        </NeoCard>
                    </TiltCard>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteFolder(f.id); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-all z-30 border border-white"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
            <NeoCard 
                onClick={onAddFolder}
                className={`aspect-square border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer opacity-50 hover:opacity-100 ${darkMode ? 'border-gray-600 text-gray-400' : 'border-black text-gray-500'}`}
            >
                <FolderPlus size={32} />
                <span className="text-xs font-bold">New Folder</span>
            </NeoCard>
        </div>
    </div>
);

const Journal = ({ journals, setJournals, setShowJournalModal, darkMode }) => {
    const [selectedEntry, setSelectedEntry] = useState(null);

    return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className={`font-serif text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Mindful Journal</h3>
                <p className="text-gray-500 text-sm mt-1">Reflect on your cinematic journey.</p>
            </div>
            <button 
                onClick={() => setShowJournalModal(true)}
                className={`px-4 py-2 rounded-lg font-bold border-2 flex items-center gap-2 shadow-md active:translate-y-0.5 transition-all ${darkMode ? 'bg-purple-600 border-purple-800 text-white hover:bg-purple-500' : 'bg-purple-100 border-black text-purple-900 hover:bg-purple-200'}`}
            >
                <Edit3 size={16} /> New Entry
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map(j => (
                <NeoCard key={j.id} onClick={() => setSelectedEntry(j)} className={`min-h-[220px] flex flex-col relative group cursor-pointer hover:scale-[1.02] ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-[#fffdf5]'}`}>
                    <div className={`w-full h-10 border-b-2 flex items-center px-4 gap-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-[#f0f0f0] border-black'}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-black/10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black/10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-black/10"></div>
                        <div className="ml-auto text-[10px] font-mono opacity-50 font-bold">{j.displayDate}</div>
                    </div>
                    <div className="p-6 flex-1 relative">
                        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `linear-gradient(${darkMode ? '#ffffff' : '#000000'} 1px, transparent 1px)`, backgroundSize: '100% 28px', marginTop: '40px' }}></div>
                        
                        <div className="flex items-center gap-2 mb-2">
                            {j.mood === 'happy' && <Smile size={16} className="text-green-500"/>}
                            {j.mood === 'neutral' && <Meh size={16} className="text-yellow-500"/>}
                            {j.mood === 'sad' && <Frown size={16} className="text-blue-500"/>}
                        </div>

                        <h4 className={`font-serif font-bold text-xl mb-3 relative z-10 leading-tight ${darkMode ? 'text-white' : 'text-black'}`}>{j.title}</h4>
                        <p className={`text-sm font-serif leading-[28px] line-clamp-4 relative z-10 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{j.text}</p>
                    </div>
                </NeoCard>
            ))}
        </div>

        {/* Read Mode Modal */}
        {selectedEntry && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in zoom-in-95">
                <div className={`w-full max-w-2xl border-4 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[80vh] ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-[#fffdf5] border-black'}`}>
                    <div className={`p-6 border-b-2 flex justify-between items-center ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-[#fff8e1] border-black'}`}>
                        <div>
                            <h3 className={`font-serif text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{selectedEntry.title}</h3>
                            <p className="text-xs opacity-60 font-mono mt-1">{selectedEntry.displayDate}</p>
                        </div>
                        <button onClick={() => setSelectedEntry(null)} className="bg-red-500 text-white rounded-full p-2 border-2 border-black hover:scale-110 transition-transform"><X size={20}/></button>
                    </div>
                    <div className="p-8 overflow-y-auto">
                        <p className={`text-lg font-serif leading-loose whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEntry.text}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

const AdminProfile = ({ user, setUser, movies, watchlist, darkMode }) => {
    const total = movies.length + watchlist.length;
    const watchedPercent = total === 0 ? 0 : (movies.length / total) * 100;
    const remainingPercent = total === 0 ? 0 : (watchlist.length / total) * 100;

    const exportData = () => {
        const dataStr = JSON.stringify({ user, movies, watchlist }, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "cinefolder_data.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const resetData = () => {
        if(confirm("Are you sure? This will delete ALL data and reset to defaults.")) {
            localStorage.clear();
            window.location.reload();
        }
    }

    return (
        <div className="p-8 flex flex-col lg:flex-row gap-8 animate-in slide-in-from-bottom-8 duration-500 max-w-[1600px] mx-auto">
            
            <NeoCard className={`flex-1 p-12 flex flex-col items-center ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-white'}`}>
                <h3 className={`font-serif text-3xl font-bold mb-10 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    <User className="text-purple-500" /> Admin Identity
                </h3>
                
                <div className={`w-40 h-40 rounded-3xl border-4 ${user.avatar?.color || 'bg-gray-200'} flex items-center justify-center text-6xl shadow-[8px_8px_0px_0px_#000] mb-8 relative hover:scale-105 transition-all ${darkMode ? 'border-gray-500' : 'border-black'}`}>
                    {user.avatar?.icon || '👤'}
                </div>

                <div className="w-full max-w-sm space-y-6 z-10 px-4 mb-12">
                    <input 
                        value={user.name} 
                        onChange={(e) => setUser({...user, name: e.target.value})}
                        className={`w-full text-center text-2xl font-bold border-2 rounded-lg py-3 focus:outline-none transition-all ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-50 border-black'}`} 
                    />
                    <button className={`w-full font-bold py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-black text-white hover:bg-gray-800'}`}>
                        <Save size={16} /> Save Profile
                    </button>
                </div>
            </NeoCard>

            <div className="w-full lg:w-[450px] space-y-8">
                <NeoCard className={`p-6 ${darkMode ? 'bg-[#1a1a2e] border-gray-600' : 'bg-white'}`}>
                    <h3 className={`font-serif text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                        <BarChart3 size={20} /> Watchlist Remaining
                    </h3>
                    
                    <div className="flex h-64 items-end gap-4 justify-center pb-4 border-b-2 border-dashed border-gray-300">
                        <div className="w-16 flex flex-col items-center gap-2 group">
                            <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{movies.length}</span>
                            <div style={{ height: `${watchedPercent}%` }} className="w-full bg-green-500 rounded-t-lg transition-all duration-1000 group-hover:bg-green-400"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Watched</span>
                        </div>
                        <div className="w-16 flex flex-col items-center gap-2 group">
                            <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{watchlist.length}</span>
                            <div style={{ height: `${remainingPercent}%` }} className="w-full bg-purple-500 rounded-t-lg transition-all duration-1000 group-hover:bg-purple-400"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">To Watch</span>
                        </div>
                    </div>
                </NeoCard>

                <NeoCard 
                    onClick={exportData}
                    className={`flex items-center justify-between p-6 cursor-pointer hover:scale-[1.02] ${darkMode ? 'bg-gray-800 text-white border-gray-500' : 'bg-gray-900 text-white'}`}
                >
                    <div>
                        <h4 className="font-bold">Permanent Backup</h4>
                        <p className="text-xs opacity-60">Download JSON Database</p>
                    </div>
                    <FileJson />
                </NeoCard>

                <div className="text-center">
                    <button onClick={resetData} className="text-red-500 text-xs font-bold uppercase tracking-widest hover:underline">Reset All Data</button>
                </div>
            </div>
        </div>
    );
};

const ModalNewEntry = ({ setShowAddModal, onSave, folders, initialData, isWatchlistMode, existingTitles }) => {
    const isEditing = !!initialData;
    const [category, setCategory] = useState(initialData?.type || 'Film / Movie');
    const [title, setTitle] = useState(initialData?.title || '');
    const [errors, setErrors] = useState({});
    const [suggestions, setSuggestions] = useState([]);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (val.length > 2) {
            setSuggestions(existingTitles.filter(t => t.toLowerCase().includes(val.toLowerCase()) && t !== val));
        } else {
            setSuggestions([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newErrors = {};
        
        if (!formData.get('title')) newErrors.title = "Title is required";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(formData, initialData?.id, isWatchlistMode);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className={`w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative ${Object.keys(errors).length > 0 ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              <div className={`border-b-2 border-black p-4 flex justify-between items-center ${isWatchlistMode ? 'bg-purple-400' : 'bg-[#00Dfa2]'}`}>
                 <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                     {isWatchlistMode ? <Eye size={20} /> : <Plus size={20} />} 
                     {isWatchlistMode ? 'Add to Watchlist' : 'Log Watched'}
                 </h3>
                 <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform bg-red-500 text-white rounded-full p-1 border-2 border-black"><X size={20} strokeWidth={3}/></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#fff]">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 block">Category</label>
                     <div className="relative">
                        <select 
                            name="type" 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2.5 border-2 border-black rounded-lg font-bold bg-white focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white outline-none transition-all appearance-none text-sm cursor-pointer"
                        >
                            <option value="Film / Movie">Film / Movie</option>
                            <option value="TV Series">TV Series</option>
                            <option value="Anime">Anime</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-xs">▼</div>
                     </div>
                   </div>
                   
                   {!isWatchlistMode && (
                       <div>
                         <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 block">Date Watched</label>
                         <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border-2 border-black rounded-lg font-bold outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:bg-white bg-white transition-all text-sm cursor-pointer" />
                       </div>
                   )}
                 </div>

                 <div className="col-span-2 relative">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 block">Title</label>
                    <input 
                        name="title" 
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="e.g. Fallout" 
                        className={`w-full p-2.5 border-2 rounded-lg font-bold outline-none transition-all placeholder:text-gray-300 text-sm ${errors.title ? 'border-red-500 bg-red-50' : 'border-black focus:shadow-[4px_4px_0px_0px_#000]'}`} 
                    />
                    {errors.title && <div className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1 animate-in slide-in-from-left-2"><AlertCircle size={10}/> {errors.title}</div>}
                    
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border-2 border-black rounded-lg mt-1 z-10 shadow-lg max-h-32 overflow-y-auto">
                            {suggestions.map(s => (
                                <div key={s} onClick={() => { setTitle(s); setSuggestions([]); }} className="p-2 text-sm hover:bg-gray-100 cursor-pointer font-bold border-b border-gray-100">{s}</div>
                            ))}
                        </div>
                    )}
                 </div>

                 {/* Season hidden for watchlist */}
                 {!isWatchlistMode && (category === 'TV Series' || category === 'Anime') && (
                     <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                        <label className="text-[10px] font-bold uppercase text-purple-600 tracking-wider mb-1 block">Season / Arc Name</label>
                        <input name="season" defaultValue={initialData?.season || "Season 1"} placeholder="Season 1" className="w-full p-2.5 border-2 border-purple-500 rounded-lg bg-purple-50 font-bold outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#8b5cf6] transition-all text-sm" />
                     </div>
                 )}

                 {/* Folder Selection */}
                 {!isWatchlistMode && (
                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 block">Collection</label>
                        <div className="relative">
                            <select name="folder" className="w-full p-2.5 border-2 border-black rounded-lg font-bold bg-white focus:shadow-[4px_4px_0px_0px_#000] outline-none appearance-none text-sm cursor-pointer">
                                <option value="">Unsorted</option>
                                {folders.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-xs">▼</div>
                        </div>
                    </div>
                 )}

                 {!isWatchlistMode && (
                     <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 block">Rating</label>
                        <div className="flex items-center gap-3">
                          <input name="rating" type="range" min="0" max="5" step="0.1" defaultValue={initialData?.rating || 2.5} className="flex-1 accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border border-black" />
                        </div>
                     </div>
                 )}

                 <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 block">Poster URL</label>
                    <div className="flex gap-2">
                       <input id="posterInput" name="poster" defaultValue={initialData?.poster} placeholder="/image?query=..." className="flex-1 p-2.5 border-2 border-black rounded-lg bg-gray-50 text-xs font-mono outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all" />
                       <label className="p-2.5 border-2 border-black rounded-lg bg-white hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all">
                           <Upload size={16}/>
                           <input type="file" className="hidden" onChange={(e) => {
                               if (e.target.files && e.target.files[0]) {
                                   const url = URL.createObjectURL(e.target.files[0]);
                                   document.getElementById('posterInput').value = url;
                               }
                           }}/>
                       </label>
                    </div>
                 </div>

                 {!isWatchlistMode && (
                     <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 block">Review</label>
                        <textarea name="notes" defaultValue={initialData?.notes} rows="3" placeholder="Your thoughts..." className="w-full p-2.5 border-2 border-black rounded-lg bg-gray-50 font-medium outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all resize-none text-sm"></textarea>
                     </div>
                 )}

                 <button type="submit" className={`w-full py-3.5 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all mt-2 flex items-center justify-center gap-2 ${isWatchlistMode ? 'bg-purple-600' : 'bg-black'}`}>
                   {isEditing ? 'Update Entry' : (isWatchlistMode ? 'Add to Watchlist' : 'Log Entry')}
                 </button>
              </form>
           </div>
        </div>
    );
};

const ModalNewFolder = ({ onClose, onSave }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if(formData.get('name')) onSave(formData.get('name'));
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm bg-white border-4 border-black rounded-2xl overflow-hidden p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1 border-2 border-black"><X size={16}/></button>
                <h3 className="font-serif text-2xl font-bold mb-4">New Collection</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" autoFocus placeholder="e.g. Sci-Fi Favorites" className="w-full p-3 border-2 border-black rounded-xl font-bold outline-none focus:shadow-[4px_4px_0px_0px_#000]" />
                    <button className="w-full bg-black text-white font-bold py-3 rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">Create Folder</button>
                </form>
            </div>
        </div>
    );
};

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null); // For Filtering DB
  
  // Data State
  const [movies, setMovies] = useState([]); 
  const [watchlist, setWatchlist] = useState([]);
  const [journals, setJournals] = useState([]); 
  const [folders, setFolders] = useState([]);
  const [user, setUser] = useState({ name: 'Admin', role: 'PRO', avatar: AVATARS[7] });

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isWatchlistMode, setIsWatchlistMode] = useState(false);

  // Initialize Data
  useEffect(() => {
    // Helper to safely load data
    const safeLoad = (key, setter, seed) => {
        try {
            const stored = localStorage.getItem(key);
            if (stored && stored !== "undefined") {
                setter(JSON.parse(stored));
            } else {
                // If local storage is empty or undefined, use seed
                setter(seed);
            }
        } catch (e) {
            // If error parsing, use seed
            console.error(`Error loading ${key}`, e);
            setter(seed);
        }
    };

    safeLoad('cinefolder_movies', setMovies, SEED_DATA.movies);
    safeLoad('cinefolder_watchlist', setWatchlist, SEED_DATA.watchlist);
    safeLoad('cinefolder_journals', setJournals, SEED_DATA.journals);
    safeLoad('cinefolder_folders', setFolders, SEED_DATA.folders);
    safeLoad('cinefolder_user', setUser, SEED_DATA.user);
  }, []);

  // Persist Data
  useEffect(() => {
    localStorage.setItem('cinefolder_movies', JSON.stringify(movies));
    localStorage.setItem('cinefolder_watchlist', JSON.stringify(watchlist));
    localStorage.setItem('cinefolder_journals', JSON.stringify(journals));
    localStorage.setItem('cinefolder_folders', JSON.stringify(folders));
    localStorage.setItem('cinefolder_user', JSON.stringify(user));
  }, [movies, watchlist, journals, folders, user]);

  // Search Debounce
  useEffect(() => {
      if(searchQuery) {
          setIsSearching(true);
          const timer = setTimeout(() => setIsSearching(false), 500); 
          return () => clearTimeout(timer);
      } else {
          setIsSearching(false);
      }
  }, [searchQuery]);

  const handleSaveEntry = (formData, id, isWatchlist) => {
    // Auto-detect year from Date Watched
    const dateWatched = formData.get('date');
    const detectedYear = dateWatched ? new Date(dateWatched).getFullYear() : new Date().getFullYear();

    const entry = {
      title: formData.get('title'),
      year: detectedYear, // Extracted Automatically
      type: formData.get('type'),
      season: formData.get('season') || null,
      folder: formData.get('folder') || null,
      poster: formData.get('poster') || 'https://placehold.co/300x450/pink/black?text=No+Img',
      date: isWatchlist ? null : dateWatched,
      rating: isWatchlist ? null : parseFloat(formData.get('rating')),
      notes: isWatchlist ? null : formData.get('notes'),
      id: id || Date.now(),
    };

    if (isWatchlist) {
        setWatchlist(prev => id ? prev.map(i => i.id === id ? entry : i) : [entry, ...prev]);
    } else {
        setMovies(prev => id ? prev.map(i => i.id === id ? entry : i) : [entry, ...prev]);
        // Update folder counts
        if (entry.folder) {
            setFolders(folders.map(f => f.name === entry.folder ? { ...f, count: f.count + 1 } : f));
        }
    }
    
    setShowAddModal(false);
  };

  const handleSaveJournal = (formData, mood, dateStr) => {
      const dateObj = new Date(dateStr);
      const displayDate = `${dateObj.toLocaleDateString('en-US', { weekday: 'long' })} | ${dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;

      const newEntry = {
          id: Date.now(),
          title: formData.get('title'),
          text: formData.get('text'),
          mood: mood,
          date: dateStr,
          displayDate: displayDate
      };
      setJournals([newEntry, ...journals]);
      setShowJournalModal(false);
  };

  const handleAddFolder = (name) => {
      setFolders([...folders, { id: Date.now(), name, count: 0 }]);
      setShowFolderModal(false);
  }

  const handleFolderClick = (folderName) => {
      setCurrentFolder(folderName);
      setActiveTab('database');
  };

  const handleDeleteFolder = (id) => {
      if(confirm("Delete folder? Movies inside will remain in database but unsorted.")) {
          setFolders(folders.filter(f => f.id !== id));
      }
  };

  const handleDeleteWatchlist = (id) => {
      if(confirm("Remove from Watchlist?")) {
          setWatchlist(watchlist.filter(w => w.id !== id));
      }
  }

  return (
    <div className={`flex min-h-screen font-sans selection:bg-yellow-300 overflow-x-hidden ${darkMode ? 'bg-[#0f0c29] text-white' : 'bg-[#F3F4F6] text-black'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="flex-1 md:ml-64 flex flex-col relative transition-all duration-500 isolate" 
           style={darkMode ? { backgroundImage: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' } : { backgroundImage: 'radial-gradient(#00000010 2px, transparent 2px)', backgroundSize: '24px 24px' }}>
        
        <TopBar 
            title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
            user={user} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            setShowAddModal={() => { setIsWatchlistMode(false); setShowAddModal(true); }}
            movies={movies} // Passing movies for search prediction
            darkMode={darkMode}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
        />
        
        <div className="flex-1 min-h-[calc(100vh-80px)] pb-24">
             {activeTab === 'dashboard' && <Dashboard movies={movies} watchlist={watchlist} user={user} setActiveTab={setActiveTab} setShowAddModal={() => { setIsWatchlistMode(false); setShowAddModal(true); }} darkMode={darkMode} />}
             {activeTab === 'database' && <FilmDatabase movies={movies} darkMode={darkMode} searchQuery={searchQuery} currentFolder={currentFolder} clearFolderFilter={() => setCurrentFolder(null)} />}
             {activeTab === 'watchlist' && <Watchlist watchlist={watchlist} darkMode={darkMode} setShowAddModal={setShowAddModal} setIsWatchlistMode={setIsWatchlistMode} onDelete={handleDeleteWatchlist} />}
             {activeTab === 'collections' && <Collections folders={folders} darkMode={darkMode} onFolderClick={handleFolderClick} onDeleteFolder={handleDeleteFolder} onAddFolder={() => setShowFolderModal(true)} />}
             {activeTab === 'journal' && <Journal journals={journals} setJournals={setJournals} setShowJournalModal={setShowJournalModal} darkMode={darkMode} />}
             {activeTab === 'admin' && <AdminProfile user={user} setUser={setUser} movies={movies} watchlist={watchlist} darkMode={darkMode} />}
        </div>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />

      {showAddModal && <ModalNewEntry setShowAddModal={setShowAddModal} onSave={handleSaveEntry} folders={folders} isWatchlistMode={isWatchlistMode} existingTitles={movies.map(m => m.title).concat(watchlist.map(w => w.title))} />}
      {showJournalModal && <ModalJournalEntry setShowJournalModal={setShowJournalModal} onSave={handleSaveJournal} />}
      {showFolderModal && <ModalNewFolder onClose={() => setShowFolderModal(false)} onSave={handleAddFolder} />}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Grotesk:wght@400;500;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Space Grotesk', sans-serif; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #d1d5db; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}