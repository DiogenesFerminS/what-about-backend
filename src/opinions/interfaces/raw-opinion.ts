export interface RawOpinion {
  opinion_opinion_id: string;
  opinion_content: string;
  opinion_image_url: string | null;
  opinion_is_edited: boolean;
  opinion_created_at: Date;
  user_user_id: string;
  user_email: string;
  user_username: string;
  user_name: string;
  user_avatarUrl: string;
  likeCount: string;
  isLiked: string;
  isRepostedByMe: string;
  repostCount: string;
}
