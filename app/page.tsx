'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Movie } from '../types';
import { fetchAllMovies } from '../services/firebaseService';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAllMovies();
      setMovies(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleMovieClick = useCallback((movie: Movie) => {
    router.push(`/player/${movie.movie_id}`);
  }, [router]);

  // Featured: is_featured = "Yes" ya top 8
  const featured = useMemo(() =>
    movies.filter(m => m.is_featured === 'Yes').slice(0, 8).length > 0
      ? movies.filter(m => m.is_featured === 'Yes').slice(0, 8)
      : movies.slice(0, 8),
    [movies]
  );

  // Trending: is_trending_now = "Yes"
  const trending = useMemo(() =>
    movies.filter(m => m.is_trending_now === 'Yes').slice(0, 12).length > 0
      ? movies.filter(m => m.is_trending_now === 'Yes').slice(0, 12)
      : movies.slice(0, 12),
    [movies]
  );

  // Genre filtering
  const action = useMemo(() =>
    movies.filter(m => m.genre?.toLowerCase().includes('action')).slice(0, 12),
    [movies]
  );
  const comedy = useMemo(() =>
    movies.filter(m => m.genre?.toLowerCase().includes('comedy')).slice(0, 12),
    [movies]
  );
  const horror = useMemo(() =>
    movies.filter(m =>
      m.genre?.toLowerCase().includes('horror') ||
      m.genre?.toLowerCase().includes('thriller')
    ).slice(0, 12),
    [movies]
  );
  const romance = useMemo(() =>
    movies.filter(m => m.genre?.toLowerCase().includes('romance')).slice(0, 12),
    [movies]
  );

  // Latest (sort by year)
  const latest = useMemo(() =>
    [...movies]
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      .slice(0, 12),
    [movies]
  );

  // Bollywood
  const bollywood = useMemo(() =>
    movies.filter(m => m.industry?.toLowerCase().includes('bollywood')).slice(0, 12),
    [movies]
  );

  // 4K content
  const uhd = useMemo(() =>
    movies.filter(m =>
      m.quality_name?.includes('4K') || m.quality?.includes('4K')
    ).slice(0, 12),
    [movies]
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#030812]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-[3px] border-red-600/10 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-white/30 text-xs font-bold mt-4 uppercase tracking-widest">Loading</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030812] text-white overflow-x-hidden pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] px-5 py-4 flex items-center justify-between glass-header pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40 group-active:scale-90 transition-transform">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
            </svg>
          </div>
          <span className="text-xl font-[900] tracking-tighter text-white uppercase italic">MFLIX</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          <button className="text-white/80 p-1 relative active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-black animate-pulse"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 p-0.5 overflow-hidden active:scale-90 transition-transform">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Professional" className="w-full h-full object-cover" alt="User" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="animate-fadeIn">
        <HeroBanner movies={featured} onMovieClick={handleMovieClick} />

        <div className="space-y-2">
          {trending.length > 0 && (
            <MovieRow title="🔥 Trending Now" movies={trending} onMovieClick={handleMovieClick} />
          )}
          <MovieRow title="⚡ Latest Releases" movies={latest} onMovieClick={handleMovieClick} />
          {bollywood.length > 0 && (
            <MovieRow title="🎬 Bollywood" movies={bollywood} onMovieClick={handleMovieClick} />
          )}
          {action.length > 0 && (
            <MovieRow title="💥 High-Octane Action" movies={action} onMovieClick={handleMovieClick} />
          )}
          {comedy.length > 0 && (
            <MovieRow title="😂 Comedy" movies={comedy} onMovieClick={handleMovieClick} />
          )}
          {horror.length > 0 && (
            <MovieRow title="👻 Thrillers & Horror" movies={horror} onMovieClick={handleMovieClick} />
          )}
          {romance.length > 0 && (
            <MovieRow title="❤️ Romance" movies={romance} onMovieClick={handleMovieClick} />
          )}
          {uhd.length > 0 && (
            <MovieRow title="🎥 4K Ultra HD" movies={uhd} onMovieClick={handleMovieClick} />
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-sm">
        <div className="bg-gradient-to-r from-[#161b33] to-[#4a154b] flex items-center h-[60px] rounded-full px-2 shadow-2xl shadow-black/80 border border-white/10 backdrop-blur-xl">
          <button className="flex-1 text-center text-white/70 hover:text-white text-[15px] font-bold tracking-tight active:scale-95 transition-all">
            TV
          </button>
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          <button className="flex-1 text-center text-white text-[15px] font-bold tracking-tight active:scale-95 transition-all">
            Movies
          </button>
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          <div className="flex items-center pr-1 gap-2">
            <button className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="w-[1px] h-6 bg-white/10" />
            <button className="px-3 h-11 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
