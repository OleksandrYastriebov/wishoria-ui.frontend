import api from './axios';
import type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  MessageResponse,
  UserProfileDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  WishListsResponse,
  WishListDto,
  CreateWishlistRequest,
  UpdateWishlistRequest,
  WishListItemDto,
  CreateItemRequest,
  UpdateItemRequest,
  ToggleCheckedRequest,
  WishlistAccessResponse,
  GrantAccessRequest,
  CommentsResponse,
  CommentDto,
  CreateCommentRequest,
  ImageUploadResponse,
  GenerateDescriptionRequest,
  GenerateDescriptionResponse,
  GenerateWishlistRequest,
  PublicUserDto,
  UserProfileResponseDto,
  UserAutocompleteDto,
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signIn = (data: SignInRequest) =>
  api.post<SignInResponse>('/sign-in', data).then((r) => r.data);

export const signUp = (data: SignUpRequest) =>
  api.post<MessageResponse>('/sign-up', data).then((r) => r.data);

export const signOut = () =>
  api.post<MessageResponse>('/sign-out').then((r) => r.data);

export const resendConfirmationEmail = (email: string) =>
  api.post<MessageResponse>('/resend-confirmation-email', { email }).then((r) => r.data);

export const forgotPassword = (data: ForgotPasswordRequest) =>
  api.post<MessageResponse>('/forgot-password', data).then((r) => r.data);

export const resetPassword = (data: ResetPasswordRequest) =>
  api.post<MessageResponse>('/reset-password', data).then((r) => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────

export const getMe = () =>
  api.get<UserProfileDto>('/users/me').then((r) => r.data);

export const updateMe = (data: UpdateProfileRequest) =>
  api.patch<UserProfileDto>('/users/me', data).then((r) => r.data);

export const changePassword = (data: ChangePasswordRequest) =>
  api.patch<MessageResponse>('/users/me/password', data).then((r) => r.data);

export const deleteAccount = (userId: number) =>
  api.delete<MessageResponse>(`/users/${userId}`).then((r) => r.data);

// ─── Wishlists ────────────────────────────────────────────────────────────────

export const getWishlists = () =>
  api.get<WishListsResponse>('/wishlists').then((r) => r.data);

export const getWishlist = (wishlistId: string) =>
  api.get<WishListDto>(`/wishlists/${wishlistId}`).then((r) => r.data);

export const createWishlist = (data: CreateWishlistRequest) =>
  api.post<WishListDto>('/wishlists', data).then((r) => r.data);

export const updateWishlist = (wishlistId: string, data: UpdateWishlistRequest) =>
  api.patch<MessageResponse>(`/wishlists/${wishlistId}`, data).then((r) => r.data);

export const deleteWishlist = (wishlistId: string) =>
  api.delete<MessageResponse>(`/wishlists/${wishlistId}`).then((r) => r.data);

// ─── Wishlist Items ───────────────────────────────────────────────────────────

export const createItem = (wishlistId: string, data: CreateItemRequest) =>
  api.post<WishListItemDto>(`/wishlists/${wishlistId}`, data).then((r) => r.data);

export const updateItem = (wishlistId: string, itemId: string, data: UpdateItemRequest) =>
  api
    .patch<WishListItemDto>(`/wishlists/${wishlistId}/wishes/${itemId}`, data)
    .then((r) => r.data);

export const deleteItem = (wishlistId: string, itemId: string) =>
  api
    .delete<MessageResponse>(`/wishlists/${wishlistId}/wishes/${itemId}`)
    .then((r) => r.data);

export const toggleItemChecked = (
  wishlistId: string,
  itemId: string,
  data: ToggleCheckedRequest
) =>
  api
    .patch<MessageResponse>(`/wishlists/${wishlistId}/wishes/${itemId}/checked`, data)
    .then((r) => r.data);

// ─── Access ───────────────────────────────────────────────────────────────────

export const getWishlistAccess = (wishlistId: string) =>
  api.get<WishlistAccessResponse>(`/wishlists/${wishlistId}/access`).then((r) => r.data);

export const grantAccess = (wishlistId: string, data: GrantAccessRequest) =>
  api.post<MessageResponse>(`/wishlists/${wishlistId}/access`, data).then((r) => r.data);

export const revokeAccess = (wishlistId: string, email: string) =>
  api
    .delete<MessageResponse>(`/wishlists/${wishlistId}/access`, { data: { email } })
    .then((r) => r.data);

// ─── Comments ─────────────────────────────────────────────────────────────────

export const getComments = (wishlistId: string, itemId: string) =>
  api
    .get<CommentsResponse>(`/wishlists/${wishlistId}/wishes/${itemId}/comments`)
    .then((r) => r.data);

export const createComment = (
  wishlistId: string,
  itemId: string,
  data: CreateCommentRequest
) =>
  api
    .post<CommentDto>(`/wishlists/${wishlistId}/wishes/${itemId}/comments`, data)
    .then((r) => r.data);

export const deleteComment = (wishlistId: string, itemId: string, commentId: number) =>
  api
    .delete<MessageResponse>(`/wishlists/${wishlistId}/wishes/${itemId}/comments/${commentId}`)
    .then((r) => r.data);

// ─── AI ───────────────────────────────────────────────────────────────────────

export const generateItemDescription = (
  wishlistId: string,
  data: GenerateDescriptionRequest
) =>
  api
    .post<GenerateDescriptionResponse>(
      `/ai/wishlists/${wishlistId}/generate-description`,
      data
    )
    .then((r) => r.data);

export const generateWishlist = (data: GenerateWishlistRequest) =>
  api.post<WishListDto>('/ai/wishlists/generate-wishlists', data).then((r) => r.data);

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const searchUsers = (query: string) =>
  api.get<PublicUserDto[]>('/profiles/search', { params: { q: query } }).then((r) => r.data);

export const autocompleteUsers = (query: string) =>
  api.get<UserAutocompleteDto[]>('/profiles/autocomplete', { params: { q: query } }).then((r) => r.data);

export const getUserProfile = (userId: number) =>
  api.get<UserProfileResponseDto>(`/profiles/${userId}`).then((r) => r.data);

// ─── Images ───────────────────────────────────────────────────────────────────

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post<ImageUploadResponse>('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
