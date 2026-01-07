import jwtDecode from 'jwt-decode';

interface DecodedToken {
	exp: number;
	iat: number;
	iss?: string;
	user_id: number; // Your backend uses user_id
	username: string;
	user_type_id: number;
	department_id: number;
	[key: string]: unknown;
}

/**
 * Check if the token is valid
 * @param token JWT token to validate
 * @returns boolean indicating if token is valid
 */
export const isTokenValid = (token?: string): boolean => {
	if (!token || token === 'undefined' || token === '') {
		return false;
	}

	try {
		// Check if token has valid JWT format (contains two dots)
		if (!token.includes('.') || token.split('.').length !== 3) {
			return false;
		}

		const decoded = jwtDecode<DecodedToken>(token);
		const currentTime = Date.now() / 1000;

		if (!decoded.exp || decoded.exp < currentTime) {
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error decoding token:', error);
		return false;
	}
};

/**
 * Get user ID from token
 * @param token JWT token
 * @returns User ID from token payload
 */
export const getUserIdFromToken = (token?: string): string | null => {
	if (!token) {
		return null;
	}

	try {
		const decoded = jwtDecode<DecodedToken>(token);
		return decoded.user_id.toString();
	} catch (error) {
		console.error('Error getting user ID from token:', error);
		return null;
	}
};

/**
 * Get username from token
 * @param token JWT token
 * @returns Username from token payload
 */
export const getUsernameFromToken = (token?: string): string | null => {
	if (!token) {
		return null;
	}

	try {
		const decoded = jwtDecode<DecodedToken>(token);
		return decoded.username;
	} catch (error) {
		console.error('Error getting username from token:', error);
		return null;
	}
};

/**
 * Get token expiration date
 * @param token JWT token
 * @returns Expiration date of the token
 */
export const getTokenExpirationDate = (token?: string): Date | null => {
	if (!token) {
		return null;
	}

	try {
		const decoded = jwtDecode<DecodedToken>(token);

		if (!decoded.exp) {
			return null;
		}

		return new Date(decoded.exp * 1000);
	} catch (error) {
		console.error('Error getting token expiration date:', error);
		return null;
	}
};

/**
 * Check if user has admin role
 * @param token JWT token
 * @returns Boolean indicating if user is an admin
 */
export const isUserAdmin = (token?: string): boolean => {
	if (!token) {
		return false;
	}

	try {
		const decoded = jwtDecode<DecodedToken>(token);
		return decoded.user_type_id === 1; // Assuming 1 is the admin user type ID
	} catch (error) {
		console.error('Error checking admin status:', error);
		return false;
	}
};
