// Services / showcase videos (YouTube). These are the static fallback shown when the
// database has none yet. The company manages the live list from the admin dashboard.
export type SiteVideo = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  youtubeUrl: string;
  active?: boolean;
  order?: number;
};

export const SITE_VIDEOS: SiteVideo[] = [];

// Extract the YouTube video id from any common URL form (watch?v=, youtu.be/, /embed/, /shorts/).
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  // bare id
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}
