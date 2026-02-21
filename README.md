# MFLIX - Premium HD Streaming

Netflix-style movie streaming app built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔥 Firebase Data Format

Apne Firebase Realtime Database mein `movies_by_id` node ke andar data is format mein daalo:

```json
{
  "movies_by_id": {
    "movie-001": {
      "movie_id": "movie-001",
      "title": "Pathaan",
      "poster": "https://link-to-poster-image.jpg",
      "video_url": "https://link-to-video.mp4",
      "rating": "7.5",
      "quality_name": "1080P FHD",
      "year": "2023",
      "genre": "Action",
      "description": "Movie ki description yahan likho.",
      "original_language": "Hindi",
      "category": "Bollywood",
      "director": "Siddharth Anand",
      "cast": "Shah Rukh Khan, Deepika Padukone",
      "download_links": [
        { "quality": "1080p", "url": "https://video-link-1080.mp4", "size": "2.1 GB" },
        { "quality": "720p",  "url": "https://video-link-720.mp4",  "size": "1.2 GB" }
      ]
    },
    "movie-002": {
      "movie_id": "movie-002",
      "title": "KGF Chapter 2",
      ...
    }
  }
}
```

### Zaruri Fields:
| Field | Type | Description |
|---|---|---|
| `movie_id` | string | Unique ID (same as key) |
| `title` | string | Movie ka naam |
| `poster` | string | Poster image URL |
| `video_url` | string | **Main video URL (MP4/M3U8)** |
| `rating` | string | Rating (e.g. "8.5") |
| `quality_name` | string | Quality label |
| `year` | string | Release year |

### Optional Fields:
`genre`, `description`, `director`, `cast`, `original_language`, `category`, `download_links`, `certification`, `runtime`

---

## 📁 Project Structure

```
mflix/
├── app/
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── player/[id]/
│       └── page.tsx      # Player page
├── components/
│   ├── HeroBanner.tsx    # Hero slider
│   ├── MovieCard.tsx     # Movie card
│   ├── MovieRow.tsx      # Horizontal row
│   └── VideoPlayer.tsx   # Full video player
├── services/
│   └── firebaseService.ts # Firebase/API calls
└── types.ts               # TypeScript types
```

---

## 🔧 Firebase Data Dene Ka Tarika

1. [Firebase Console](https://console.firebase.google.com) kholo
2. Apna project select karo
3. **Realtime Database** → **Data** tab
4. Import JSON ya manually `movies_by_id` node banao

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Firebase Realtime Database** (REST API)
- **Lucide React** icons
