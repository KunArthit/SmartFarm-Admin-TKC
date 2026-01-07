import GlobalStyles from '@mui/material/GlobalStyles';
import PaymentHeader from './PaymentsHeader';
import PaymentTable from './PaymentTable';

/**
 * The orders page.
 */
function Payments() {
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
				<PaymentHeader />
				<PaymentTable />
			</div>
		</>
	);
}

export default Payments;
