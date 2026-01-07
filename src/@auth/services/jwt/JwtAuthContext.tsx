import React from 'react';
import { User } from '@auth/user';

export type JwtLoginPayload = {
	email: string;
	password: string;
};

export type JwtSignUpPayload = {
	displayName: string;
	email: string;
	password: string;
};

export type JwtAuthContextType = {
	user: User | null;
	isAuthenticated: boolean;
	authStatus: 'configuring' | 'authenticated' | 'unauthenticated';
	signOut: () => void;
	signIn: (credentials: JwtLoginPayload) => Promise<Response>;
	signUp: (data: JwtSignUpPayload) => Promise<Response>;
	updateUser: (userData: Partial<User>) => Promise<Response>;
	refreshToken: () => Promise<Response>;
};

const defaultContext: JwtAuthContextType = {
	user: null,
	isAuthenticated: false,
	authStatus: 'configuring',
	signOut: () => {},
	signIn: () => Promise.resolve(new Response()),
	signUp: () => Promise.resolve(new Response()),
	updateUser: () => Promise.resolve(new Response()),
	refreshToken: () => Promise.resolve(new Response())
};

// Create the context
const JwtAuthContext = React.createContext<JwtAuthContextType>(defaultContext);

// Export the context for consumption
export default JwtAuthContext;
