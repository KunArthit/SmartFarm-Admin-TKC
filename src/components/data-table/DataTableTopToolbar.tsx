import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import {
	MRT_GlobalFilterTextField,
	MRT_LinearProgressBar,
	MRT_RowData,
	MRT_TableInstance,
	MRT_TablePagination,
	MRT_ToolbarAlertBanner,
	MRT_ToolbarDropZone,
	MRT_ToolbarInternalButtons
} from 'material-react-table';
import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import parseFromValuesOrFunc from 'src/components/data-table/utils/parseFromValuesOrFunc';

export interface MRT_TopToolbarProps<TData extends MRT_RowData> {
	table: MRT_TableInstance<TData>;
}

function DataTableTopToolbar<TData extends MRT_RowData>({ table }: MRT_TopToolbarProps<TData>) {
	const {
		getState,
		options: {
			enableGlobalFilter,
			enablePagination,
			enableToolbarInternalActions,
			muiTopToolbarProps,
			positionPagination,
			positionToolbarDropZone,
			renderTopToolbarCustomActions
		},
		refs: { topToolbarRef }
	} = table;

	const { isFullScreen, showGlobalFilter } = getState();

	const isMobile = useMediaQuery('(max-width:720px)');
	const isTablet = useMediaQuery('(max-width:1024px)');

	const toolbarProps = parseFromValuesOrFunc(muiTopToolbarProps, { table });

	const stackAlertBanner = isMobile || !!renderTopToolbarCustomActions || (showGlobalFilter && isTablet);

	// state สำหรับควบคุมโชว์/ซ่อนช่อง Search
	const [openSearch, setOpenSearch] = useState(false);

	const handleToggleSearch = () => {
		setOpenSearch((prev) => {
			const next = !prev;

			if (!next) {
				// ปิดแล้วเคลียร์ค่า search
				table.setGlobalFilter('');
			}

			return next;
		});
	};

	const globalFilterBaseSx = {
		'& .MuiOutlinedInput-root': {
			height: 32,
			minHeight: 32,
			paddingLeft: 1,
			paddingRight: 1
		},
		minWidth: isMobile ? 180 : 260,
		zIndex: !isTablet ? 2 : undefined
	};

	return (
		<div className='flex flex-col w-full py-4 px-12 border-b-1'>
			<Box
				className='flex flex-col w-full items-center'
				{...toolbarProps}
				ref={(ref: HTMLDivElement) => {
					topToolbarRef.current = ref;

					if (toolbarProps?.ref) {
						// eslint-disable-next-line
            // @ts-ignore -- Legacy type compatibility
						toolbarProps.ref.current = ref;
					}
				}}
				sx={[
					(theme) => ({
						backgroundColor: table.options.mrtTheme.baseBackgroundColor,
						transition: 'all 150ms ease-in-out',
						zIndex: 1,
						...(parseFromValuesOrFunc(toolbarProps?.sx, theme) as unknown as object)
					}),
					isFullScreen
						? {
								position: 'sticky'
							}
						: {
								position: 'relative'
							},
					isFullScreen
						? {
								top: '0'
							}
						: {
								top: null
							}
				]}
			>
				{['both', 'top'].includes(positionToolbarDropZone ?? '') && <MRT_ToolbarDropZone table={table} />}

				{/* แถวบนของ toolbar */}
				<div className='flex w-full items-center'>
					{/* ====== ซ้าย: ทุกไอคอน + search ====== */}
					<Box className='flex items-center gap-8 mr-8'>
						{enableGlobalFilter && (
							<>
								{/* ปุ่มไอคอนแว่นขยาย */}
								<IconButton
									size='small'
									onClick={handleToggleSearch}
								>
									<FuseSvgIcon size={20}>heroicons-outline:magnifying-glass</FuseSvgIcon>
								</IconButton>

								{/* ช่องค้นหาที่ขยายออกมา */}
								<Collapse
									in={openSearch}
									orientation='horizontal'
								>
									<MRT_GlobalFilterTextField
										table={table}
										sx={globalFilterBaseSx}
									/>
								</Collapse>
							</>
						)}

						{/* ปุ่ม internal ของ MRT (density, column, fullscreen ฯลฯ) */}
						{enableToolbarInternalActions && (
							<Box className='flex items-center space-x-8'>
								<MRT_ToolbarInternalButtons table={table} />
							</Box>
						)}
					</Box>

					{/* ====== กลาง: custom actions (ถ้ามี) ก็จะต่อจากไอคอนฝั่งซ้ายไปเลย ====== */}
					<div className='flex flex-1'>{renderTopToolbarCustomActions?.({ table }) ?? null}</div>

					{/* ขวา: เว้นโล่ง ไม่มีไอคอนแล้ว */}
				</div>

				{/* Pagination ด้านบน ถ้าเปิดใช้ */}
				{enablePagination && ['both', 'top'].includes(positionPagination ?? '') && (
					<MRT_TablePagination
						position='top'
						table={table}
					/>
				)}

				<MRT_LinearProgressBar
					isTopToolbar
					table={table}
				/>
			</Box>

			<MRT_ToolbarAlertBanner
				className='mt-4 rounded-md flex justify-center'
				stackAlertBanner={stackAlertBanner}
				table={table}
				sx={{
					'& .MuiStack-root': {
						display: 'flex',
						justifyContent: 'center',
						width: '100%',
						fontSize: 13
					}
				}}
			/>
		</div>
	);
}

export default DataTableTopToolbar;
