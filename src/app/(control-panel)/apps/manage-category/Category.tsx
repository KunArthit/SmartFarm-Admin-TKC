import CategoryTable from './components/CategoryTable';
import GlobalStyles from '@mui/material/GlobalStyles';
import CategoryHeader from './CategoryHeader';
import { useState } from 'react';

function GoogleAnalytics() {
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// ฟังก์ชันที่จะถูกเรียกเมื่อลูก (Header) ทำงานสำเร็จ
	const handleRefresh = () => {
		setRefreshTrigger((prev) => prev + 1); // เปลี่ยนค่าเพื่อให้ Table รับรู้
	};

	return (
		<>
			<GlobalStyles
				styles={() => ({
					'#root': {
						maxHeight: '100vh'
					}
				})}
			/>
			<div className='w-full h-full flex flex-col px-16'>
				<CategoryHeader onCreateSuccess={handleRefresh} />
				<CategoryTable refreshTrigger={refreshTrigger} />
			</div>
		</>
	);
}

export default GoogleAnalytics;
