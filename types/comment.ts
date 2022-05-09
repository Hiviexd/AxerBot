import { Timestamp } from "./timestamp";
import { CommentUser, UserCompact } from "./user";

export type CommentSort = "new" | "old" | "top";

export interface CommentableMeta {
	id: number;
	type: "build" | "news_post" | "beatmapset";
	title: string;
	url: string;
	owner_id: number;
	owner_title: string;
}

export interface CommentCompact {
	id: number;
	parent_id: number;
	user_id: number;
	pinned: boolean;
	replies_count: number;
	votes_count: number;
	commentable_type: "build" | "news_post" | "beatmapset";
	commentable_id: number;
	legacy_name: string | null;
	created_at: Timestamp;
	updated_at: Timestamp;
	deleted_at: null | Timestamp;
	edited_at: null | Timestamp;
	edited_by_id: null | Timestamp;
	message: string;
	message_html: string;
}

export interface Comment {
	comments: CommentCompact[];
	has_more: boolean;
	has_more_id: number;
	included_comments: CommentCompact[];
	pinned_comments: CommentCompact[] | [];
	user_votes: [];
	user_follow: boolean;
	users: CommentUser[];
	sort: CommentSort;
	cursor: {
		created_at: Timestamp;
		id: number;
	};
	commentable_meta: CommentableMeta[];
}

export interface CommentResponse {
	status: number;
	data: Comment;
}
