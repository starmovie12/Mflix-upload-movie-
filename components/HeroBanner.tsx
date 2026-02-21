import React from 'react';
import { Movie } from '../types';
import { Star, Play, Plus } from 'lucide-react';

interface HeroBannerProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onMovieClick }) => {
  const featured = movies.slice(0, 5);
  if (featured.length === 0) return null;

  return (
    <div className="relative w-full pt-16 pb-8">
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 gap-4">
        {featured.map((movie) => {
          // backdrop ya poster use karo
          const bgImage = movie.original_backdrop_url || movie.poster;
          const rating = movie.rating ? parseFloat(String(movie.rating)).toFixed(1) : '8.4';
          const quality = movie.quality_name || movie.quality || 'HD';
          const genre = Array.isArray(movie.genre)
            ? (movie.genre as string[]).slice(0, 2).join(' · ')
            : (movie.genre || '').split(',').slice(0, 2).join(' · ');

          return (
            <div
              key={movie.movie_id}
              className="relative flex-shrink-0 w-[88%] aspect-hero rounded-[2.5rem] overflow-hidden snap-center group cursor-pointer border border-white/5 shadow-2xl transition-transform duration-500 active:scale-[0.98]"
              onClick={() => onMovieClick(movie)}
            >
              <img
                src={bgImage}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              {/* Rating badge */}
              <div className="absolute top-5 left-5 flex items-center gap-1.5 bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
                <Star size={10} fill="#fbbf24" className="text-yellow-400" />
                <span className="text-white text-[10px] font-black tracking-wide">{rating}</span>
              </div>

              {/* Quality badge */}
              <div className="absolute top-5 right-5 bg-red-600/90 text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-lg">
                {quality.includes('4K') ? '4K Ultra HD' : quality.includes('1080') ? 'Full HD' : quality}
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 w-full p-6 space-y-2">
                {/* Genre pills */}
                {genre && (
                  <div className="flex gap-1.5">
                    {genre.split('·').map(g => (
                      <span key={g} className="text-[9px] font-black text-white/60 uppercase tracking-[0.15em]">
                        {g.trim()}{g !== genre.split('·').slice(-1)[0] ? ' ·' : ''}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="text-2xl font-[900] text-white leading-tight tracking-tighter uppercase italic drop-shadow-2xl line-clamp-2">
                  {movie.title}
                </h2>

                {/* Short description */}
                {movie.short_description && (
                  <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                    {movie.short_description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-[0.15em]">
                  <span>{movie.year}</span>
                  {movie.runtime && <><span className="w-1 h-1 bg-white/20 rounded-full" /><span>{movie.runtime}</span></>}
                  {(movie.languages || movie.audio_type) && (
                    <><span className="w-1 h-1 bg-white/20 rounded-full" /><span>{(movie.languages || movie.audio_type || '').split(' ')[0]}</span></>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button className="flex-1 bg-white text-black h-11 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
                    <Play size={16} fill="black" />
                    Watch Now
                  </button>
                  <button className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/20">
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
};
