import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CircleDot, Hash, Settings } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Hash,
    title: "عدّادٌ لا يضيع",
    text: "يُحفظ مجموعُ صلواتك على جهازك تلقائيًا، ويعود بعد إغلاق التطبيق.",
  },
  {
    icon: CircleDot,
    title: "سبحةٌ عائمة",
    text: "سبحة ذهبية صغيرة تلازمك فوق الصفحات؛ اضغطها للعدّ، واسحبها إلى ✕ لإغلاقها.",
  },
  {
    icon: BookOpen,
    title: "أحاديث موثوقة",
    text: "فضل الصلاة على النبي ﷺ من البخاري ومسلم وغيرهما، وكلٌّ بمصدره.",
  },
];

/** Simple eight-pointed star ornament — the only decoration on the page. */
function Ornament() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="size-14 text-gold/45"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <rect x="14" y="14" width="36" height="36" />
      <rect x="14" y="14" width="36" height="36" transform="rotate(45 32 32)" />
      <circle cx="32" cy="32" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* one very soft gold halo behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-12rem] size-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.8_0.115_85/0.09),transparent_62%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <span className="text-sm text-muted-foreground">صلِّ على النبي</span>
        <Button variant="ghost" size="icon" asChild className="text-muted-foreground">
          <Link to="/settings" aria-label="الإعدادات">
            <Settings aria-hidden />
          </Link>
        </Button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <Ornament />
          <h1 className="mt-8 font-display text-5xl leading-snug sm:text-6xl">
            صلِّ على النبي <span className="text-gold">ﷺ</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
            عدّادٌ هادئ للصلاة على النبي، وسبحةٌ عائمة تلازمك أينما كنت، وتذكيرٌ
            خفيفٌ يومَ الجمعة — كلٌّ ذلك دون اتصال.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <Button size="lg" asChild className="glow-gold-soft">
              <Link to="/tasbih">
                ابدأ الذكر
                <ArrowLeft aria-hidden />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/settings">الإعدادات</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mt-16 w-full max-w-3xl border-t border-border/60 pt-10 sm:mt-20"
        >
          <div className="grid gap-10 text-start sm:grid-cols-3 sm:gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-2.5">
                <feature.icon className="size-5 text-gold/80" aria-hidden />
                <h2 className="font-medium">{feature.title}</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
        يعمل دون اتصال • بلا حساب • بياناتك محفوظة على جهازك
      </footer>
    </div>
  );
}
