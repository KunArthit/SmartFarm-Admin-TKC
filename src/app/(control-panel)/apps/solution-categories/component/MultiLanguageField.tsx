import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, TextField, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import Editor from '../../blog/component/Editor';
import { useTranslation } from 'react-i18next';

const StyledQuillEditor = styled(Box)(({ theme }) => {
	const isDark = theme.palette.mode === 'dark';
	return {
		'& .ql-toolbar': {
			borderTop: 'none',
			borderLeft: 'none',
			borderRight: 'none',
			borderBottom: `1px solid ${theme.palette.divider}`,
			borderRadius: '8px 8px 0 0',
			backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.9 : 1),
			backdropFilter: 'saturate(120%) blur(6px)',
			padding: theme.spacing(1),
			'& .ql-picker-label': { color: theme.palette.text.secondary },
			'& .ql-stroke': { stroke: theme.palette.text.secondary },
			'& .ql-fill': { fill: theme.palette.text.secondary }
		},
		'& .ql-container': {
			border: 'none',
			borderRadius: '0 0 8px 8px',
			backgroundColor: theme.palette.background.paper,
			color: theme.palette.text.primary,
			fontSize: '1rem'
		},
		'& .ql-editor': {
			padding: theme.spacing(2),
			'&.ql-blank::before': {
				color: theme.palette.text.disabled,
				fontStyle: 'normal'
			}
		}
	};
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
	minHeight: 42,
	'& .MuiTabs-indicator': {
		backgroundColor: theme.palette.primary.main
	}
}));

const StyledTab = styled(Tab)(({ theme }) => ({
	minHeight: 42,
	fontSize: '0.875rem',
	fontWeight: 500,
	textTransform: 'none',
	color: theme.palette.text.secondary,
	'&.Mui-selected': {
		color: theme.palette.primary.main,
		fontWeight: 600
	}
}));

const MultiLanguageField = ({
	label,
	valueEn,
	valueTh,
	onChangeEn,
	onChangeTh,
	type = 'text',
	required = false,
	multiline = false,
	rows = 4,
	useQuill = false,
	refEn = null, // ตามคอมเมนต์เดิม: refEn ใช้กับช่อง TH
	refTh = null // และ refTh ใช้กับช่อง EN
}) => {
	const [currentTab, setCurrentTab] = useState(0);
	const { t } = useTranslation('SolutionPage');

	const handleTabChange = (_event: any, newValue: number) => {
		setCurrentTab(newValue);
	};

	// [1] TH tab
	useEffect(() => {
		if (useQuill && currentTab === 0 && refEn?.current) {
			if (valueEn && !refEn.current.root.innerHTML.includes(valueEn)) {
				refEn.current.clipboard.dangerouslyPasteHTML(0, valueEn);
			}
		}
	}, [currentTab, useQuill, refEn, valueEn]);

	// [2] EN tab
	useEffect(() => {
		if (useQuill && currentTab === 1 && refTh?.current) {
			if (valueTh && !refTh.current.root.innerHTML.includes(valueTh)) {
				refTh.current.clipboard.dangerouslyPasteHTML(0, valueTh);
			}
		}
	}, [currentTab, useQuill, refTh, valueTh]);

	return (
		<Box sx={{ mb: 3 }}>
			<Typography
				variant='subtitle1'
				sx={{ mb: 1, fontWeight: 600 }}
			>
				{label} {required && '*'}
			</Typography>

			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<StyledTabs
					value={currentTab}
					onChange={handleTabChange}
				>
					<StyledTab label={t('🇹🇭 Thai')} />
					<StyledTab label={t('🇬🇧 English')} />
				</StyledTabs>
			</Box>

			<Box sx={{ mt: 2 }}>
				{currentTab === 0 && (
					<Box>
						{useQuill ? (
							<StyledQuillEditor
								sx={{
									border: (theme) => `1px solid ${theme.palette.divider}`,
									borderRadius: '8px',
									'& .ql-container': {
										minHeight: type === 'title' ? '60px' : '200px'
									}
								}}
							>
								<Editor
									ref={refEn}
									onTextChange={() => {
										if (refEn?.current) onChangeEn(refEn.current.root.innerHTML);
									}}
								/>
							</StyledQuillEditor>
						) : (
							<TextField
								fullWidth
								value={valueEn}
								onChange={(e) => onChangeEn(e.target.value)}
								placeholder={`${t('Enter')} ${label.toLowerCase()} ${t('in Thai')}`}
								multiline={multiline}
								rows={multiline ? rows : undefined}
								sx={{
									backgroundColor: (theme) => alpha(theme.palette.background.paper, 1),
									'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
										borderColor: (theme) => theme.palette.primary.main
									},
									'& .MuiInputLabel-root.Mui-focused': {
										color: (theme) => theme.palette.primary.main
									}
								}}
							/>
						)}
					</Box>
				)}

				{currentTab === 1 && (
					<Box>
						{useQuill ? (
							<StyledQuillEditor
								sx={{
									border: (theme) => `1px solid ${theme.palette.divider}`,
									borderRadius: '8px',
									'& .ql-container': {
										minHeight: type === 'title' ? '60px' : '200px'
									}
								}}
							>
								<Editor
									ref={refTh}
									onTextChange={() => {
										if (refTh?.current) onChangeTh(refTh.current.root.innerHTML);
									}}
								/>
							</StyledQuillEditor>
						) : (
							<TextField
								fullWidth
								value={valueTh}
								onChange={(e) => onChangeTh(e.target.value)}
								placeholder={`${t('Enter')} ${label.toLowerCase()} ${t('in English')}`}
								multiline={multiline}
								rows={multiline ? rows : undefined}
								sx={{
									backgroundColor: (theme) => alpha(theme.palette.background.paper, 1),
									'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
										borderColor: (theme) => theme.palette.primary.main
									},
									'& .MuiInputLabel-root.Mui-focused': {
										color: (theme) => theme.palette.primary.main
									}
								}}
							/>
						)}
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default MultiLanguageField;
