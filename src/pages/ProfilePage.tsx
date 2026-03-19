import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Camera, Key, Trash2, AlertTriangle, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SeoMeta } from '../components/ui/SeoMeta';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { updateMe, changePassword, deleteAccount } from '../api/endpoints';
import { useUploadImage } from '../hooks/useUploadImage';
import { useClipboardPaste } from '../hooks/useClipboardPaste';
import type { ChangePasswordRequest } from '../types';

// ─── Profile form schema ──────────────────────────────────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Password form schema ─────────────────────────────────────────────────────
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const uploadMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  // Password form
  const {
    register: regPassword,
    handleSubmit: handlePasswordForm,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    setError: setPasswordError,
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onProfileSave = async (data: ProfileFormData) => {
    try {
      const updated = await updateMe(data);
      updateUser(updated);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  const handleAvatarFile = async (file: File) => {
    if (!user) return;
    try {
      const { url } = await uploadMutation.mutateAsync(file);
      const updated = await updateMe({ avatarUrl: url });
      updateUser(updated);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar.');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleAvatarFile(file);
  };

  const handleDeleteAvatar = async () => {
    if (!user?.avatarUrl || isDeletingAvatar) return;
    setIsDeletingAvatar(true);
    try {
      const updated = await updateMe({ avatarUrl: null });
      updateUser(updated);
      toast.success('Avatar deleted!');
    } catch {
      toast.error('Failed to delete avatar.');
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  useClipboardPaste((file) => void handleAvatarFile(file));

  const onPasswordChange = async (data: PasswordFormData) => {
    const payload: ChangePasswordRequest = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };
    try {
      await changePassword(payload);
      toast.success('Password changed successfully!');
      setIsPasswordOpen(false);
      resetPassword();
    } catch {
      setPasswordError('root', { message: 'Current password is incorrect.' });
      toast.error('Failed to change password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await deleteAccount(user.id);
      await logout();
      toast.success('Account deleted.');
      void navigate('/');
    } catch {
      toast.error('Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <SeoMeta title="Account" />
      <div className="max-w-xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
          <p className="text-sm text-[#9898b4]">Manage your account settings</p>
        </motion.div>

        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                src={user.avatarUrl}
                firstName={user.firstName}
                lastName={user.lastName}
                size="xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60"
                aria-label="Change avatar"
              >
                <Camera size={12} />
              </button>
              {user.avatarUrl && (
                <button
                  onClick={() => void handleDeleteAvatar()}
                  disabled={uploadMutation.isPending || isDeletingAvatar}
                  className="absolute bottom-0 left-0 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-60"
                  aria-label="Remove avatar"
                >
                  <Trash size={12} />
                </button>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-[#9898b4]">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="text-xs text-violet-400 hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded transition-colors disabled:opacity-60"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Change photo'}
                </button>
              </div>
              <p className="text-xs text-[#55556e] mt-0.5">Max file size: 5 MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleAvatarUpload(e)}
          />
        </motion.div>

        {/* Personal info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6"
        >
          <h2 className="text-base font-semibold text-white mb-4">Personal Information</h2>
          <form
            onSubmit={(e) => void handleProfile(onProfileSave)(e)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                error={profileErrors.firstName?.message}
                {...regProfile('firstName')}
              />
              <Input
                label="Last name"
                error={profileErrors.lastName?.message}
                {...regProfile('lastName')}
              />
            </div>
            <Input
              label="Email"
              value={user.email}
              disabled
              hint="Email cannot be changed."
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={profileSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6"
        >
          <h2 className="text-base font-semibold text-white mb-1">Security</h2>
          <p className="text-sm text-[#9898b4] mb-4">Manage your password</p>
          <Button
            variant="secondary"
            leftIcon={<Key size={15} />}
            onClick={() => setIsPasswordOpen(true)}
          >
            Change password
          </Button>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-red-500/5 rounded-2xl border border-red-500/20 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-sm text-[#9898b4] mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <Button
            variant="danger"
            leftIcon={<Trash2 size={15} />}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete account
          </Button>
        </motion.div>
      </div>

      {/* Change password modal */}
      <Modal
        isOpen={isPasswordOpen}
        onClose={() => {
          setIsPasswordOpen(false);
          resetPassword();
        }}
        title="Change Password"
        size="sm"
      >
        <form
          onSubmit={(e) => void handlePasswordForm(onPasswordChange)(e)}
          className="p-6 space-y-4"
        >
          <Input
            label="Current password"
            type="password"
            error={passwordErrors.currentPassword?.message}
            {...regPassword('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            error={passwordErrors.newPassword?.message}
            {...regPassword('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={passwordErrors.confirmPassword?.message}
            {...regPassword('confirmPassword')}
          />
          {passwordErrors.root && (
            <p className="text-sm text-red-400">{passwordErrors.root.message}</p>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsPasswordOpen(false);
                resetPassword();
              }}
              disabled={passwordSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={passwordSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete account confirmation modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmText('');
        }}
        title="Delete Account"
        size="sm"
      >
        <div className="p-6">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <p className="text-sm text-red-300 leading-relaxed">
              This will permanently delete your account, all wishlists, items, and comments.
              <strong> This action cannot be undone.</strong>
            </p>
          </div>
          <p className="text-sm text-[#9898b4] mb-3">
            Type <strong className="text-white">DELETE</strong> to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/25 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteConfirmText('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => void handleDeleteAccount()}
              disabled={deleteConfirmText !== 'DELETE'}
              isLoading={isDeleting}
            >
              Delete forever
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
