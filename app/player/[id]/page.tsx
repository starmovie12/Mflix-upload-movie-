'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Movie } from '../../../types';
import { fetchMovieById, fetchAllMovies } from '../../../services/firebaseService';
import { ArrowLeft, Settings, Maximize, Play, Download, Plus, ThumbsUp, Share2, Flag, X, PlayCircle, Layers, Star, Clock, Globe, Film } from 'lucide-react';

const FALLBACK_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeries, setIsSeries] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      const data = await fetchMovieById(id as string);
      if (data) {
        const normalized = normalizeData(data);
        setMovie(normalized);
        setIsSeries(normalized.isSeries);
        setActiveVideoUrl(normalized.video_url || FALLBACK_VIDEO);
      }
      const all = await fetchAllMovies();
      setRelatedMovies(all.filter(m => m.movie_id !== id).slice(0, 12));
      setLoading(false);
    };
    loadData();
  }, [id]);

  const normalizeData = (data: any) => {
    const isSeries = (
      data.content_type === 'series' ||
      data.type === 'series' ||
      (data.seasons && data.seasons.length > 0)
    );

    const title = data.title || data.original_title || "Untitled";
    const qualityName = data.quality_name || data.quality || "HD";
    const year = (data.year || data.release_year || "2024").toString();
    const genre = Array.isArray(data.genre)
      ? data.genre.join(', ')
      : (data.genre || "Drama");
    const runtime = data.runtime || "N/A";
    const description = data.short_description || data.description || data.overview || "No synopsis available.";
    const rating = data.rating ? parseFloat(String(data.rating)).toFixed(1) : "0.0";
    const cert = data.certification_status || data.certification || "UA";
    const language = data.languages || data.audio_type || data.original_language || "Hindi";
    const poster = data.poster || data.original_poster_url || "https://picsum.photos/seed/movie/500/750";
    const backdrop = data.original_backdrop_url || poster;

    // Download links parse karo
    // Firebase format: { link: "url", name: "720p HEVC [860MB]" }
    let links: any[] = [];
    if (!isSeries) {
      let rawLinks = data.download_links || data.qualities;
      if (typeof rawLinks === 'string') {
        try { rawLinks = JSON.parse(rawLinks); } catch (e) { rawLinks = []; }
      }
      if (rawLinks) {
        const arr = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks);
        (arr as any[]).forEach((item: any) => {
          const url = item.link || item.url || item.movie_link;
          if (url && typeof url === 'string' && url.startsWith('http')) {
            // "720p HEVC [860MB]" → label: "720p HEVC", info: "860MB"
            const nameRaw = item.name || item.quality || item.label || 'HD';
            const sizeMatch = nameRaw.match(/\[([^\]]+)\]/);
            const cleanLabel = nameRaw.replace(/\s*\[[^\]]+\]/, '').trim();
            links.push({
              url,
              label: cleanLabel || 'HD',
              info: sizeMatch ? sizeMatch[1] : (item.size || item.info || '')
            });
          }
        });
      }
    }

    // Cast parse karo
    let castList: any[] = [];
    if (data.cast_crew_data) {
      try {
        const parsed = typeof data.cast_crew_data === 'string'
          ? JSON.parse(data.cast_crew_data)
          : data.cast_crew_data;
        castList = (parsed.cast || []).slice(0, 6);
      } catch (e) {}
    }

    return {
      ...data,
      isSeries, title, qualityName, year, genre, runtime,
      description, rating, cert, language, poster, backdrop,
      links, castList,
      seasons: data.seasons || []
    };
  };

  const playVideo = (url: string) => {
    const videoUrl = url || FALLBACK_VIDEO;
    setActiveVideoUrl(videoUrl);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleFit = () => {
    if (videoRef.current) {
      videoRef.current.style.objectFit =
        videoRef.current.style.objectFit === 'cover' ? 'contain' : 'cover';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col">
        <div className="aspect-video bg-black w-full animate-pulse" />
        <div className="p-4 space-y-4">
          <div className="h-8 w-3/4 bg-white/5 animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
          <div className="h-12 w-full bg-white/5 animate-pulse rounded" />
          <div className="h-24 w-full bg-white/5 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0 z-50">
        {activeVideoUrl ? (
          <video
            ref={videoRef}
            src={activeVideoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            onError={() => {
              if (videoRef.current) videoRef.current.src = FALLBACK_VIDEO;
            }}
          />
        ) : (
          // Trailer thumbnail fallback
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer relative overflow-hidden"
            onClick={() => playVideo(FALLBACK_VIDEO)}
          >
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl">
              <Play size={28} fill="white" className="ml-1" />
            </div>
          </div>
        )}

        {/* Overlay controls */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-white/25 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <Settings size={18} />
              </button>
              {showQualityMenu && (
                <div className="absolute top-11 right-0 bg-[#141414]/98 border border-white/10 rounded-xl min-w-[150px] flex flex-col z-[100] overflow-hidden shadow-2xl">
                  <div className="px-4 py-2 text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5">Quality</div>
                  {['4K Ultra HD', '1080p FHD', '720p HD', '480p'].map(q => (
                    <button key={q} className="px-4 py-3 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0 font-medium">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleFit}
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto no-scrollbar pb-6">
        <div className="p-4 space-y-5">

          {/* Title + Quality */}
          <div>
            <div className="flex items-start gap-2 flex-wrap mb-2">
              <h1 className="text-xl font-extrabold leading-tight flex-1">{movie.title}</h1>
              <span className="bg-[#E50914] text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider flex-shrink-0 mt-0.5">
                {movie.qualityName}
              </span>
            </div>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="text-xs text-white/40 font-medium">{movie.original_title}</p>
            )}
            {movie.tagline && (
              <p className="text-xs text-white/50 italic mt-1">"{movie.tagline}"</p>
            )}
          </div>

          {/* Meta Pills */}
          <div className="flex items-center flex-wrap gap-2">
            {movie.cert && (
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold">{movie.cert}</span>
            )}
            <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
              <Star size={10} fill="#ffc107" className="text-[#ffc107]" /> {movie.rating}
            </span>
            <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold">{movie.year}</span>
            {movie.runtime && movie.runtime !== 'N/A' && (
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <Clock size={10} /> {movie.runtime}
              </span>
            )}
            {movie.language && (
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <Globe size={10} /> {movie.language}
              </span>
            )}
          </div>

          {/* Genre Tags */}
          {movie.genre && (
            <div className="flex flex-wrap gap-1.5">
              {movie.genre.split(',').map((g: string) => (
                <span key={g} className="bg-white/5 border border-white/10 text-white/70 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {g.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="h-px w-full bg-white/10" />

          {/* Action Buttons */}
          <div className={`grid gap-3 ${isSeries ? 'grid-cols-1' : 'grid-cols-[1fr_auto_auto]'}`}>
            {!isSeries ? (
              <>
                {/* Play Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (movie.links.length > 1) {
                        setShowPlayMenu(!showPlayMenu);
                      } else {
                        playVideo(movie.links[0]?.url || movie.video_url || FALLBACK_VIDEO);
                      }
                    }}
                    className="w-full h-12 bg-[#E50914] rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-red-900/30"
                  >
                    <Play size={18} fill="white" /> Play Movie
                  </button>
                  {showPlayMenu && movie.links.length > 0 && (
                    <div className="absolute top-14 left-0 w-full bg-[#1a1a1a] border border-white/10 rounded-xl flex flex-col z-[100] overflow-hidden shadow-2xl">
                      {movie.links.map((link: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => { playVideo(link.url); setShowPlayMenu(false); }}
                          className="px-4 py-3 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0 font-medium"
                        >
                          ▶ Play {link.label} {link.info && <span className="text-white/40 text-xs">({link.info})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:bg-white/20"
                  >
                    <Download size={20} />
                  </button>
                  {showDownloadMenu && (
                    <div className="absolute top-14 right-0 min-w-[170px] bg-[#1a1a1a] border border-white/10 rounded-xl flex flex-col z-[100] overflow-hidden shadow-2xl">
                      {movie.links.length > 0 ? movie.links.map((link: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => { window.open(link.url, '_blank'); setShowDownloadMenu(false); }}
                          className="px-4 py-3 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0"
                        >
                          ⬇ {link.label} {link.info && <span className="text-white/40 text-xs">({link.info})</span>}
                        </button>
                      )) : (
                        <div className="px-4 py-3 text-sm text-white/40">No links available</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Trailer Button */}
                {movie.trailer_url && (
                  <button
                    onClick={() => window.open(movie.trailer_url, '_blank')}
                    className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:bg-white/20"
                    title="Watch Trailer"
                  >
                    <Film size={18} />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowEpisodes(true)}
                className="w-full h-12 bg-[#2962FF] rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform"
              >
                <Layers size={18} /> View Episodes
              </button>
            )}
          </div>

          {/* Social Row */}
          <div className="flex justify-around py-1">
            {[
              { icon: <Plus size={22} />, label: 'My List' },
              { icon: <ThumbsUp size={22} />, label: 'Like' },
              { icon: <Share2 size={22} />, label: 'Share' },
              { icon: <Flag size={22} />, label: 'Report' },
            ].map(({ icon, label }) => (
              <button key={label} className="flex flex-col items-center gap-1.5 text-[10px] text-white/50 font-medium hover:text-white transition-colors active:scale-90">
                {icon}
                {label}
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* Description */}
          <div>
            <p className={`text-sm leading-relaxed text-white/75 ${descExpanded ? '' : 'line-clamp-3'}`}>
              {movie.description}
            </p>
            {movie.description && movie.description.length > 120 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-[#E50914] text-xs font-bold mt-1"
              >
                {descExpanded ? 'Less' : 'More'}
              </button>
            )}
          </div>

          {/* Movie Details */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2.5 border border-white/5">
            {[
              { label: 'Director', value: movie.director },
              { label: 'Cast', value: movie.cast },
              { label: 'Writer', value: movie.writer },
              { label: 'Producer', value: movie.producer },
              { label: 'Industry', value: movie.industry },
              { label: 'Country', value: movie.country },
              { label: 'Platform', value: movie.platform },
              { label: 'Status', value: movie.status },
              { label: 'IMDB', value: movie.imdb_id },
              { label: 'Collection', value: movie.collection_name },
            ].filter(item => item.value && item.value !== 'N/A').map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-[11px] font-black text-white/40 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">{label}</span>
                <span className="text-[12px] text-white/80 flex-1 leading-relaxed">{value}</span>
              </div>
            ))}
          </div>

          {/* Cast Cards (from cast_crew_data) */}
          {movie.castList && movie.castList.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white/60 mb-3 border-l-2 border-red-600 pl-3">Cast</h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {movie.castList.map((person: any) => (
                  <div key={person.id} className="flex-shrink-0 w-16 flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 border border-white/10">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xl font-bold">
                          {person.name?.[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-white/60 text-center leading-tight line-clamp-2">{person.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Movies */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white/60 mb-3 border-l-2 border-red-600 pl-3">More Like This</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {relatedMovies.map((m) => (
                <div
                  key={m.movie_id}
                  className="flex flex-col gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  onClick={() => router.push(`/player/${m.movie_id}`)}
                >
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-[#E50914] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      {m.quality_name?.includes('4K') ? '4K' : m.quality_name?.includes('1080') ? 'FHD' : 'HD'}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-white/70 truncate">{m.title}</p>
                  <p className="text-[9px] text-white/30">{m.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Overlay */}
      {showEpisodes && (
        <div className="fixed inset-0 bg-black/98 z-[2000] flex flex-col">
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#111]">
            <h3 className="text-lg font-bold">Episodes</h3>
            <button onClick={() => setShowEpisodes(false)} className="text-white">
              <X size={28} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-6 no-scrollbar">
            {movie.seasons.length === 0 ? (
              <p className="text-center text-white/40 mt-10">No episodes found.</p>
            ) : (
              movie.seasons.map((season: any, sIndex: number) => (
                <div key={sIndex} className="space-y-3">
                  <h4 className="text-[#ffc107] font-bold text-base">{season.name || `Season ${sIndex + 1}`}</h4>
                  <div className="space-y-2">
                    {season.episodes?.map((ep: any, eIndex: number) => (
                      <div
                        key={eIndex}
                        onClick={() => { playVideo(ep.url || ep.link); setShowEpisodes(false); }}
                        className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-bold text-white/40 w-6">{eIndex + 1}</span>
                        <span className="flex-grow text-sm font-medium">{ep.title || `Episode ${eIndex + 1}`}</span>
                        <PlayCircle size={20} className="text-[#E50914]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
