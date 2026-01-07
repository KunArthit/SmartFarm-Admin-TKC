// src/types/chatTypes.ts

export type User = {
	user_id: number;
	first_name?: string;
	last_name?: string;
	username: string;
	email?: string;
	type_name?: string;
	department_name?: string;
	is_active?: number;
	updated_at?: string;
	created_at?: string;
	phone?: string;
	displayName?: string;
	photoURL?: string;
};

export type Chat = {
	id: number;
	name: string;
	avatar: string;
	preview: string;
	unread: number;
	lastMessage: string;
	isOnline: boolean;
	email?: string;
	department?: string;
	userType?: string;
	phone?: string;
	sessionId?: number;
	sessionType?: string;
};

export type Message = {
	message_id: number;
	message_text: string;
	sender_type: string;
	sender_id: number;
	session_id: number;
	receiver_user_id: number;
	is_read: boolean;
	created_at: string;
	status?: string;
};

export type SessionResponse = {
	session_id: number;
	user_id: number;
	session_type: string;
	status: string;
	created_at: string;
	closed_at: string | null;
};

export type SessionHistory = {
	session_id: number;
	session_type: string;
	status: string;
	created_at: string;
	last_message: string | null;
	last_time: string | null;
};
