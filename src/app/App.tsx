import FuseLayout from '@fuse/core/FuseLayout';
import { SnackbarProvider } from '@/components/utils/SnackbarContext';
import themeLayouts from 'src/components/theme-layouts/themeLayouts';
import { Provider } from 'react-redux';
import FuseSettingsProvider from '@fuse/core/FuseSettings/FuseSettingsProvider';
import { I18nProvider } from '@i18n/I18nProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale/en-US';
import { th } from 'date-fns/locale/th';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ErrorBoundary from '@fuse/utils/ErrorBoundary';
import Authentication from '@auth/Authentication';
import MainThemeProvider from '../contexts/MainThemeProvider';
import store from '@/store/store';
import routes from '@/configs/routesConfig';
import AppContext from '@/contexts/AppContext';
import useI18n from '@i18n/useI18n';
import { Locale } from 'date-fns';

const dateLocaleMap: Record<string, Locale> = {
	en: enUS,
	th: th
};


function LocalizedApp() {
	const { language } = useI18n();

	// เลือก locale สำหรับ date picker ตามภาษาที่เลือก
	const dateLocale = dateLocaleMap[language.id] || enUS;

	return (
		<LocalizationProvider
			dateAdapter={AdapterDateFns}
			adapterLocale={dateLocale}
		>
			<MainThemeProvider>
				<SnackbarProvider>
					<FuseLayout layouts={themeLayouts} />
				</SnackbarProvider>
			</MainThemeProvider>
		</LocalizationProvider>
	);
}

/**
 * Main App Component
 */
function App() {
	const AppContextValue = {
		routes
	};

	return (
		<ErrorBoundary>
			<AppContext value={AppContextValue}>
				{/* Redux Store Provider */}
				<Provider store={store}>
					<Authentication>
						<FuseSettingsProvider>
							<I18nProvider>
								<LocalizedApp />
							</I18nProvider>
						</FuseSettingsProvider>
					</Authentication>
				</Provider>
			</AppContext>
		</ErrorBoundary>
	);
}

export default App;
