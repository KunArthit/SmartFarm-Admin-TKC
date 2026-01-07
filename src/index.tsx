import '@i18n/i18n';
import './styles/app-base.css';
import './styles/app-components.css';
import './styles/app-utilities.css';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import routes from 'src/configs/routesConfig';

async function mockSetup() {
	if (process.env.NODE_ENV === 'development') {
		const { worker } = await import('@mock-utils/mswMockAdapter');

		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			try {
				const isSecureContext =
					window.location.protocol === 'https:' || window.location.hostname === 'localhost';

				if (!isSecureContext) {
					console.warn('MSW requires HTTPS or localhost');
					return;
				}

				await worker.start({
					onUnhandledRequest: 'bypass',
					serviceWorker: {
						url: '/admin/mockServiceWorker.js'
					}
				});

				console.log('MSW started successfully');
			} catch (error) {
				console.error('Failed to start MSW worker:', error);
			}
		}
	}
}

const container = document.getElementById('app');

if (!container) {
	throw new Error('Failed to find the root element');
}

mockSetup().then(() => {
	const root = createRoot(container, {
		onUncaughtError: (error, errorInfo) => {
			console.error('UncaughtError error', error, errorInfo.componentStack);
		},
		onCaughtError: (error, errorInfo) => {
			console.error('Caught error', error, errorInfo.componentStack);
		}
	});

	const router = createBrowserRouter(routes, {
		basename: '/admin',
		future: {
			v7_normalizeFormMethod: true
		}
	});

	root.render(<RouterProvider router={router} />);
});
