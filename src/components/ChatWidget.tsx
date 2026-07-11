import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage } from "../types";
import styles from "./ChatWidget.module.css";

export function ChatWidget({
  open,
  onToggle,
  messages,
  onSend,
}: {
  open: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  function send() {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  }

  return (
    <div className={styles.wrap}>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={styles.header}>
              <div className={styles.avatar}>✦</div>
              <div className={styles.headerText}>
                <div className={styles.headerTitle}>Tanya Kesehatan Ginjal</div>
                <div className={styles.headerSub}>Ditenagai AI · bukan pengganti dokter</div>
              </div>
              <button type="button" onClick={onToggle} aria-label="Tutup" className={styles.closeBtn}>
                ×
              </button>
            </div>
            <div ref={scrollRef} className={styles.messages}>
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? styles.wrapUser : styles.wrapAssistant}>
                  <div className={m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tanya soal ginjal, diet, gejala…"
                className={styles.input}
              />
              <button type="button" onClick={send} className={styles.sendBtn} aria-label="Kirim">
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" onClick={onToggle} className={styles.fab} aria-label="Buka chat">
        <span className={styles.fabIcon}>✦</span>
      </button>
    </div>
  );
}
