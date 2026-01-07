import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

const Chat = lazy(() => import('./Chat'));
const ChatBox = lazy(() => import('./chatbox/ChatBox'));

i18next.addResourceBundle('en', 'Chat', en);
i18next.addResourceBundle('th', 'Chat', th);

/**
 * The E-Commerce app Routes.
 */
const ChatRoute: FuseRouteItemType = {
	path: 'apps/company-chat',
	element: <Chat />,
	children: [
		{
			path: 'messages',
			children: [
				{
					path: '',
					element: <ChatBox />
				}
			]
		}
	]
};

export default ChatRoute;
