import { User } from '@auth/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Sign in with username and password
 */
export const authSignIn = async (credentials: { email: string; password: string }): Promise<Response> => {
	// Map email to username for your backend
	const payload = {
		username: credentials.email,
		password: credentials.password
	};

	return fetch(`${API_BASE_URL}/admin-login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
};

/**
 * Sign in with JWT token
 */
export const authSignInWithToken = async (token: string): Promise<Response> => {
	return fetch(`${API_BASE_URL}/sign-in-with-token`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

/**
 * Sign up with user data
 */
export const authSignUp = async (data: { displayName: string; email: string; password: string }): Promise<Response> => {
	// Map to your backend structure
	const payload = {
		username: data.email, // Use email as username
		password: data.password,
		displayName: data.displayName
	};

	return fetch(`${API_BASE_URL}/sign-up`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
};

/**
 * Create a new user in the database (used by AWS Auth Provider)
 */
export const authCreateDbUser = async (userData: Partial<User>): Promise<User> => {
	// This function is similar to sign up but for the AWS provider
	// It creates a user without authentication (typically after AWS Cognito auth)
	const response = await fetch(`${API_BASE_URL}/user-creation`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('jwt_access_token')}`
		},
		body: JSON.stringify({ user: userData })
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

/**
 * Update user in the database
 */
export const authUpdateDbUser = async (user: Partial<User>): Promise<User> => {
	const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('jwt_access_token')}`
		},
		body: JSON.stringify({ user })
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

/**
 * Refresh the JWT token
 */
export const authRefreshToken = async (): Promise<Response> => {
	return fetch(`${API_BASE_URL}/refresh`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('jwt_access_token')}`
		}
	});
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
	const response = await fetch(`${API_BASE_URL}/user/${id}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('jwt_access_token')}`
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};
