'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, Lock, Users, ChevronRight, Sparkles, Globe, Star, Heart, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const features = [
  { icon: Gift, title: 'Curate your wishlists', desc: 'Add items from anywhere — links, prices, images and descriptions all in one beautiful place.' },
  { icon: Sparkles, title: 'Generate with AI', desc: "Describe what you want and Wishoria's AI will build a complete wishlist for you in seconds." },
  { icon: Users, title: 'Secret coordination', desc: 'Friends can discuss and reserve items without spoiling the surprise for the wishlist owner.' },
  { icon: Lock, title: 'Private by default', desc: 'Your wishlists are private until you decide to share them. Full control, always.' },
];

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const fadeUpDelayed = (delay: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay } } });

const bentoTiles = [
  { colSpan: 'lg:col-span-2 sm:col-span-2', gradient: 'from-amber-200/50 to-yellow-100/30', icon: Heart, label: 'Birthday Wishlist', sub: '8 items · 2 reserved', badge: 'Public', badgeColor: 'bg-emerald-100/80 text-emerald-700' },
  { colSpan: 'col-span-1', gradient: 'from-sky-200/50 to-blue-100/30', icon: Star, label: 'Holiday Gifts', sub: '12 items', badge: 'Private', badgeColor: 'bg-stone-100/80 text-stone-500' },
  { colSpan: 'col-span-1', gradient: 'from-orange-200/50 to-amber-100/30', icon: Package, label: 'Tech Gadgets', sub: '5 items · 1 reserved', badge: 'Public', badgeColor: 'bg-emerald-100/80 text-emerald-700' },
  { colSpan: 'lg:col-span-2 sm:col-span-2', gradient: 'from-emerald-200/50 to-teal-100/30', icon: Gift, label: 'Wedding Registry', sub: '24 items · 8 reserved', badge: 'Private', badgeColor: 'bg-stone-100/80 text-stone-500' },
  { colSpan: 'col-span-1', gradient: 'from-rose-200/50 to-pink-100/30', icon: Sparkles, label: 'Dream Items', sub: '3 items', badge: 'Private', badgeColor: 'bg-stone-100/80 text-stone-500' },
  { colSpan: 'col-span-1', gradient: 'from-purple-200/50 to-violet-100/30', icon: Globe, label: 'Travel Gear', sub: '7 items · 3 reserved', badge: 'Public', badgeColor: 'bg-emerald-100/80 text-emerald-700' },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) { router.replace('/wishlists'); }
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#fefdf8]" />
        <div className="absolute -top-48 -left-48 w-[800px] h-[800px] rounded-full bg-amber-200/40 blur-[180px]" />
        <div className="absolute -top-24 right-0 w-[550px] h-[550px] rounded-full bg-yellow-100/60 blur-[200px]" />
        <div className="absolute top-[20%] -right-72 w-[600px] h-[600px] rounded-full bg-orange-100/50 blur-[200px]" />
        <div className="absolute top-[40%] left-[10%] w-[500px] h-[500px] rounded-full bg-amber-100/40 blur-[180px]" />
        <div className="absolute top-[55%] left-[15%] w-[500px] h-[500px] rounded-full bg-yellow-200/30 blur-[200px]" />
        <div className="absolute bottom-0 right-[5%] w-[450px] h-[450px] rounded-full bg-amber-50/60 blur-[160px]" />
        <div className="absolute -bottom-20 left-[35%] w-[500px] h-[350px] rounded-full bg-orange-100/40 blur-[160px]" />
      </div>
      <nav className="sticky top-0 z-40 px-3 sm:px-5 pt-3 pb-1.5">
        <div className="relative max-w-5xl mx-auto bg-white/90 backdrop-blur-2xl border border-stone-200/80 rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.12),0_12px_40px_rgba(0,0,0,0.08)] px-4 sm:px-5 flex items-center justify-between h-16 overflow-hidden">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-amber-200/30 blur-2xl pointer-events-none z-0" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-yellow-100/40 blur-2xl pointer-events-none z-0" />
          <div className="flex items-center gap-2.5 font-bold text-stone-900 z-10">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-400/40">
              <Sparkles size={14} className="text-white" />
            </div>
            <span>Wishoria</span>
          </div>
          <div className="flex items-center gap-2 z-10">
            <Link href="/sign-in" className="px-3 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Sign in</Link>
            <Link href="/sign-up" className="px-3.5 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fefdf8]">Get started free</Link>
          </div>
        </div>
      </nav>
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col items-center relative">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/50 text-amber-700 text-sm font-medium mb-6 backdrop-blur-sm">
            <Sparkles size={14} />
            Where wishes come to life
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl font-bold text-stone-900 leading-tight tracking-tight max-w-3xl">
            Your wishlists,{' '}<span className="text-amber-600">beautifully organized</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-lg text-stone-500 max-w-xl leading-relaxed">
            Create and share wishlists for any occasion. Let friends secretly coordinate gifts without spoiling the surprise.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-400 active:bg-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fefdf8]">
              Create your first wishlist<ChevronRight size={18} />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-stone-700 bg-white/80 backdrop-blur-sm border border-stone-300/80 rounded-xl hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Sign in</Link>
          </motion.div>
        </motion.div>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <motion.div {...fadeUpDelayed(0.3)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bentoTiles.map((tile, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }} className={`${tile.colSpan} relative bg-white/85 backdrop-blur-xl rounded-2xl border border-stone-200/80 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.10)]`} style={{ minHeight: '160px' }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.gradient} opacity-60`} />
              <div className="relative p-5 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center"><tile.icon size={18} className="text-stone-600" /></div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border border-black/10 ${tile.badgeColor}`}>{tile.badge}</span>
                </div>
                <div><h3 className="font-semibold text-stone-800 text-sm">{tile.label}</h3><p className="text-stone-500 text-xs mt-0.5">{tile.sub}</p></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div variants={stagger} initial="initial" animate="animate" transition={{ delayChildren: 0.35 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/70 hover:border-amber-300/60 hover:bg-white/80 transition-colors group shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center mb-3 group-hover:bg-amber-200/80 transition-colors"><f.icon size={18} className="text-amber-600" /></div>
              <h3 className="font-semibold text-stone-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div {...fadeUpDelayed(0.7)} className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to share your wishes?</h2>
          <p className="text-amber-100 mb-6 text-base">Join thousands of people who use Wishoria to organize their wishlists.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-amber-500">
            Get started for free<ChevronRight size={16} />
          </Link>
        </motion.div>
      </section>
      <footer className="border-t border-black/[0.06] py-8 text-center text-sm text-stone-400">
        <div className="flex items-center justify-center gap-2"><Sparkles size={14} className="text-amber-500/60" /><span>Wishoria — where wishes come to life</span></div>
      </footer>
    </div>
  );
}
