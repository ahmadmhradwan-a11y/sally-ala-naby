import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { patchSettings, useSalawatCount, useSettings } from "@/lib/storage";
import { cn } from "@/lib/utils";

const BUBBLE = 60; // px
const MARGIN = 10; // px keep-out from screen edges
const DRAG_THRESHOLD = 6; // px before a press becomes a drag

interface DragStart {
  pointerX: number;
  pointerY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

function clampPos(p: { x: number; y: number }) {
  return {
    x: Math.min(Math.max(p.x, MARGIN), window.innerWidth - BUBBLE - MARGIN),
    y: Math.min(Math.max(p.y, MARGIN), window.innerHeight - BUBBLE - MARGIN),
  };
}

function defaultPos() {
  return clampPos({ x: window.innerWidth - BUBBLE - 20, y: window.innerHeight - 170 });
}

/** Gold bead ring drawn around the bubble. */
function BeadRing() {
  return (
    <svg viewBox="0 0 60 60" className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const radius = 24;
        const cx = 30 + radius * Math.cos(angle);
        const cy = 30 + radius * Math.sin(angle);
        const isTop = i === 0;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={isTop ? 3 : 1.6}
            fill="#d9b978"
            opacity={isTop ? 0.9 : 0.4}
          />
        );
      })}
    </svg>
  );
}

function TasbihBubble() {
  const { count, increment } = useSalawatCount();
  const savedPos = useSettings().tasbihPos;
  const [pos, setPos] = useState(() => savedPos ?? defaultPos());
  const [dragging, setDragging] = useState(false);
  const [overZone, setOverZone] = useState(false);
  const dragStart = useRef<DragStart | null>(null);
  const overZoneRef = useRef(false);
  const zoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const endDrag = useCallback(
    (
      clientX: number,
      clientY: number,
      pointer: DragStart,
      opts: { wasTap: boolean },
    ) => {
      dragStart.current = null;
      setDragging(false);
      if (opts.wasTap) {
        overZoneRef.current = false;
        setOverZone(false);
        increment();
        return;
      }
      const dropped = overZoneRef.current;
      overZoneRef.current = false;
      setOverZone(false);
      if (dropped) {
        patchSettings({ tasbihEnabled: false });
        return;
      }
      const final = clampPos({
        x: pointer.originX + (clientX - pointer.pointerX),
        y: pointer.originY + (clientY - pointer.pointerY),
      });
      setPos(final);
      patchSettings({ tasbihPos: final });
    },
    [increment],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    dragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStart.current;
    if (!start) return;
    const dx = e.clientX - start.pointerX;
    const dy = e.clientY - start.pointerY;
    if (!start.moved) {
      if (Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
      start.moved = true;
      setDragging(true);
    }
    setPos(clampPos({ x: start.originX + dx, y: start.originY + dy }));
    const zone = zoneRef.current?.getBoundingClientRect();
    if (zone) {
      const cx = zone.left + zone.width / 2;
      const cy = zone.top + zone.height / 2;
      const near = Math.hypot(e.clientX - cx, e.clientY - cy) < zone.width * 0.9;
      overZoneRef.current = near;
      setOverZone(near);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStart.current;
    if (!start) return;
    endDrag(e.clientX, e.clientY, start, { wasTap: !start.moved });
  };

  const onPointerCancel = () => {
    const start = dragStart.current;
    if (!start) return;
    overZoneRef.current = false;
    setOverZone(false);
    setDragging(false);
    dragStart.current = null;
  };

  return (
    <>
      <motion.div
        className="fixed z-[70]"
        style={{ left: pos.x, top: pos.y, width: BUBBLE, height: BUBBLE }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: overZone ? 0.85 : dragging ? 1.08 : 1,
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      >
        <button
          type="button"
          aria-label={`سبحة الصلاة على النبي العائمة، العدد ${count}. اضغط للزيادة، اسحب للتحريك، واسحب نحو زر الإغلاق أسفل الشاشة.`}
          className={cn(
            "flex h-full w-full touch-none select-none items-center justify-center rounded-full",
            "border border-gold/30 bg-background/80 backdrop-blur-md glow-gold-soft",
            "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "transition-colors",
            dragging && "border-gold/60",
            overZone && "bg-destructive/15",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              increment();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              increment();
            }
          }}
        >
          <BeadRing />
          <span className="text-sm font-medium tabular-nums text-gold">
            {count.toLocaleString("en-US")}
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {dragging && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2"
          >
            <div
              ref={zoneRef}
              className={cn(
                "flex size-16 items-center justify-center rounded-full border backdrop-blur-md transition-colors",
                overZone
                  ? "border-destructive/70 bg-destructive/15"
                  : "border-border bg-background/70",
              )}
            >
              <X
                className={cn(
                  "size-6 transition-colors",
                  overZone ? "text-destructive" : "text-muted-foreground",
                )}
                aria-hidden
              />
            </div>
            <span className="text-xs text-muted-foreground">أفلت هنا للإغلاق</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * The floating tasbih — mounted at the app root so it stays above every
 * page while enabled, like a floating bubble overlay.
 */
export default function FloatingTasbih() {
  const tasbihEnabled = useSettings().tasbihEnabled;
  return (
    <AnimatePresence>{tasbihEnabled && <TasbihBubble key="tasbih-bubble" />}</AnimatePresence>
  );
}
