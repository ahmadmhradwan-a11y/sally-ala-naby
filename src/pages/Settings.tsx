import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ResetCounterDialog } from "@/components/ResetCounterDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  patchSettings,
  useSalawatCount,
  useSettings,
  type MaghribMode,
} from "@/lib/storage";
import { maghribOn } from "@/lib/sunset";
import { cn } from "@/lib/utils";

function Section({
  title,
  description,
  control,
  children,
}: {
  title: string;
  description?: string;
  control?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 py-7">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="font-medium">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {control && <div className="flex shrink-0 items-center">{control}</div>}
      </div>
      {children}
    </section>
  );
}

/** Small two-option selector for how maghrib is computed. */
function MaghribModeSelector({
  value,
  onPick,
}: {
  value: MaghribMode;
  onPick: (mode: MaghribMode) => void;
}) {
  const options: { key: MaghribMode; label: string }[] = [
    { key: "estimate", label: "تقدير عام" },
    { key: "location", label: "حسب موقعي" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="طريقة حساب المغرب"
      className="inline-flex rounded-full border border-border/60 bg-muted/50 p-1"
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="radio"
          aria-checked={value === option.key}
          onClick={() => onPick(option.key)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs transition-colors",
            value === option.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const settings = useSettings();
  const { count } = useSalawatCount();
  const [locating, setLocating] = useState(false);

  const maghribToday = useMemo(() => {
    const t = maghribOn(new Date(), settings.location);
    if (!t) return null;
    return new Intl.DateTimeFormat("ar", {
      hour: "numeric",
      minute: "2-digit",
    }).format(t);
  }, [settings.location, settings.maghribMode]);

  const toggleTasbih = (checked: boolean) => patchSettings({ tasbihEnabled: checked });

  const toggleNotifications = async (checked: boolean) => {
    if (!checked) {
      patchSettings({ notificationsEnabled: false });
      return;
    }
    if (typeof Notification === "undefined") {
      toast.error("متصفحك لا يدعم الإشعارات");
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission === "granted") {
      patchSettings({ notificationsEnabled: true });
      toast.success("تم تفعيل تذكير يوم الجمعة");
    } else {
      toast.error("لم يُسمح بالإشعارات من المتصفح");
    }
  };

  const pickMaghribMode = (mode: MaghribMode) => {
    if (mode === settings.maghribMode) return;
    if (mode === "estimate") {
      patchSettings({ maghribMode: "estimate" });
      return;
    }
    if (!("geolocation" in navigator)) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        patchSettings({
          maghribMode: "location",
          location: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        });
        setLocating(false);
        toast.success("تم اعتماد موقعك لحساب موعد المغرب");
      },
      () => {
        setLocating(false);
        toast.error("تعذّر تحديد موقعك — سيبقى التقدير العام معتمدًا");
      },
      { timeout: 10_000, maximumAge: 3_600_000 },
    );
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/tasbih" aria-label="رجوع">
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <h1 className="text-lg font-medium">الإعدادات</h1>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 divide-y divide-border/60 px-5 pb-16">
        <Section
          title="السبحة العائمة"
          description="سبحة صغيرة تظهر فوق كل الصفحات؛ اضغطها للعدّ، اسحبها لتحريكها، وأفلتها فوق زر الإغلاق لإخفائها."
          control={
            <Switch
              id="tasbih-switch"
              checked={settings.tasbihEnabled}
              onCheckedChange={toggleTasbih}
              aria-label="تفعيل السبحة العائمة"
            />
          }
        />

        <Section
          title="تذكير يوم الجمعة"
          description="إشعار واحد هادئ في اليوم خلال الفترة من مغرب الخميس إلى مغرب الجمعة، بينما يكون التطبيق مفتوحًا."
          control={
            <Switch
              id="notify-switch"
              checked={settings.notificationsEnabled}
              onCheckedChange={toggleNotifications}
              aria-label="تفعيل تذكير يوم الجمعة"
            />
          }
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm text-muted-foreground">
                حساب موعد المغرب
              </Label>
              <MaghribModeSelector
                value={settings.maghribMode}
                onPick={pickMaghribMode}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {locating
                ? "جارٍ تحديد موقعك…"
                : maghribToday
                  ? `المغرب اليوم (تقديري): ${maghribToday}`
                  : "المغرب اليوم: غير متاح في هذا الموقع"}
            </p>
          </div>
        </Section>

        <Section
          title="العداد"
          description={`مجموع الصلوات المُحفوظ على جهازك: ${count.toLocaleString("en-US")}`}
          control={
            <ResetCounterDialog>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                تصفير
              </Button>
            </ResetCounterDialog>
          }
        />

        <Section title="حول التطبيق">
          <div className="flex flex-col gap-3 text-sm leading-7 text-muted-foreground">
            <p>
              تطبيقٌ شخصيٌّ هادئ للصلاة على النبي ﷺ: عدّادٌ يُحفظ تلقائيًا على هذا
              الجهاز، وسبحةٌ عائمة، وتذكيرٌ يومَ الجمعة.
            </p>
            <p>
              الأحاديث المعروضة من مصادر موثوقة: البخاري ومسلم، وما حسّنه الترمذي
              وأبو داود والنسائي.
            </p>
            <p>
              لا حسابات ولا خوادم — كل شيء يبقى على هذا الجهاز، ويعمل التطبيق
              دون اتصال.
            </p>
            <p className="text-xs">الإصدار ١٫٠</p>
          </div>
        </Section>
      </main>
    </div>
  );
}
