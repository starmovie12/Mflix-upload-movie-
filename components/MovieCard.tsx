import React from 'react';
import { Movie } from '../types';
import { Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  variant?: 'portrait' | 'landscape';
  progress?: number;
  timeLeft?: string;
  subtitle?: string;
}

const FALLBACK_POSTER = 'https://picsum.photos/seed/fallback/400/600';

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onClick,
  variant = 'portrait',
  progress,
  timeLeft,
  subtitle
}) => {
  const fullTitle = movie.title || 'Untitled';
  const posterUrl = movie.poster || movie.original_poster_url || FALLBACK_POSTER;
  const rating = movie.rating ? parseFloat(String(movie.rating)).toFixed(1) : '8.1';
  const quality = movie.quality_name || movie.quality || 'HD';
  const year = movie.year || '2025';
  const lang = ((movie.languages || movie.audio_type || movie.original_language || 'HI')
    .toString().split(' ')[0].substring(0, 5)).toUpperCase();

  if (variant === 'landscape') {
    return (
      <article
        className="relative w-full cursor-pointer flex-shrink-0 animate-fadeIn"
        onClick={() => onClick(movie)}
      >
        <div className="relative aspect-video rounded-[8px] overflow-hidden bg-[#1a1a1a] shadow-lg border border-white/5">
          <img
            src={posterUrl}
            alt={fullTitle}
            className="w-full h-full object-cover brightness-75"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
              <div
                className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <div className="mt-2 px-1 space-y-0.5">
          <h3 className="text-[13px] font-bold text-white leading-tight truncate">{fullTitle}</h3>
          <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">
            {subtitle || timeLeft || year}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className="relative w-full cursor-pointer group flex flex-col animate-fadeIn"
      onClick={() => onClick(movie)}
    >
      <div className="relative w-full pb-[145%] rounded-[8px] bg-[#0d1117] border border-white/10 overflow-hidden transition-all duration-300 group-active:scale-[0.96] shadow-xl group-hover:border-white/30">
        <img
          src={posterUrl}
          alt={fullTitle}
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER; }}
        />

        {/* Language badge */}
        <div className="absolute top-0 right-0 bg-[#e50914] text-white text-[7px] font-[900] px-1.5 py-0.5 rounded-bl-[6px] z-10 uppercase tracking-tight">
          {lang}
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="mt-1.5 px-0.5 space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-[11px] font-bold text-white/90 leading-tight group-hover:text-white line-clamp-2 flex-1">
            {fullTitle}
          </h3>
          <span className="text-[9px] font-medium text-gray-500 flex-shrink-0 mt-0.5">{year}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="px-1.5 h-[14px] bg-black border border-white/20 rounded-[2px] flex items-center justify-center">
            <span className="text-white text-[7px] font-black uppercase tracking-tighter whitespace-nowrap">
              {quality.includes('4K') ? '4K' : quality.includes('1080') ? 'FHD' : quality.includes('720') ? 'HD' : 'HD'}
            </span>
          </div>
          <div className="flex items-center gap-0.5 bg-[#e50914] px-1.5 h-[14px] rounded-[2px]">
            <Star size={7} fill="white" className="text-white" />
            <span className="text-white text-[8px] font-black leading-none">{rating}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
