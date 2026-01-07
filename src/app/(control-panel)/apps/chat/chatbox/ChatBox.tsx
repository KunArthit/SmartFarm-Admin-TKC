/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import useUser from '@auth/useUser';
import {
	Box,
	Avatar,
	Typography,
	InputBase,
	IconButton,
	CircularProgress,
	Badge,
	Menu,
	MenuItem,
	Tooltip,
	Paper
} from '@mui/material';
import { Search, Info, MoreVert, AttachFile, InsertEmoticon, Send } from '@mui/icons-material';
import { User, Chat, Message, SessionResponse, SessionHistory } from '../ChatType';
import { useTranslation } from 'react-i18next';

const ChatUI: React.FC = () => {
	const { data: user, isGuest } = useUser();
	const { t } = useTranslation('Chat');
	// User configuration
	const senderId: number =
		typeof user?.id === 'string' ? parseInt(user.id, 10) : typeof user?.id === 'number' ? user.id : 1;

	const currentUserName: string =
		(user?.displayName as string) ||
		(user?.email as string) ||
		`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
		'' ||
		(user?.username as string) ||
		'User';

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	// State management
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState<string>('');
	const [chats, setChats] = useState<Chat[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [isTyping, setIsTyping] = useState<boolean>(false);
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
	const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);

	// Refs
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messageInputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom of messages
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	// Format time for chat preview
	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return t('Yesterday');

		if (diffDays < 7) return date.toLocaleDateString('en', { weekday: 'short' });

		return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
	};

	// Format message time
	const formatMessageTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString('en', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Get sender info based on sender type and ID
	const getSenderInfo = (senderType: string, senderId: number) => {
		// Check if it's the current user
		if (senderId === user?.user_id) {
			return {
				name: currentUserName,
				avatar:
					user?.first_name?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || currentUserName[0],
				photoURL: user?.photoURL,
				isCurrentUser: true
			};
		}

		// For other users, try to find them in chats list
		const chatUser = chats.find((chat) => chat.id === senderId);

		if (chatUser) {
			return {
				name: chatUser.name,
				avatar: chatUser.avatar,
				photoURL: null,
				isCurrentUser: false
			};
		}

		// Fallback based on sender type
		switch (senderType) {
			case 'admin':
				return {
					name: t('Support Team'),
					avatar: 'S',
					photoURL: null,
					isCurrentUser: false
				};
			case 'companion':
				return {
					name: t('Assistant'),
					avatar: 'A',
					photoURL: null,
					isCurrentUser: false
				};
			default:
				return {
					name: t('Unknown'),
					avatar: '?',
					photoURL: null,
					isCurrentUser: false
				};
		}
	};

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewMessage(e.target.value);
	};

	// Filter chats based on search
	const filteredChats = chats.filter(
		(chat) =>
			chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chat.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chat.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chat.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chat.userType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chat.sessionType?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Fetch session history for current user
	const fetchSessionHistory = async (): Promise<SessionHistory[]> => {
		try {
			const response = await fetch(`${API_BASE_URL}/wchat/sessions/${senderId}`);

			if (!response.ok) {
				throw new Error('Failed to fetch session history');
			}

			const sessions: SessionHistory[] = await response.json();
			setSessionHistory(sessions);
			return sessions;
		} catch (error) {
			console.error('Error fetching session history:', error);
			return [];
		}
	};

	// Create new session for current user - only when needed
	const createNewSession = async (targetUserId: number): Promise<number | null> => {
		try {
			//console.log('Creating new session between', senderId, 'and', targetUserId);
			const response = await fetch(`${API_BASE_URL}/wchat/session`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user_id: senderId,
					session_type: 'internal'
					// Add target user if your API supports it
					// target_user_id: targetUserId
				})
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Create session error:', errorData);
				throw new Error(`Failed to create session: ${response.status}`);
			}

			const sessionData: SessionResponse = await response.json();
			//console.log('Session created:', sessionData);

			// Refresh session history after creating new session
			await fetchSessionHistory();

			return sessionData.session_id;
		} catch (error) {
			console.error('Error creating session:', error);
			setError(t('Failed to create chat session'));
			return null;
		}
	};

	// Find existing sessions between current user and target user
	const findExistingSession = async (targetUserId: number): Promise<number | null> => {
		try {
			const response = await fetch(`${API_BASE_URL}/wchat/sessions/between/${senderId}/${targetUserId}`);

			if (!response.ok) {
				return null;
			}

			const sessions: SessionHistory[] = await response.json();

			// Return the most recent session if any exist
			if (sessions.length > 0) {
				return sessions[0].session_id;
			}

			return null;
		} catch (error) {
			console.error('Error finding existing session:', error);
			return null;
		}
	};

	// Fetch chat list from users API and combine with session history
	const fetchChats = async () => {
		try {
			setLoading(true);

			// Fetch users and session history in parallel
			const [usersResponse, sessions] = await Promise.all([
				fetch(`${API_BASE_URL}/users/`),
				fetchSessionHistory()
			]);

			if (!usersResponse.ok) {
				throw new Error('Failed to fetch users');
			}

			const users: User[] = await usersResponse.json();

			// Transform users into chat format, excluding current user
			const userChats: Chat[] = await Promise.all(
				users
					.filter((chatUser: User) => chatUser.user_id !== senderId)
					.map(async (chatUser: User) => {
						// Find existing session between current user and this user
						const existingSessionId = await findExistingSession(chatUser.user_id);
						const existingSession = existingSessionId
							? sessions.find((s) => s.session_id === existingSessionId)
							: null;

						return {
							id: chatUser.user_id,
							name:
								`${chatUser.first_name || ''} ${chatUser.last_name || ''}`.trim() || chatUser.username,
							avatar: chatUser.first_name
								? chatUser.first_name[0].toUpperCase()
								: chatUser.username[0].toUpperCase(),
							preview:
								existingSession?.last_message ||
								`${chatUser.type_name || t('User')} - ${chatUser.department_name || t('Unknown')}`,
							unread: 0,
							lastMessage:
								existingSession?.last_time ||
								chatUser.updated_at ||
								chatUser.created_at ||
								new Date().toISOString(),
							isOnline: chatUser.is_active === 1,
							email: chatUser.email,
							department: chatUser.department_name,
							userType: chatUser.type_name,
							phone: chatUser.phone,
							sessionId: existingSession?.session_id,
							sessionType: existingSession?.session_type
						};
					})
			);

			// Add session history as separate chat items (for sessions without direct user mapping)
			// Skip this entirely if we want to avoid showing "Session" entries in the chat list
			const sessionChats: Chat[] = [];

			// Combine and sort all chats
			const allChats = [...userChats, ...sessionChats].sort((a, b) => {
				const dateA = new Date(a.lastMessage || 0).getTime();
				const dateB = new Date(b.lastMessage || 0).getTime();
				return dateB - dateA;
			});
			setChats(allChats);
			setError(null);
		} catch (error) {
			setError(t('Failed to load chats'));
			console.error('Error fetching chats:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchDirectHistory = async (user1: number, user2: number) => {
		try {
			const response = await fetch(`${API_BASE_URL}/wchat/history/${user1}/${user2}`);

			if (!response.ok) {
				throw new Error('Failed to fetch direct chat history');
			}

			const data: Message[] = await response.json();

			const sorted = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

			setMessages(sorted);
		} catch (error) {
			console.error('Error fetching direct history:', error);
			setError(t('Unable to fetch chat history'));
		}
	};

	// Fetch messages for current session
	const fetchMessages = async () => {
		if (!currentSessionId) return;

		try {
			const response = await fetch(`${API_BASE_URL}/wchat/${currentSessionId}?user_id=${senderId}`);

			if (!response.ok) {
				if (response.status === 404) {
					setMessages([]);
					setError(null);
					return;
				}

				throw new Error('Failed to fetch messages');
			}

			const data: Message[] = await response.json();

			const sortedMessages = data.sort(
				(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
			);

			setMessages(sortedMessages);
			await markAsRead();
			setError(null);
		} catch (error) {
			console.error('Error fetching messages:', error);

			if (currentSessionId) {
				setMessages([]);
			}
		}
	};

	// Enhanced send message using the session ID
	const sendMessage = async () => {
		if (!newMessage.trim() || !currentSessionId || !selectedChat?.id) return;

		const receiverId = selectedChat.id; // <- Get receiver user ID

		const tempMessage: Message = {
			message_id: Date.now(),
			message_text: newMessage,
			sender_type: 'admin',
			sender_id: senderId,
			receiver_user_id: receiverId,
			session_id: currentSessionId,
			is_read: false,
			created_at: new Date().toISOString(),
			status: 'sending'
		};

		// Optimistic update
		setMessages((prev) => [...prev, tempMessage]);
		const messageToSend = newMessage;
		setNewMessage('');

		try {
			const response = await fetch(`${API_BASE_URL}/wchat/send`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					session_id: currentSessionId,
					sender_type: 'admin',
					sender_id: senderId,
					receiver_user_id: receiverId,
					message_text: messageToSend
				})
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Send message error:', errorData);
				throw new Error(`Failed to send message: ${response.status}`);
			}

			const data: Message = await response.json();

			// Replace the temp message with actual data
			setMessages((prev) =>
				prev.map((msg) => (msg.message_id === tempMessage.message_id ? { ...data, status: 'sent' } : msg))
			);

			// Update chat preview
			setChats((prev) =>
				prev.map((chat) =>
					chat.id === receiverId
						? {
								...chat,
								preview: messageToSend,
								lastMessage: new Date().toISOString()
							}
						: chat
				)
			);

			// Refresh chat sessions if needed
			await fetchSessionHistory();
		} catch (error) {
			setError(t('Failed to send message'));
			console.error('Error sending message:', error);

			setMessages((prev) => prev.filter((msg) => msg.message_id !== tempMessage.message_id));
			setNewMessage(messageToSend); // Restore unsent message
		}
	};

	// Mark individual messages as read
	const markAsRead = async () => {
		if (!messages.length) return;

		try {
			// Get unread messages from other users
			const unreadMessages = messages.filter((msg) => !msg.is_read && msg.sender_id !== senderId);

			// Mark each unread message as read
			for (const message of unreadMessages) {
				try {
					const response = await fetch(`${API_BASE_URL}/wchat/${message.message_id}/read`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						}
					});

					if (!response.ok) {
						console.error(`Failed to mark message ${message.message_id} as read`);
					}
				} catch (error) {
					console.error(`Error marking message ${message.message_id} as read:`, error);
				}
			}

			// Update local state
			setMessages((prev) => prev.map((msg) => ({ ...msg, is_read: true })));

			// Update unread count in chat list
			setChats((prev) => prev.map((chat) => (chat.id === selectedUserId ? { ...chat, unread: 0 } : chat)));
		} catch (error) {
			console.error('Error marking messages as read:', error);
		}
	};

	// Handle chat selection and session creation/selection - FIXED
	const handleChatSelect = async (chat: Chat) => {
		try {
			setSelectedUserId(chat.id);
			setSelectedChat(chat);
			setMessages([]); // Clear messages while loading
			setError(null);

			// Only create a new session if one doesn't exist
			if (chat.sessionId) {
				// Use existing session
				//console.log('Using existing session:', chat.sessionId);
				setCurrentSessionId(chat.sessionId);
			} else {
				// Check one more time for existing session before creating new one
				const existingSessionId = await findExistingSession(chat.id);

				if (existingSessionId) {
					//console.log('Found existing session:', existingSessionId);
					setCurrentSessionId(existingSessionId);

					// Update the chat object with the session ID
					setChats((prev) =>
						prev.map((c) => (c.id === chat.id ? { ...c, sessionId: existingSessionId } : c))
					);
				} else {
					// Only create new session if no existing session found
					//console.log('No existing session found, creating new one');
					const newSessionId = await createNewSession(chat.id);

					if (newSessionId) {
						setCurrentSessionId(newSessionId);

						// Update the chat object with the new session ID
						setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, sessionId: newSessionId } : c)));
					}
				}
			}

			// Always fetch history between sender and receiver
			await fetchDirectHistory(senderId, chat.id);
		} catch (error) {
			console.error('Error selecting chat:', error);
			setError(t('Failed to start chat session'));
		}
	};

	// Auto-scroll effect
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Initialize component
	useEffect(() => {
		if (user) {
			fetchChats();
		}
	}, [user]);

	useEffect(() => {
		if (currentSessionId && selectedUserId) {
			fetchDirectHistory(senderId, selectedUserId);

			const interval = setInterval(() => {
				fetchDirectHistory(senderId, selectedUserId);
				fetchSessionHistory();
			}, 3000);

			return () => clearInterval(interval);
		}
	}, [currentSessionId, selectedUserId]);

	// Show loading if user data is not loaded yet
	if (!user && !isGuest) {
		return (
			<div className='flex items-center justify-center h-screen bg-gray-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
					<p className='mt-4 text-gray-600'>{t('Loading user data...')}</p>
				</div>
			</div>
		);
	}

	return (
		<Box
			display='flex'
			height='100vh'
			bgcolor='#f9fafb'
		>
			{/* Sidebar */}
			<Box
				width={{ xs: '100%', md: '33%', lg: '25%' }}
				borderRight='1px solid #e5e7eb'
				bgcolor='#fff'
				display='flex'
				flexDirection='column'
			>
				{/* Header */}
				<Box
					p={2}
					borderBottom='1px solid #e5e7eb'
				>
					<Box
						display='flex'
						alignItems='center'
						mb={2}
					>
						<Avatar src={user?.photoURL}>{!user?.photoURL && currentUserName?.[0]?.toUpperCase()}</Avatar>
						<Typography
							variant='h6'
							color='primary'
							ml={2}
						>
							{currentUserName}
						</Typography>
					</Box>
					<Paper sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
						<Search
							fontSize='small'
							sx={{ color: 'gray', mr: 1 }}
						/>
						<InputBase
							fullWidth
							placeholder={t('Search conversations...')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</Paper>
				</Box>

				{/* Chat List */}
				<Box
					flex={1}
					overflow='auto'
				>
					{loading && chats.length === 0 ? (
						<Box
							display='flex'
							justifyContent='center'
							p={2}
						>
							<CircularProgress size={24} />
						</Box>
					) : (
						filteredChats.map((chat) => (
							<Box
								key={`${chat.id}-${chat.sessionId || 'new'}`}
								display='flex'
								alignItems='center'
								px={2}
								py={1.5}
								sx={{
									cursor: 'pointer',
									bgcolor: chat.id === selectedUserId ? 'blue.50' : 'inherit',
									borderRight: chat.id === selectedUserId ? '4px solid #3b82f6' : 'none',
									'&:hover': { bgcolor: 'grey.100' }
								}}
								onClick={() => handleChatSelect(chat)}
							>
								<Badge
									overlap='circular'
									anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
									badgeContent={
										chat.isOnline && (
											<Box
												width={10}
												height={10}
												bgcolor='green'
												borderRadius='50%'
												border='2px solid white'
											/>
										)
									}
								>
									<Avatar>{chat.avatar}</Avatar>
								</Badge>
								<Box
									ml={2}
									flex={1}
									overflow='hidden'
								>
									<Box
										display='flex'
										justifyContent='space-between'
									>
										<Typography
											variant='body1'
											noWrap
										>
											{chat.name}
											{/* Removed the session ID display from chat list */}
										</Typography>
										<Typography
											variant='caption'
											color='text.secondary'
										>
											{formatTime(chat.lastMessage)}
										</Typography>
									</Box>
									<Typography
										variant='body2'
										color='text.secondary'
										noWrap
									>
										{chat.preview}
									</Typography>
									{chat.email && (
										<Typography
											variant='caption'
											color='text.disabled'
											noWrap
										>
											{chat.email}
										</Typography>
									)}
								</Box>
								{chat.unread > 0 && (
									<Badge
										badgeContent={chat.unread}
										color='primary'
									/>
								)}
							</Box>
						))
					)}
				</Box>
			</Box>

			{/* Main Chat Area */}
			<Box
				flex={1}
				display='flex'
				flexDirection='column'
			>
				{/* Header */}
				<Box
					p={2}
					borderBottom='1px solid #e5e7eb'
					display='flex'
					justifyContent='space-between'
					alignItems='center'
				>
					<Box
						display='flex'
						alignItems='center'
					>
						<Avatar>{selectedChat?.avatar || 'U'}</Avatar>
						<Box ml={2}>
							<Typography variant='subtitle1'>
								{selectedChat?.name || t('Select a chat')}
								{selectedChat?.sessionId && (
									<Typography
										variant='caption'
										color='text.secondary'
										ml={1}
									>
										Session #{selectedChat.sessionId}
									</Typography>
								)}
							</Typography>
							<Typography
								variant='caption'
								color='text.secondary'
							>
								{isTyping
									? t('Typing...')
									: selectedChat
										? `${selectedChat.userType || selectedChat.sessionType} - ${
												selectedChat.department || t('Chat')
											}`
										: t('Choose a user to start chatting')}
							</Typography>
						</Box>
					</Box>
					<Box>
						<Tooltip title={t('Info')}>
							<IconButton>
								<Info />
							</IconButton>
						</Tooltip>
						<Tooltip title={t('More options')}>
							<IconButton onClick={() => setMenuOpen((prev) => !prev)}>
								<MoreVert />
							</IconButton>
						</Tooltip>
						<Menu
							open={menuOpen}
							onClose={() => setMenuOpen(false)}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						>
							<MenuItem onClick={() => setMenuOpen(false)}>{t('Clear chat')}</MenuItem>
						</Menu>
					</Box>
				</Box>

				{/* Error or Session Info */}
				{error && (
					<Box
						mx={2}
						my={1}
					>
						<Paper
							elevation={0}
							sx={{ bgcolor: '#fee2e2', p: 1 }}
						>
							<Typography color='error'>{error}</Typography>
						</Paper>
					</Box>
				)}
				{currentSessionId && (
					<Box
						mx={2}
						my={1}
					>
						<Paper
							elevation={0}
							sx={{ bgcolor: '#e0f2fe', p: 1 }}
						>
							<Typography variant='caption'>
								{t('Session ID')}: {currentSessionId}
							</Typography>
						</Paper>
					</Box>
				)}

				{/* Chat messages */}
				<Box
					flex={1}
					overflow='auto'
					p={2}
					sx={{
						backgroundImage: 'url("/assets/chat_bg.png")',
						backgroundSize: 'cover',
						backgroundPosition: 'center'
					}}
				>
					{!selectedChat ? (
						<Box
							display='flex'
							flexDirection='column'
							alignItems='center'
							justifyContent='center'
							height='100%'
							color='text.secondary'
						>
							<Typography variant='h6'>{t('No chat selected')}</Typography>
							<Typography variant='body2'>
								{t('Select a user from the list to start a conversation')}
							</Typography>
						</Box>
					) : loading && messages.length === 0 ? (
						<Box
							display='flex'
							justifyContent='center'
							p={2}
						>
							<CircularProgress size={24} />
						</Box>
					) : messages.length === 0 ? (
						<Box
							display='flex'
							flexDirection='column'
							alignItems='center'
							justifyContent='center'
							height='100%'
							color='text.secondary'
						>
							<Typography variant='h6'>{t('No messages yet')}</Typography>
							<Typography variant='body2'>
								{t('Start a conversation with {{name}}', { name: selectedChat.name })}
							</Typography>
						</Box>
					) : (
						messages.map((msg, index) => {
							const isCurrentUser = msg.sender_id === senderId;
							const senderInfo = getSenderInfo(msg.sender_type, msg.sender_id);
							const showTime =
								index === 0 ||
								new Date(msg.created_at).getTime() -
									new Date(messages[index - 1].created_at).getTime() >
									300000;
							return (
								<Box
									key={msg.message_id}
									mb={1}
								>
									{showTime && (
										<Box
											display='flex'
											justifyContent='center'
											mb={1}
										>
											<Typography
												variant='caption'
												sx={{
													px: 2,
													py: 0.5,
													bgcolor: '#ffffff',
													border: '1px solid #e0e0e0',
													borderRadius: 20
												}}
											>
												{formatMessageTime(msg.created_at)}
											</Typography>
										</Box>
									)}
									<Box
										display='flex'
										justifyContent={isCurrentUser ? 'flex-end' : 'flex-start'}
									>
										{!isCurrentUser && <Avatar sx={{ mr: 1 }}>{senderInfo.avatar}</Avatar>}
										<Paper
											elevation={1}
											sx={{
												px: 2,
												py: 1,
												bgcolor: isCurrentUser ? 'primary.main' : 'white',
												color: isCurrentUser ? 'white' : 'text.primary',
												borderRadius: 4,
												maxWidth: '70%'
											}}
										>
											<Typography variant='body2'>{msg.message_text}</Typography>
										</Paper>
										{isCurrentUser && <Avatar sx={{ ml: 1 }}>{senderInfo.avatar}</Avatar>}
									</Box>
								</Box>
							);
						})
					)}
					<div ref={messagesEndRef} />
				</Box>

				{/* Message input */}
				<Box
					p={2}
					borderTop='1px solid #e5e7eb'
					display='flex'
					alignItems='center'
				>
					<IconButton>
						<AttachFile />
					</IconButton>
					<InputBase
						fullWidth
						placeholder={selectedChat ? t('Type your message...') : t('Select a chat to start messaging')}
						value={newMessage}
						onChange={handleInputChange}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
						inputRef={messageInputRef}
						disabled={!selectedChat}
						sx={{
							bgcolor: '#f3f4f6',
							borderRadius: 50,
							px: 2,
							py: 1,
							mx: 1,
							flex: 1
						}}
					/>
					<IconButton>
						<InsertEmoticon />
					</IconButton>
					<IconButton
						color='primary'
						disabled={!newMessage.trim() || !selectedChat}
						onClick={sendMessage}
					>
						<Send />
					</IconButton>
				</Box>
			</Box>
		</Box>
	);
};

export default ChatUI;
