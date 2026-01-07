import { useContext } from 'react';
import JwtAuthContext from './JwtAuthContext';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';

function UseJwtAuth() {
	// Always call both hooks to comply with Rules of Hooks
	const context = useContext(JwtAuthContext);
	const fuseAuth = useAuth();

	// If the direct context isn't available, use the Fuse auth system
	// This will work when the JwtAuthProvider is registered via FuseAuthProvider
	if (context === undefined) {
		return fuseAuth;
	}

	return context;
}

export default UseJwtAuth;
