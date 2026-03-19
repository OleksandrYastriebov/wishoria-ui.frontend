import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';
import { SeoMeta } from '../components/ui/SeoMeta';
import { resetPassword } from '../api/endpoints';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    try {
      await resetPassword({ token, newPassword: data.newPassword });
      setSucceeded(true);
    } catch {
      setError('root', {
        message: 'The reset link is invalid or has expired. Please request a new one.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#08080e]">
      <SeoMeta title="Set New Password" />
      <Navbar />
      <div className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)] pointer-events-none" />
        <div className="w-full max-w-sm relative">
          <AnimatePresence mode="wait">
            {!token ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-[#111118] rounded-2xl border border-white/[0.07] shadow-2xl shadow-black/40 p-8 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
                    <AlertTriangle size={22} className="text-red-400" />
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">Invalid link</h1>
                  <p className="text-sm text-[#9898b4] mb-6">
                    This reset link is missing or malformed. Please request a new one.
                  </p>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-violet-400 font-medium hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  >
                    Request new link
                  </Link>
                </div>
              </motion.div>
            ) : !succeeded ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-[#111118] rounded-2xl border border-white/[0.07] shadow-2xl shadow-black/40 p-8">
                  <h1 className="text-xl font-bold text-white mb-1">Set new password</h1>
                  <p className="text-sm text-[#9898b4] mb-6">
                    Choose a strong password of at least 8 characters.
                  </p>

                  <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
                    <Input
                      label="New password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      error={errors.newPassword?.message}
                      {...register('newPassword')}
                    />
                    <Input
                      label="Confirm new password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                    />

                    {errors.root && (
                      <p className="text-sm text-red-400">{errors.root.message}</p>
                    )}

                    <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                      Reset password
                    </Button>
                  </form>

                  <p className="text-sm text-[#9898b4] text-center mt-5">
                    <Link
                      to="/sign-in"
                      className="text-violet-400 font-medium hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded inline-flex items-center gap-1"
                    >
                      <ArrowLeft size={13} />
                      Back to sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-[#111118] rounded-2xl border border-white/[0.07] shadow-2xl shadow-black/40 p-8 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 mx-auto mb-4">
                    <CheckCircle size={22} className="text-violet-400" />
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">Password updated!</h1>
                  <p className="text-sm text-[#9898b4] mb-6">
                    Your password has been changed. You can now sign in with your new credentials.
                  </p>
                  <Link
                    to="/sign-in"
                    className="text-sm text-violet-400 font-medium hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={13} />
                    Sign in
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
