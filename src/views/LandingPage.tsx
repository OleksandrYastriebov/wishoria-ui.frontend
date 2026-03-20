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
  { colSpan: 'lg:col-span-2 sm:col-span-2', gradient: 'from-violet-600/30 to-purple-700/20', icon: Heart, label: 'Birthday Wishlist', sub: '8 items · 2 reserved', badge: 'Public', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { colSpan: 'col-span-1', gradient: 'from-blue-600/30 to-indigo-700/20', icon: Star, label: 'Holiday Gifts', sub: '12 items', badge: 'Private', badgeColor: 'bg-white/10 text-white/40' },
  { colSpan: 'col-span-1', gradient: 'from-amber-600/30 to-orange-700/20', icon: Package, label: 'Tech Gadgets', sub: '5 items · 1 reserved', badge: 'Public', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { colSpan: 'lg:col-span-2 sm:col-span-2', gradient: 'from-emerald-600/30 to-teal-700/20', icon: Gift, label: 'Wedding Registry', sub: '24 items · 8 reserved', badge: 'Private', badgeColor: 'bg-white/10 text-white/40' },
  { colSpan: 'col-span-1', gradient: 'from-pink-600/30 to-rose-700/20', icon: Sparkles, label: 'Dream Items', sub: '3 items', badge: 'Private', badgeColor: 'bg-white/10 text-white/40' },
  { colSpan: 'col-span-1', gradient: 'from-violet-600/30 to-fuchsia-700/20', icon: Globe, label: 'Travel Gear', sub: '7 items · 3 reserved', badge: 'Public', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
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
        <div className="absolute inset-0 bg-[#08080e]" />
        <div className="absolute -top-48 -left-48 w-[800px] h-[800px] rounded-full bg-violet-700/[0.22] blur-[160px]" />
        <div className="absolute -top-24 right-0 w-[550px] h-[550px] rounded-full bg-[#0abfbc]/[0.10] blur-[180px]" />
        <div className="absolute top-[20%] -right-72 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.13] blur-[180px]" />
        <div className="absolute top-[40%] left-[10%] w-[500px] h-[500px] rounded-full bg-pink-600/[0.10] blur-[180px]" />
        <div className="absolute top-[55%] left-[15%] w-[500px] h-[500px] rounded-full bg-purple-800/[0.12] blur-[200px]" />
        <div className="absolute bottom-0 right-[5%] w-[450px] h-[450px] rounded-full bg-[#2dd4bf]/[0.09] blur-[160px]" />
        <div className="absolute -bottom-20 left-[35%] w-[500px] h-[350px] rounded-full bg-fuchsia-700/[0.09] blur-[160px]" />
      </div>
      <nav className="sticky top-0 z-40 px-3 sm:px-5 pt-3 pb-1.5">
        <div className="relative max-w-5xl mx-auto bg-[#13131f]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl shadow-black/30 px-4 sm:px-5 flex items-center justify-between h-16 overflow-hidden">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-violet-500/30 blur-2xl pointer-events-none z-0" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-72 h-20 rounded-full bg-[#0abfbc]/25 blur-2xl pointer-events-none z-0" />
          <div className="flex items-center gap-2.5 font-bold text-white">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md shadow-violet-500/30">
              <Sparkles size={14} className="text-white" />
            </div>
            <span>Wishoria</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="px-3 py-1.5 text-sm font-medium text-[#9898b4] hover:text-white transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">Sign in</Link>
            <Link href="/sign-up" className="px-3.5 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080e]">Get started free</Link>
          </div>
        </div>
      </nav>
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col items-center relative">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <Sparkles size={14} />
            Where wishes come to life
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight max-w-3xl">
            Your wishlists,{' '}<span className="text-violet-400">beautifully organized</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-lg text-[#9898b4] max-w-xl leading-relaxed">
            Create and share wishlists for any occasion. Let friends secretly coordinate gifts without spoiling the surprise.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-500 active:bg-violet-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080e]">
              Create your first wishlist<ChevronRight size={18} />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-white/[0.07] rounded-xl hover:bg-white/[0.1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">Sign in</Link>
          </motion.div>
        </motion.div>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <motion.div {...fadeUpDelayed(0.3)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bentoTiles.map((tile, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }} className={`${tile.colSpan} relative bg-[#111118] rounded-2xl border border-white/[0.06] overflow-hidden`} style={{ minHeight: '160px' }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.gradient} opacity-60`} />
              <div className="relative p-5 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.1] flex items-center justify-center"><tile.icon size={18} className="text-white/70" /></div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border border-white/10 ${tile.badgeColor}`}>{tile.badge}</span>
                </div>
                <div><h3 className="font-semibold text-white text-sm">{tile.label}</h3><p className="text-white/40 text-xs mt-0.5">{tile.sub}</p></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div variants={stagger} initial="initial" animate="animate" transition={{ delayChildren: 0.35 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="p-5 rounded-2xl bg-[#111118] border border-white/[0.06] hover:border-violet-500/30 hover:bg-[#18181f] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3 group-hover:bg-violet-500/20 transition-colors"><f.icon size={18} className="text-violet-400" /></div>
              <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-[#9898b4] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div {...fadeUpDelayed(0.7)} className="bg-gradient-to-br from-violet-700 to-purple-800 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to share your wishes?</h2>
          <p className="text-violet-200 mb-6 text-base">Join thousands of people who use Wishoria to organize their wishlists.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-700 font-semibold rounded-xl hover:bg-violet-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-700">
            Get started for free<ChevronRight size={16} />
          </Link>
        </motion.div>
      </section>
      <footer className="border-t border-white/[0.06] py-8 text-center text-sm text-[#55556e]">
        <div className="flex items-center justify-center gap-2"><Sparkles size={14} className="text-violet-500/50" /><span>Wishoria — where wishes come to life</span></div>
      </footer>
    </div>
  );
}
