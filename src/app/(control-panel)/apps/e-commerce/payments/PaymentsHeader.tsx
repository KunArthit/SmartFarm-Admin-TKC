import { motion } from 'motion/react';

function PaymentsHeader() {
	return (
		<div className='flex grow-0  flex-1 w-full items-center justify-between  space-y-8 sm:space-y-0 py-24 sm:py-32'>
			<motion.span
				initial={{ x: -20 }}
				animate={{
					x: 0,
					transition: { delay: 0.2 }
				}}
			></motion.span>

			<div className='flex w-full sm:w-auto flex-1 items-center justify-end space-x-8' />
		</div>
	);
}

export default PaymentsHeader;
