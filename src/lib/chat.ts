import { ARTICLES_DATA } from "../data/articlesData";
import { CHAT_FALLBACK_REPLY } from "./derive";

const STOPWORDS = new Set([
  "yang", "dan", "atau", "untuk", "dengan", "dari", "kalau", "adalah",
  "apa", "aja", "itu", "ini", "saya", "apakah", "bagaimana", "cara",
  "soal", "tentang", "kenapa", "gimana", "fitur", "disini", "tolong",
]);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export function findChatReply(userText: string): string {
  const qWords = keywords(userText);
  if (qWords.length === 0) return CHAT_FALLBACK_REPLY;

  let best = ARTICLES_DATA[0];
  let bestScore = 0;
  for (const a of ARTICLES_DATA) {
    const hay = keywords(`${a.topik} ${a.judul} ${a.ringkasan}`);
    const score = qWords.filter((w) => hay.some((h) => h.includes(w) || w.includes(h))).length;
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  if (bestScore === 0) return CHAT_FALLBACK_REPLY;

  const firstParagraph = best.isi.split("\n\n")[0];
  return `${best.ringkasan}\n\n${firstParagraph}`;
}
