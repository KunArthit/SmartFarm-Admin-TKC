import { useState, useEffect, useCallback, useMemo, useImperativeHandle, useRef } from 'react';
import { FuseAuthProviderComponentProps, FuseAuthProviderState } from '@fuse/core/FuseAuthProvider/types/FuseAuthTypes';
import useLocalStorage from '@fuse/hooks/useLocalStorage';
import { authRefreshToken, authSignIn, authSignInWithToken, authSignUp, authUpdateDbUser } from '@auth/authApi';
import { User } from '@auth/user';
import { removeGlobalHeaders, setGlobalHeaders } from '@/utils/apiFetch';
import { isTokenValid } from '@auth/services/jwt/utils/jwtUtils';
import JwtAuthContext from '@auth/services/jwt/JwtAuthContext';
import { JwtAuthContextType } from '@auth/services/jwt/JwtAuthContext';

export type JwtSignInPayload = {
	email: string;
	password: string;
};

export type JwtSignUpPayload = {
	displayName: string;
	email: string;
	password: string;
};

// Map backend user to Fuse User model
const mapUserToFuseModel = (backendUser: any): User => {
	return {
		id: backendUser.user_id.toString(),
		role: backendUser.user_type_id === 1 ? ['admin'] : ['user'],
		displayName: backendUser.display_name || backendUser.username,
		photoURL: backendUser.photo_url || '/assets/images/avatars/profile.jpg',
		email: backendUser.email || backendUser.username,
		shortcuts: backendUser.shortcuts || [],
		settings: backendUser.settings || {}
	};
};

function JwtAuthProvider(props: FuseAuthProviderComponentProps) {
	const { ref, children, onAuthStateChanged } = props;

	// Use this ref to prevent infinite loops with interceptFetch
	const fetchIntercepted = useRef(false);

	const {
		value: tokenStorageValue,
		setValue: setTokenStorageValue,
		removeValue: removeTokenStorageValue
	} = useLocalStorage<string>('jwt_access_token');

	/**
	 * Fuse Auth Provider State
	 */
	const [authState, setAuthState] = useState<FuseAuthProviderState<User>>({
		authStatus: 'configuring',
		isAuthenticated: false,
		user: null
	});

	/**
	 * Watch for changes in the auth state
	 * and pass them to the FuseAuthProvider
	 */
	useEffect(() => {
		if (onAuthStateChanged) {
			onAuthStateChanged(authState);
		}
	}, [authState, onAuthStateChanged]);

	/**
	 * Attempt to auto login with the stored token - only run once on mount
	 */
	useEffect(() => {
		const attemptAutoLogin = async () => {
			const accessToken = tokenStorageValue;

			if (isTokenValid(accessToken)) {
				try {
					/**
					 * Sign in with the token
					 */
					const response = await authSignInWithToken(accessToken);

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					const backendUser = await response.json();
					const userData = mapUserToFuseModel(backendUser);

					// Get new token from headers if available
					const newToken = response.headers.get('New-Access-Token');

					if (newToken) {
						setTokenStorageValue(newToken);
						setGlobalHeaders({ Authorization: `Bearer ${newToken}` });
					}

					setAuthState({
						authStatus: 'authenticated',
						isAuthenticated: true,
						user: userData
					});
				} catch (error) {
					console.error('❌ Auto login failed:', error);
					removeTokenStorageValue();
					removeGlobalHeaders(['Authorization']);
					setAuthState({
						authStatus: 'unauthenticated',
						isAuthenticated: false,
						user: null
					});
				}
			} else {
				removeTokenStorageValue();
				removeGlobalHeaders(['Authorization']);
				setAuthState({
					authStatus: 'unauthenticated',
					isAuthenticated: false,
					user: null
				});
			}
		};

		attemptAutoLogin();
		// Only run this effect once on component mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Sign in
	 */
	const signIn: JwtAuthContextType['signIn'] = useCallback(
		async (credentials) => {
			try {
				const response = await authSignIn(credentials);

				if (!response.ok) {
					// Return the response to handle error messages in the UI
					return response;
				}

				const data = await response.json();

				// Check for error in response
				if (data.error) {
					return new Response(JSON.stringify({ message: data.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					});
				}

				// Map the backend user to Fuse user model
				const fuseUser = mapUserToFuseModel(data.user);

				// Set auth state and store token
				setAuthState({
					authStatus: 'authenticated',
					isAuthenticated: true,
					user: fuseUser
				});

				setTokenStorageValue(data.access_token);
				setGlobalHeaders({ Authorization: `Bearer ${data.access_token}` });

				return response;
			} catch (error) {
				console.error('Sign in error:', error);
				// Return a Response object with error status
				return new Response(JSON.stringify({ message: 'An unexpected error occurred' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		},
		[setTokenStorageValue]
	);

	/**
	 * Sign up
	 */
	const signUp: JwtAuthContextType['signUp'] = useCallback(
		async (data) => {
			try {
				const response = await authSignUp(data);

				if (!response.ok) {
					// Return the response to handle error messages in the UI
					return response;
				}

				const responseData = await response.json();

				// Check for error in response
				if (responseData.error) {
					return new Response(JSON.stringify({ message: responseData.error }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' }
					});
				}

				// Map the backend user to Fuse user model
				const fuseUser = mapUserToFuseModel(responseData.user);

				// Set auth state and store token
				setAuthState({
					authStatus: 'authenticated',
					isAuthenticated: true,
					user: fuseUser
				});

				setTokenStorageValue(responseData.access_token);
				setGlobalHeaders({ Authorization: `Bearer ${responseData.access_token}` });

				return response;
			} catch (error) {
				console.error('Sign up error:', error);
				// Return a Response object with error status
				return new Response(JSON.stringify({ message: 'An unexpected error occurred' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		},
		[setTokenStorageValue]
	);

	/**
	 * Sign out
	 */
	const signOut: JwtAuthContextType['signOut'] = useCallback(() => {
		removeTokenStorageValue();
		removeGlobalHeaders(['Authorization']);
		setAuthState({
			authStatus: 'unauthenticated',
			isAuthenticated: false,
			user: null
		});
	}, [removeTokenStorageValue]);

	/**
	 * Update user - with corrected return type
	 */
	const updateUser: JwtAuthContextType['updateUser'] = useCallback(
		async (_user) => {
			try {
				// Call the API
				const updatedUser = await authUpdateDbUser(_user);

				// Update the user in the auth state
				if (authState.user) {
					setAuthState({
						...authState,
						user: {
							...authState.user,
							..._user
						}
					});
				}

				// Convert the User to a Response object to match the expected return type
				return new Response(JSON.stringify(updatedUser), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				console.error('Error updating user:', error);
				return new Response(JSON.stringify({ message: 'Failed to update user' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		},
		[authState]
	);

	/**
	 * Refresh access token
	 */
	const refreshToken: JwtAuthContextType['refreshToken'] = useCallback(async () => {
		try {
			const response = await authRefreshToken();

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const newAccessToken = response.headers.get('New-Access-Token');

			if (newAccessToken) {
				setTokenStorageValue(newAccessToken);
				setGlobalHeaders({ Authorization: `Bearer ${newAccessToken}` });
			}

			return response;
		} catch (error) {
			console.error('Error refreshing token:', error);
			signOut();
			return Promise.reject(error);
		}
	}, [setTokenStorageValue, signOut]);

	/**
	 * Auth Context Value
	 */
	const authContextValue = useMemo(
		() =>
			({
				...authState,
				signIn,
				signUp,
				signOut,
				updateUser,
				refreshToken
			}) as JwtAuthContextType,
		[authState, signIn, signUp, signOut, updateUser, refreshToken]
	);

	/**
	 * Expose methods to the FuseAuthProvider
	 */
	useImperativeHandle(ref, () => ({
		signOut,
		updateUser
	}));

	/**
	 * Intercept fetch requests to refresh the access token and handle unauthorized responses
	 * This is where infinite loops can happen, so we need to be careful
	 */
	useEffect(() => {
		// Only set up the interceptor once and only when authenticated
		if (authState.isAuthenticated && !fetchIntercepted.current) {
			const originalFetch = window.fetch;

			window.fetch = async (...args) => {
				const [resource, config] = args;

				try {
					const response = await originalFetch(resource, config);

					// Check for a new access token in the response headers
					const newAccessToken = response.headers.get('New-Access-Token');

					if (newAccessToken) {
						setGlobalHeaders({ Authorization: `Bearer ${newAccessToken}` });
						setTokenStorageValue(newAccessToken);
					}

					// Handle unauthorized responses (token expired)
					if (response.status === 401) {
						// Only try to refresh the token once to prevent infinite loops
						const refreshHeader = config?.headers as Record<string, string> | undefined;
						const isRefreshRequest = refreshHeader?.['X-Refresh-Request'] === 'true';

						if (!isRefreshRequest && tokenStorageValue) {
							try {
								// Attempt to refresh the token
								const refreshResponse = await authRefreshToken();

								if (refreshResponse.ok) {
									// Retry the original request with the new token
									const newConfig = {
										...config,
										headers: {
											...((config?.headers as Record<string, string>) || {}),
											'X-Refresh-Request': 'true',
											Authorization: `Bearer ${localStorage.getItem('jwt_access_token')}`
										}
									};
									return originalFetch(resource, newConfig);
								}
							} catch (error) {
								console.error('Token refresh failed:', error);
							}
						}

						// If we couldn't refresh the token or the refresh request also failed, sign out
						signOut();
						console.error('Unauthorized request. User was signed out.');
					}

					return response;
				} catch (error) {
					console.error('Fetch interceptor error:', error);
					return Promise.reject(error);
				}
			};

			// Mark as intercepted to prevent multiple interceptions
			fetchIntercepted.current = true;

			// Restore original fetch on cleanup
			return () => {
				window.fetch = originalFetch;
				fetchIntercepted.current = false;
			};
		}
	}, [authState.isAuthenticated, setTokenStorageValue, signOut, tokenStorageValue]);

	return <JwtAuthContext value={authContextValue}>{children}</JwtAuthContext>;
}

export default JwtAuthProvider;
