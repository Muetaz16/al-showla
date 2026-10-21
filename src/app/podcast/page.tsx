"use client";

// Podcast section — named "ميدماك" (Midmak) by the client. Episodes come from PODCAST_EPISODES.

import { useLang } from "@/lib/useLang";
import { Mic, Play } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PODCAST_EPISODES } from "@/lib/company-data";

// YouTube links get an embedded player; any other link opens in a new tab.
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default function PodcastPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />

      <section className="pc-hero">
        <div className="pc-wrap">
          <div className="pc-badge"><Mic size={16} /> {isAr ? "بودكاست" : "Podcast"}</div>
          <h1>{isAr ? "ميدماك" : "Midmak"}</h1>
          <p>
            {isAr
              ? "بودكاست الشعلة الرائدة — حوارات مع المهندسين والمقاولين والخبراء حول قطاع البناء ومواد البناء والحلول الإنشائية في ليبيا."
              : "Al-Showla Al-Raeda's podcast — conversations with engineers, contractors and experts about construction, building materials and construction solutions in Libya."}
          </p>
        </div>
      </section>

      <div className="pc-wrap" style={{ paddingBottom: 60 }}>
        {PODCAST_EPISODES.length === 0 ? (
          <div className="pc-empty">
            <Mic size={40} />
            <h2>{isAr ? "الحلقات قريباً" : "Episodes coming soon"}</h2>
            <p>{isAr ? "تابعونا — ستُنشر حلقات ميدماك هنا قريباً." : "Stay tuned — Midmak episodes will be published here soon."}</p>
          </div>
        ) : (
          <div className="pc-grid">
            {PODCAST_EPISODES.map((ep, i) => {
              const yt = youtubeId(ep.url);
              const title = isAr ? ep.titleAr : ep.titleEn;
              const guest = isAr ? ep.guestAr : ep.guestEn;
              return (
                <article key={ep.url} className="pc-ep">
                  {yt ? (
                    <div className="pc-video">
                      <iframe src={`https://www.youtube.com/embed/${yt}`} title={title} loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : (
                    <a href={ep.url} target="_blank" rel="noopener noreferrer" className="pc-cover"><Play size={42} /></a>
                  )}
                  <div className="pc-body">
                    <div className="pc-num">{isAr ? `الحلقة ${PODCAST_EPISODES.length - i}` : `Episode ${PODCAST_EPISODES.length - i}`}</div>
                    <h2>{title}</h2>
                    {guest && <div className="pc-guest">{guest}</div>}
                    {ep.date && <div className="pc-date">{ep.date}</div>}
                    {!yt && <a href={ep.url} target="_blank" rel="noopener noreferrer" className="pc-link">{isAr ? "استمع للحلقة ↗" : "Listen ↗"}</a>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <SiteFooter lang={lang} />

      <style>{`
        .pc-wrap { max-width: 1140px; margin: 0 auto; padding: 0 5%; }
        .pc-hero { background: linear-gradient(120deg, #001f4d, #0051a2); color: #fff; padding: 56px 0 64px; text-align: center; }
        .pc-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,.18); color: #fbbf24; font-weight: 800; font-size: 14px; padding: 6px 16px; border-radius: 999px; }
        .pc-hero h1 { font-size: clamp(2.4rem, 6vw, 3.6rem); font-weight: 900; margin: 14px 0 10px; }
        .pc-hero p { max-width: 680px; margin: 0 auto; opacity: .88; line-height: 2; font-size: 16px; }
        .pc-empty { background: #fff; border-radius: 18px; margin-top: -30px; padding: 50px 24px; text-align: center; color: #0a1f44; box-shadow: 0 10px 30px rgba(0,31,77,.08); }
        .pc-empty svg { color: #f59e0b; }
        .pc-empty h2 { margin: 12px 0 6px; font-weight: 900; }
        .pc-empty p { color: #64748b; margin: 0; }
        .pc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: -30px; }
        .pc-ep { background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,31,77,.08); border: 1px solid #e2e8f0; }
        .pc-video { aspect-ratio: 16 / 9; background: #000; }
        .pc-video iframe { width: 100%; height: 100%; border: 0; }
        .pc-cover { aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; background: linear-gradient(150deg, #0a1f44, #0051a2); color: #fff; }
        .pc-body { padding: 18px 20px 22px; }
        .pc-num { color: #f59e0b; font-weight: 800; font-size: 13px; }
        .pc-body h2 { font-size: 18px; font-weight: 900; color: #0a1f44; margin: 4px 0 6px; }
        .pc-guest { color: #0051a2; font-weight: 700; font-size: 14px; }
        .pc-date { color: #94a3b8; font-size: 13px; margin-top: 4px; }
        .pc-link { display: inline-block; margin-top: 10px; color: #0051a2; font-weight: 800; text-decoration: none; }
        @media (max-width: 760px) { .pc-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
