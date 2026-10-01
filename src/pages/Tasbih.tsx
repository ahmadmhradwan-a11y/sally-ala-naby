import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ResetCounterDialog } from "@/components/ResetCounterDialog";
import { Button } from "@/components/ui/button";
import { HADITHS } from "@/data/hadiths";
import { useFridayReminder } from "@/hooks/use-reminder";
import { useSalawatCount } from "@/lib/storage";

const ROTATE_MS = 10_000;

function ReminderBanner() {
  const { isWindowActive } = useFridayReminder();
  return (
    <AnimatePresence>
      {isWindowActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mx-5 mt-4 rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3 text-center"
        >
          <p className="font-display text-lg text-gold">
            أكثروا من الصلاة على النبي ﷺ
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            من مغرب الخميس إلى مغرب الجمعة
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HadithSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Rotate every 10 s; pause while the reader hovers or focuses, and reset
  // the timer whenever the index changes manually.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % HADITHS.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [paused, index]);

  const hadith = HADITHS[index];

  return (
    <section
      className="border-t border-border/60 px-6 py-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="mb-8 text-xs tracking-widest text-muted-foreground">
          فضل الصلاة على النبي
        </p>

        <div className="flex min-h-40 w-full items-center justify-center sm:min-h-36">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <p className="font-display text-xl leading-loose sm:text-2xl sm:leading-loose">
                «{hadith.text}»
              </p>
              <footer className="mt-5 text-sm text-muted-foreground">
                — {hadith.source}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="الحديث السابق"
            onClick={() => setIndex((i) => (i - 1 + HADITHS.length) % HADITHS.length)}
          >
            <ChevronRight aria-hidden />
          </Button>
          <div className="flex items-center gap-1.5">
            {HADITHS.map((h, i) => (
              <button
                key={h.source + i}
                type="button"
                aria-label={`الحديث ${i + 1} من ${HADITHS.length}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`size-1.5 rounded-full transition-colors ${
                  i === index ? "bg-gold" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="الحديث التالي"
            onClick={() => setIndex((i) => (i + 1) % HADITHS.length)}
          >
            <ChevronLeft aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Tasbih() {
  const { count, increment } = useSalawatCount();
  const formatted = useMemo(() => count.toLocaleString("en-US"), [count]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <span className="font-display text-lg">صلِّ على النبي ﷺ</span>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-muted-foreground"
        >
          <Link to="/settings" aria-label="الإعدادات">
            <Settings aria-hidden />
          </Link>
        </Button>
      </header>

      <ReminderBanner />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <motion.button
          type="button"
          onClick={increment}
          whileTap={{ scale: 0.985 }}
          aria-label="اضغط للصلاة على النبي ﷺ"
          className="relative flex flex-col items-center gap-4 rounded-3xl px-10 py-12 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-16"
        >
          {/* soft radial glow that breathes on each tap */}
          <motion.span
            key={count}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.8_0.115_85/0.13),transparent_65%)] blur-2xl"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0.45 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <motion.span
            key={`n-${count}`}
            className="relative text-7xl font-light tabular-nums text-gold sm:text-8xl"
            initial={{ opacity: 0.55, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {formatted}
          </motion.span>
          <span className="font-display text-2xl text-gold/95 sm:text-3xl">
            صلِّ على محمد ﷺ
          </span>
          <span className="text-sm text-muted-foreground">
            اضغط في أي مكان للعدّ
          </span>
          <span role="status" className="sr-only">
            العدد الحالي {formatted}
          </span>
        </motion.button>

        <ResetCounterDialog>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground hover:text-foreground"
          >
            تصفير العداد
          </Button>
        </ResetCounterDialog>
      </main>

      <HadithSection />

      <footer className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
        يعمل دون اتصال — بياناتك محفوظة على جهازك
      </footer>
    </div>
  );
}
