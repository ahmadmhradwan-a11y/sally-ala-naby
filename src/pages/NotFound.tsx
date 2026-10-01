import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground"
    >
      <p className="font-display text-6xl text-gold">٤٠٤</p>
      <p className="text-lg">الصفحة غير موجودة</p>
      <p className="max-w-sm text-sm leading-7 text-muted-foreground">
        ربما تغيّر الرابط أو حُذفت الصفحة.
      </p>
      <Button variant="outline" asChild className="mt-2">
        <Link to="/tasbih">العودة إلى التطبيق</Link>
      </Button>
    </motion.main>
  );
}
