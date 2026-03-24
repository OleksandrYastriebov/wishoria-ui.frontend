'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';
import { forgotPassword } from '../api/endpoints';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await forgotPassword(data);
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fefdf8]">
      <Navbar />
      <div className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.07)_0%,_transparent_70%)] pointer-events-none" />
        <div className="w-full max-w-sm relative">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] p-8">
                  <h1 className="text-xl font-bold text-stone-900 mb-1">Forgot password?</h1>
                  <p className="text-sm text-stone-500 mb-6">Enter your email and we'll send you a reset link.</p>
                  <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
                    <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                    {errors.root && <p className="text-sm text-red-500 text-center">{errors.root.message}</p>}
                    <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Send reset link</Button>
                  </form>
                  <p className="text-sm text-stone-500 text-center mt-5">
                    <Link href="/sign-in" className="text-amber-700 font-medium hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded inline-flex items-center gap-1"><ArrowLeft size={13} />Back to sign in</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] p-8 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-4"><MailCheck size={22} className="text-amber-500" /></div>
                  <h1 className="text-xl font-bold text-stone-900 mb-2">Check your inbox</h1>
                  <p className="text-sm text-stone-500 mb-1">If <span className="text-stone-900 font-medium">{submittedEmail}</span> is registered, you'll receive a password reset link shortly.</p>
                  <p className="text-xs text-stone-400 mb-6">The link expires in 1 hour.</p>
                  <Link href="/sign-in" className="text-sm text-amber-700 font-medium hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded inline-flex items-center gap-1"><ArrowLeft size={13} />Back to sign in</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
