'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const { login } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      router.push('/wishlists');
    } catch {
      setError('root', { message: 'Invalid email or password.' });
      toast.error('Sign in failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fefdf8]">
      <Navbar />
      <div className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.06)_0%,_transparent_70%)] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-sm relative">
          <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/70 shadow-[0_16px_64px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] p-8">
            <h1 className="text-xl font-bold text-stone-900 mb-1">Welcome back</h1>
            <p className="text-sm text-stone-500 mb-6">Sign in to your account</p>
            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
              <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              <div>
                <Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
                <div className="flex justify-end mt-1.5">
                  <Link href="/forgot-password" className="text-xs text-amber-700 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded transition-colors">Forgot password?</Link>
                </div>
              </div>
              {errors.root && <p className="text-sm text-red-400 text-center">{errors.root.message}</p>}
              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Sign in</Button>
            </form>
            <p className="text-sm text-stone-500 text-center mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-amber-700 font-medium hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded">Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
