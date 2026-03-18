// ─── Auth ────────────────────────────────────────────────────────────────────

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

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

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

export interface WishListsResponse {
  wishLists: WishListDto[];
}

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

// ─── Wishlist Items ───────────────────────────────────────────────────────────

export interface CreateItemRequest {
  title: string;
  url?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateItemRequest {
  title?: string;
  url?: string;
  price?: number;
  description?: string;
  isChecked?: boolean;
  imageUrl?: string;
}

export interface ToggleCheckedRequest {
  isChecked: boolean;
}

// ─── Access ───────────────────────────────────────────────────────────────────

export interface WishlistAccessResponse {
  emails: string[];
}

export interface GrantAccessRequest {
  email: string;
}

export interface RevokeAccessRequest {
  email: string;
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface CommentDto {
  id: number;
  text: string;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
}

export interface CommentsResponse {
  comments: CommentDto[];
}

export interface CreateCommentRequest {
  text: string;
}

// ─── Images ───────────────────────────────────────────────────────────────────

export interface ImageUploadResponse {
  url: string;
}

// ─── Public Profiles ──────────────────────────────────────────────────────────

export interface PublicUserDto {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface UserProfileResponseDto {
  user: PublicUserDto;
  publicWishlists: WishListDto[];
}

// ─── AI ───────────────────────────────────────────────────────────────────────

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
