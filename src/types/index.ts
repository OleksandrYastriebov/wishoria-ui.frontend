export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  jwtToken: string;
  type: string;
  id: number;
  email: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface SignUpResponse {
  message: string;
  userId: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
}

export interface UserProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  profileDescription: string | null;
  isPrivate: boolean;
  dateOfBirth: string | null;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  profileDescription?: string;
  isPrivate?: boolean;
  dateOfBirth?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface WishListItemDto {
  id: string;
  wishListId: string;
  title: string;
  url: string | null;
  price: number | null;
  description: string | null;
  imageUrl: string | null;
  isChecked: boolean;
  checkedByUserId: number | null;
  createdAt: string;
}

export interface WishListDto {
  id: string;
  userId: number;
  wishListItems: WishListItemDto[];
  title: string;
  isPublic: boolean;
  imageUrl: string | null;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type WishListsResponse = PagedResponse<WishListDto>;

export interface CreateWishlistRequest {
  title: string;
  isPublic?: boolean;
  imageUrl?: string;
}

export interface UpdateWishlistRequest {
  title?: string;
  isPublic?: boolean;
  imageUrl?: string;
}

export interface CreateItemRequest {
  title: string;
  url?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateItemRequest {
  title?: string;
  url?: string | null;
  price?: number | null;
  description?: string | null;
  isChecked?: boolean;
  imageUrl?: string | null;
}

export interface ToggleCheckedRequest {
  isChecked: boolean;
}

export interface WishlistAccessResponse {
  emails: string[];
}

export interface GrantAccessRequest {
  email: string;
}

export interface RevokeAccessRequest {
  email: string;
}

export interface CommentDto {
  id: number;
  text: string;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
}

export type CommentsResponse = PagedResponse<CommentDto>;

export interface CreateCommentRequest {
  text: string;
}

export interface ImageUploadResponse {
  url: string;
}

export interface UserAutocompleteDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

export interface PublicUserDto {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  privateProfile: boolean;
  profileDescription: string | null;
  dateOfBirth: string | null;
}

export interface UserProfileResponseDto {
  user: PublicUserDto;
  publicWishlists: PagedResponse<WishListDto>;
}

export interface GenerateDescriptionRequest {
  title: string;
  base64Image?: string;
  mimeType?: string;
}

export interface GenerateDescriptionResponse {
  description: string;
}

export interface GenerateWishlistRequest {
  description: string;
  isPublic?: boolean;
}

export interface GiftSuggestionsResponse {
  suggestions: string[];
}
