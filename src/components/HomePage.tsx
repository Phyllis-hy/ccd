"use client";

import Link from "next/link";
import Image from "next/image";
import TeamCard from "@/src/components/Team/TeamCard";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;
import { useEffect, useMemo, useRef, useState } from "react";


/** 非 Hero 页 header 高度（用于扣掉内容区高度） */
const HEADER_H = 72;
/** 防连滚时间（ms） */
const LOCK_MS = 1150;
const TRANSITION_SEC = 0.95;
const EASE_SOFT: [number, number, number, number] = [0.16, 1, 0.3, 1];

type PageKey = "hero" | "features" | "process" | "insights" | "faq" | "team";

const pageOrder: PageKey[] = ["hero", "features", "process", "insights", "faq", "team"];

const pageIndex: Record<PageKey, number> = {
  hero: 0,
  features: 1,
  process: 2,
  insights: 3,
  faq: 4,
  team: 5,
};

export default function HomePage() {
  const [idx, setIdx] = useState(0);
  const isHero = idx === 0;

  const [dir, setDir] = useState<1 | -1>(1);
  const lockRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const go = (next: number) => {
    if (!Number.isFinite(next)) return; // ✅ 防止 undefined/NaN 把 idx 搞崩

    setIdx((cur) => {
      const clamped = Math.max(0, Math.min(pageOrder.length - 1, next));
      if (clamped !== cur) setDir(clamped > cur ? 1 : -1);
      return clamped;
    });
  };

  const lock = () => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, LOCK_MS);
  };

  // 1) 滚轮翻页
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (lockRef.current) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 12) return;

      const step = delta > 0 ? 1 : -1;
      go(idx + step);
      lock();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [idx]);

  // 2) 触摸翻页
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (lockRef.current) return;
      const startY = touchStartY.current;
      if (startY == null) return;

      const endY = e.changedTouches[0]?.clientY ?? startY;
      const diff = startY - endY; // 正：上滑
      if (Math.abs(diff) < 40) return;

      const step = diff > 0 ? 1 : -1;
      go(idx + step);
      lock();
      touchStartY.current = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [idx]);

  // 3) 键盘翻页
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lockRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        go(idx + 1);
        lock();
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        go(idx - 1);
        lock();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [idx]);

  const pages = useMemo(() => {
    return [
      <HeroPage key="hero" onGo={go} />,
      <FeaturesPage key="features" />,
      <ProcessPage key="process" />,
      <InsightsPage key="insights" />,
      <FaqPage key="faq" />,
      <TeamPage key="team" />,
    ];
  }, []);

  return (
    <div className="h-screen bg-[#f7f7f5] text-neutral-900 overflow-hidden">
      {/* ✅ 非 Hero 页才显示你的原 header（其它页面完全不动） */}
      {!isHero && (
        <header className="sticky top-0 z-50 bg-[#f7f7f5]/80 backdrop-blur border-b border-black/5">
          <div className="mx-auto max-w-6xl px-6 py-4 grid grid-cols-3 items-center">
            {/* 左侧：导航（改成跳页，不用 #anchor） */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
              <button onClick={() => go(pageIndex.features)} className="relative hover:text-neutral-900">
                <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-neutral-900 after:transition-all after:duration-300 hover:after:w-full">
                  Features
                </span>
              </button>

              <button onClick={() => go(pageIndex.process)} className="relative hover:text-neutral-900">
                <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-neutral-900 after:transition-all after:duration-300 hover:after:w-full">
                  Process
                </span>
              </button>

              <button onClick={() => go(pageIndex.faq)} className="relative hover:text-neutral-900">
                <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-neutral-900 after:transition-all after:duration-300 hover:after:w-full">
                  FAQ
                </span>
              </button>
              
              <button onClick={() => go(pageIndex.team)} className="relative hover:text-neutral-900">
                <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-neutral-900 after:transition-all after:duration-300 hover:after:w-full">
                  About Team
                </span>
              </button>
            </nav>

            {/* 中间：Logo */}
            <div className="flex justify-center">
            <button
                onClick={() => go(0)}
                className="group relative flex items-baseline
                        text-[18px] md:text-[20px] font-semibold tracking-tight"
            >
                <span className="text-neutral-900">Idea</span>

                <span
                className="bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600
                            bg-clip-text text-transparent font-bold
                            transition-all duration-300
                            group-hover:brightness-110"
                >
                Sense
                <span className="text-indigo-500/80 font-semibold">
                .AI
                </span>
                </span>
            </button>
            </div>




            {/* 右侧：Auth */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/login"
                className="text-sm px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="relative text-sm px-4 py-1.5 rounded-full bg-indigo-600 text-white hover:opacity-90
                           shadow-[0_10px_30px_rgba(99,102,241,0.35)]
                           hover:shadow-[0_15px_45px_rgba(99,102,241,0.45)]
                           transition-shadow"
              >
                Register
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* ✅ 内容区：Hero 满屏，其他页扣掉 header */}
      <div
        style={{ height: isHero ? "100vh" : `calc(100vh - ${HEADER_H}px)` }}
        className="relative"
      >
        {/* Progress bar */}
        <div className="absolute left-0 right-0 top-0 z-10">
          <div className="h-[2px] bg-black/5" />
          <motion.div
            className="h-[2px] bg-indigo-600"
            initial={false}
            animate={{ width: `${((idx + 1) / pageOrder.length) * 100}%` }}
            transition={{ duration: TRANSITION_SEC, ease: EASE_SOFT }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{
              opacity: 0,
              y: dir === 1 ? 36 : -36,
              scale: 0.985,
              filter: "blur(12px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: dir === 1 ? -30 : 30,
              scale: 1.012,
              filter: "blur(12px)",
            }}
            transition={{ duration: TRANSITION_SEC, ease: EASE_SOFT }}
            className="h-full will-change-transform"
          >
            {pages[idx]}
          </motion.div>
        </AnimatePresence>

        {/* 右侧翻页指示器 */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2">
          {pageOrder.map((k, i) => (
            <button
              key={k}
              onClick={() => go(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === idx ? "bg-neutral-900 scale-110" : "bg-neutral-300 hover:bg-neutral-500"
              }`}
              aria-label={`Go to ${k}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Pages (each is one screen)
=========================== */

function PageShell({
  children,
  scroll = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <section className={scroll ? "h-full overflow-y-auto" : "h-full flex items-center"}>
      <div className="mx-auto max-w-6xl w-full px-6">{children}</div>
    </section>
  );
}

/* ===========================
   HERO
=========================== */

function HeroPage({ onGo }: { onGo: (n: number) => void }) {
  const slides = [
    { type: "video" as const, src: "/frontpage.mp4", label: "Video" },
    { type: "image" as const, src: "/homepageimage1.png", label: "Image" },
  ];

  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (slides[active]?.type === "video") {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActive((i) => (i + 1) % slides.length);

  return (
    <section className="relative h-full overflow-hidden">
      {/* ✅ 叠在视频上的 Hero 专属导航（像你图2） */}
      <HeroNav onGo={onGo} />

      {/* ===== 背景层：轮播 ===== */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.9, ease: easeOut }}
            className="absolute inset-0"
            style={{ willChange: "transform, opacity" }}
          >
            {slides[active].type === "video" ? (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              >
                <source src={slides[active].src} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={slides[active].src}
                alt="Hero background"
                fill
                priority
                sizes="100vw"
                className="object-contain p-6"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#f7f7f5]/30" />
      </div>

      {/* ===== 内容层 ===== */}
      <div className="h-full flex items-center pt-10 md:pt-14">
        <div className="mx-auto max-w-6xl w-full px-6 text-center text-white">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs backdrop-blur">
            ✨ IdeaSense.AI · Product Innovation Copilot
          </p>

          <h1 className="mx-auto mt-6 max-w-5xl font-serif leading-[0.95] drop-shadow">
            {/* 主标题：品牌 */}
            <span className="block text-[52px] sm:text-[72px] md:text-[96px]">
                IdeaSense.AI
            </span>

            {/* 副标题：产品定位 */}
            <span className="mt-4 block text-[24px] sm:text-[30px] md:text-[36px] font-medium text-white/85">
                Your AI Co-Pilot for Product Innovation
            </span>
        </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-white/85">
            Turn ideas into structured decisions with guided steps, clear summaries, and shareable outputs.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-indigo-600 text-white text-sm hover:opacity-90
                         shadow-[0_10px_30px_rgba(99,102,241,0.45)]"
            >
              Get Started
            </Link>

          </div>
        </div>
      </div>

      {/* ===== 切换器 ===== */}
      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="h-10 w-10 rounded-full border border-white/25 bg-white/10 backdrop-blur
                     hover:bg-white/15 transition"
          aria-label="Previous"
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={[
                "h-2.5 w-2.5 rounded-full transition",
                i === active ? "bg-white" : "bg-white/35 hover:bg-white/60",
              ].join(" ")}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="h-10 w-10 rounded-full border border-white/25 bg-white/10 backdrop-blur
                     hover:bg-white/15 transition"
          aria-label="Next"
        >
          →
        </button>
      </div>
    </section>
  );
}

/** ✅ Hero 专属 Nav：覆盖在视频上 */
function HeroNav({ onGo }: { onGo: (n: number) => void }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      {/* 顶部渐变遮罩：保证字清晰 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 py-4 grid grid-cols-3 items-center">
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/85">
          <button onClick={() => onGo(pageIndex.features)} className="hover:text-white">
            <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white/90 after:transition-all after:duration-300 hover:after:w-full">
              Features
            </span>
          </button>

          <button onClick={() => onGo(pageIndex.process)} className="hover:text-white">
            <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white/90 after:transition-all after:duration-300 hover:after:w-full">
              Process
            </span>
          </button>

          <button onClick={() => onGo(pageIndex.faq)} className="hover:text-white">
            <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white/90 after:transition-all after:duration-300 hover:after:w-full">
              FAQ
            </span>
          </button>

          <button onClick={() => onGo(pageIndex.team)} className="hover:text-white">
            <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white/90 after:transition-all after:duration-300 hover:after:w-full">
              About Team
            </span>
          </button>

        </nav>

        <div className="flex justify-center">
        <span className="h-6 w-24" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/login"
            className="text-sm px-3 py-1.5 rounded-full border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/15 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="text-sm px-4 py-1.5 rounded-full bg-white text-neutral-900 hover:bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   OTHER PAGES
   下面这些我保持你的逻辑（你原来怎么写就怎么写）
=========================== */

function FeaturesPage() {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 18, scale: 0.985, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.95, ease: easeOut },
    },
  };

  const textBlock = {
    hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: easeOut, delay: 0.05 },
    },
  };

  return (
    <PageShell>
      <div className="w-full py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div className="grid grid-cols-12 gap-4" variants={container} initial="hidden" animate="show">
            <motion.div
              variants={item}
              className="col-span-7 row-span-2"
              whileHover={{ y: -7, rotate: -0.7, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <motion.div
                className="relative aspect-[3.5/5] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                style={{ willChange: "transform", transform: "translateZ(0)" }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image src="/features/f1.png" alt="feature collage 1" fill className="object-cover" priority />
              </motion.div>
            </motion.div>

            <motion.div
              variants={item}
              className="col-span-5"
              whileHover={{ y: -7, rotate: 0.9, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <motion.div
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                style={{ willChange: "transform", transform: "translateZ(0)" }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5.9, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
              >
                <Image src="/features/f2.png" alt="feature collage 2" fill className="object-cover" />
              </motion.div>
            </motion.div>

            <motion.div
              variants={item}
              className="col-span-5"
              whileHover={{ y: -7, rotate: -0.9, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <motion.div
                className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                style={{ willChange: "transform", transform: "translateZ(0)" }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.12 }}
              >
                <Image src="/features/f3.png" alt="feature collage 3" fill className="object-cover" />
              </motion.div>
            </motion.div>

            <motion.div
              variants={item}
              className="col-span-12"
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <motion.div
                className="relative aspect-[16/6] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                style={{ willChange: "transform", transform: "translateZ(0)" }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 7.1, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
              >
                <Image src="/features/f4.png" alt="feature collage 4" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div variants={textBlock} initial="hidden" animate="show" className="max-w-xl">
            <p className="text-xs italic tracking-wide text-indigo-600/80">About Product Value</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight">Everyone deserves a chance to innovate.</h2>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px w-16 bg-indigo-600/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600/70" />
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <p className="mt-5 text-sm text-neutral-600 leading-relaxed">
              IdeaSense.AI helps founders and product teams turn early ideas into structured decisions —
              with guided stages, evidence-focused prompts, and shareable summaries.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-indigo-600 text-white text-sm hover:opacity-90
                           shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
              >
                Get Started
              </Link>

            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}

function ProcessCard({
  index,
  title,
  desc,
}: {
  index: string;
  title: string;
  desc: string;
}) {
  const controls = useAnimation();
  const [active, setActive] = useState(false);

  const shake = async () => {
    setActive(true);

    // 抖动：左右 + 轻微旋转
    await controls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      rotate: [0, -1.2, 1.2, -1, 1, -0.6, 0.6, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
  };

  return (
    <motion.button
      type="button"
      onClick={shake}
      animate={controls}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={[
        "group relative text-left rounded-3xl border p-6 shadow-sm outline-none",
        "bg-white/70 backdrop-blur",
        "transition-colors",
        active ? "border-indigo-300 bg-indigo-50/60" : "border-black/10 hover:border-indigo-200 hover:bg-indigo-50/40",
        "focus-visible:ring-2 focus-visible:ring-indigo-400/60",
      ].join(" ")}
    >
      {/* 顶部编号 */}
      <div className="flex items-start justify-between">
        <p className="text-xs text-neutral-400">{index}</p>

        {/* 小光点（hover 会更亮） */}
        <span className="h-2 w-2 rounded-full bg-neutral-200 group-hover:bg-indigo-400 transition-colors" />
      </div>

      <h4 className="mt-2 text-lg font-semibold text-neutral-900">{title}</h4>

      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{desc}</p>

      {/* 底部渐变高光：hover更明显 */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/5" />
    </motion.button>
  );
}


function ProcessPage() {
  // 右侧卡片容器：stagger
  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  // 每张卡片：入场弹出
  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.98, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: easeOut },
    },
  };

  return (
    <PageShell>
      <section id="process" className="pt-12 md:pt-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-10 pb-16 md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest text-neutral-400">Process</p>

            <h3 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
              Structured Ideation Process
            </h3>

            <p className="mx-auto mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">
              A four-stage flow that guides you from problem framing to a final report — with clear steps and shareable outputs.
            </p>

            <div className="mx-auto mt-6 h-px w-16 bg-neutral-200" />
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* 左侧文字块：也给个轻微入场 */}
            <motion.div
              className="max-w-xl"
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: easeOut }}
            >
              <p className="text-sm text-neutral-600 leading-relaxed">
                Focus on essentials: define the problem, validate the market, check feasibility,
                and generate a report you can share with teammates or mentors.
              </p>

              <ol className="mt-6 space-y-3 text-sm text-neutral-700">
                <li className="flex gap-3">
                  <span className="w-8 shrink-0 text-neutral-300">01</span>
                  <span>Identify the Problem &amp; Pain Points</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-8 shrink-0 text-neutral-300">02</span>
                  <span>Analyze Market &amp; Competitors</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-8 shrink-0 text-neutral-300">03</span>
                  <span>Evaluate Tech Feasibility</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-8 shrink-0 text-neutral-300">04</span>
                  <span>Generate a Final Report</span>
                </li>
              </ol>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-indigo-600 text-white text-sm hover:opacity-90"
                >
                  Get Started
                </Link>

              </div>
            </motion.div>

            {/* 右侧卡片：stagger 出现 + hover/click */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              variants={gridVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={cardVariants}>
                <ProcessCard index="01" title="Problem" desc="Define the user, clarify pain points, and set measurable goals." />
              </motion.div>

              <motion.div variants={cardVariants}>
                <ProcessCard index="02" title="Market" desc="Validate demand and position the idea among competitors." />
              </motion.div>

              <motion.div variants={cardVariants}>
                <ProcessCard index="03" title="Tech" desc="Assess feasibility, constraints, risks, and implementation path." />
              </motion.div>

              <motion.div variants={cardVariants}>
                <ProcessCard index="04" title="Report" desc="Export a structured summary to share and iterate on decisions." />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function InsightsPage() {
    // 进入页面时：左文右图分段出现
    const wrap = {
      hidden: {},
      show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
    };
  
    const fadeUp = {
      hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: easeOut },
      },
    };
  
    const picIn = {
      hidden: { opacity: 0, y: 18, scale: 0.98, filter: "blur(10px)" },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.8, ease: easeOut, delay: 0.05 },
      },
    };
  
    return (
      <PageShell>
        {/* ✅ 图2那种“干净白底”感觉：去掉大块玻璃框，只留排版 */}
        <section className="w-full py-12 md:py-16">
          <motion.div
            variants={wrap}
            initial="hidden"
            animate="show"
            className="mx-auto w-full max-w-6xl px-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-14">
              {/* 左：标题 + 文案（图2风格） */}
              <div className="max-w-xl">
                <motion.p
                  variants={fadeUp}
                  className="text-xs tracking-[0.35em] text-neutral-400"
                >
                  IDEASENSE.AI
                </motion.p>
  
                {/* ✅ 模仿图2：标题里做一个强调色 */}
                <motion.h3
                    variants={fadeUp}
                    className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900"
                    >
                    <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                        Welcome
                    </span>
                    <br />
                    to <span className="font-mono font-normal">IdeaSense.AI</span>
                </motion.h3>

  
                <motion.p
                  variants={fadeUp}
                  className="mt-4 text-sm md:text-base text-neutral-600 leading-relaxed"
                >
                  Turn an idea into a consulting-grade analysis — instantly. Make smarter decisions with
                  evidence, not guesswork. Our structured stages help you validate early, iterate faster,
                  and produce shareable outputs.
                </motion.p>
  
                <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm md:text-base hover:opacity-90
                               shadow-[0_14px_40px_rgba(99,102,241,0.35)] transition"
                  >
                    Request a Demo
                  </Link>

                </motion.div>
  
                <motion.p variants={fadeUp} className="mt-6 text-sm text-neutral-500">
                  Or contact us:{" "}
                  <span className="text-neutral-900 font-medium">Group Money Thief</span>
                </motion.p>
              </div>
  
              {/* 右：两张图交叠（图2核心）+ 动效 */}
              <motion.div variants={picIn} className="relative">
                {/* ✅ 这个容器控制整体“拼贴”的尺寸 */}
                <div className="relative mx-auto w-full max-w-[560px]">
                  {/* 背后那张（偏大） */}
                  <motion.div
                    className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ y: -8, rotate: -0.6, scale: 1.01 }}
                  >
                    <div className="relative aspect-[16/10]">
                      <Image
                        src="/homeimage3.png"
                        alt="Insight image main"
                        fill
                        priority
                        className="object-cover"
                      />
                    </div>
                    {/* 轻微高光 */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10" />
                  </motion.div>
  
                  {/* 前面那张（偏小，叠在右上） */}
                  <motion.div
                    className="absolute -right-3 -top-6 w-[62%] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                    whileHover={{ y: -10, rotate: 0.8, scale: 1.03 }}
                  >
                    <div className="relative aspect-[4/3]">
                      {/* 你可以换成另一张图，比如 /homepageimage2.png */}
                      <Image
                        src="/homeimage4.png"
                        alt="Insight image overlay"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
  
                  {/* ✅ 小装饰点（像你 Process 卡片角上的那种） */}
                  <div className="pointer-events-none absolute -left-3 -bottom-3 h-3 w-3 rounded-full bg-neutral-300/60" />
                  <div className="pointer-events-none absolute left-6 -bottom-6 h-2 w-2 rounded-full bg-indigo-400/40" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </PageShell>
    );
  }
  

function FaqPage() {
  const faqs = [
    {
      q: "What is IdeaSense.AI?",
      a: "IdeaSense.AI is an AI co-pilot that guides founders, PMs, and students through structured stages to turn ideas into consulting-grade decisions.",
    },
    {
      q: "Who is IdeaSense.AI for?",
      a: "Early-stage founders, product teams, and students who want clarity on problem framing, market validation, tech feasibility, and reporting.",
    },
    {
      q: "How is IdeaSense different from ChatGPT?",
      a: "IdeaSense focuses on a multi-stage workflow (Problem → Market → Tech → Report) with structured prompts and shareable outputs, rather than a single open-ended chat.",
    },
    {
      q: "Do I need any technical or business background?",
      a: "No. The flow is step-by-step and designed for beginners. You can start with just an idea and iterate as you learn.",
    },
    {
      q: "Can I export or share results?",
      a: "Yes. Each stage produces summaries designed to be shared with teammates or mentors, and the final report can be used as a decision artifact.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <PageShell>
      <section className="w-full">
        <div className="py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Help</p>

          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            Frequently Asked Questions
          </h2>

          <p className="mt-3 max-w-3xl text-sm md:text-base text-neutral-600 leading-relaxed">
            Quick answers about the workflow, who it’s for, and how to get value fast.
          </p>


          <div className="mt-10 max-w-4xl space-y-4">
            {faqs.map((item, i) => {
              const open = openIndex === i;
              return (
                <div key={item.q} className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur">
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-medium text-neutral-900">{item.q}</span>
                    <span className="text-neutral-500">{open ? "–" : "+"}</span>
                  </button>

                  {open && (
                    <div className="px-5 pb-5 text-sm md:text-base text-neutral-600 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-indigo-600 text-white text-sm hover:opacity-90
                         shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
            >
              Get Started
            </Link>
            
          </div>
        </div>
      </section>
    </PageShell>
  );
}


function TeamPage() {
    const container = {
      hidden: {},
      show: {
        transition: {
          staggerChildren: 0.08,
          delayChildren: 0.05,
        },
      },
    };
  
    const fadeUp = {
      hidden: { opacity: 0, y: 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: easeOut },
      },
    };
  
    const hoverLift: TargetAndTransition = {
      y: -6,
      transition: { type: "spring", stiffness: 280, damping: 20 },
    };
  
    const members = [
      { name: "Phyllis Zhou", role: "Backend", image: "/team/head1.png" },
      { name: "Linda Li", role: "Frontend", image: "/team/head2.png" },
      { name: "Chen Lu", role: "AI", image: "/team/head3.png" },
      { name: "Wenqing Ji", role: "Frontend", image: "/team/head4.png" },
      { name: "Jingyi Yang", role: "Backend", image: "/team/head5.png" },
    ];
    const [showCollaborateDetail, setShowCollaborateDetail] = useState(false);
  
    return (
      <section className="w-full bg-[#f7f7f5]">
        <div className="py-14 md:py-16">
          {/* Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-6xl px-6"
          >
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">IdeaSense.AI</p>
  
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
                Our Team
              </h2>
  
              <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">
                A small, focused team building an AI co-pilot that helps founders and product teams
                turn ideas into structured decisions.
              </p>
  
              <div className="mt-4 flex items-center gap-3">
                <div className="h-px w-16 bg-black/15" />
                <div className="h-1.5 w-1.5 rounded-full bg-black/25" />
                <div className="h-px flex-1 bg-black/10" />
              </div>
            </div>
          </motion.div>
  
          {/* Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto mt-10 max-w-6xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-items-stretch"
          >
            {/* Team cards */}
            {members.map((m) => (
              <motion.div
                key={m.name}
                variants={fadeUp}
                whileHover={hoverLift}
                className="group relative w-full h-full"
              >
                {/* 原 TeamCard */}
                <div className="w-full h-[120px] transition-opacity duration-200 group-hover:opacity-0">
                  <TeamCard name={m.name} role={m.role} image={m.image} />
                </div>
  
                {/* hover 蓝色版本层 */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/12 via-transparent to-sky-500/12" />
  
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-sm font-semibold text-indigo-600">{m.name}</p>
                    <p className="mt-0.5 text-xs text-indigo-500/90">{m.role}</p>
                  </div>
                </div>
  
                {/* hover 边框增强 */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent group-hover:border-indigo-500/20 transition-colors duration-200" />
              </motion.div>
            ))}
  
            {/* Collaborate card */}
            <motion.div variants={fadeUp} className="w-full h-[120px]">
              <AnimatePresence mode="wait" initial={false}>
                {showCollaborateDetail ? (
	                  <motion.button
	                    key="collab-detail"
	                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
	                    whileHover={{ scale: 1.02, rotate: 0.2 }}
	                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
	                    onClick={() => setShowCollaborateDetail(false)}
	                    className="w-full h-full rounded-3xl border border-dashed border-black/20 bg-white/40 px-5 py-4 text-left hover:border-solid hover:border-black/30 overflow-hidden flex flex-col justify-between"
	                  >
	                    <p className="text-sm font-medium text-neutral-900 leading-tight">Want to collaborate?</p>
	                    <p className="text-xs md:text-sm text-neutral-600 leading-snug">
	                      We&apos;re always open to feedback and collaboration.
	                    </p>
	                    <div className="flex items-center justify-between gap-2">
	                      <p className="text-xs md:text-sm text-neutral-800 font-medium truncate">
	                        compsci 778 - Group Money Thief
	                      </p>
	                      <p className="text-[11px] text-neutral-500 shrink-0">Click to collapse</p>
	                    </div>
	                  </motion.button>
                ) : (
                  <motion.button
                    key="collab-bubble"
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    whileHover={hoverLift}
                    onClick={() => setShowCollaborateDetail(true)}
                    className="w-full h-full rounded-2xl border border-black/10 bg-white p-6 flex items-center gap-4 text-left"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-lg font-semibold text-indigo-700">
                      +
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Want to collaborate?</p>
                      <p className="text-sm text-neutral-600">Click to view details</p>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
  
            {/* Footer */}
            <motion.div variants={fadeUp} className="sm:col-span-2 lg:col-span-3 w-full">
              <div className="mt-4 text-xs text-neutral-500">
                © {new Date().getFullYear()} IdeaSense.AI. All rights reserved.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }
