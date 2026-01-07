import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

/**
 * The compact invoice page for smart devices.
 */
function CompactInvoicePage() {
	return (
		<div className='inline-block w-full overflow-auto p-24 text-left sm:p-40 print:p-0'>
			<motion.div
				initial={{ opacity: 0, y: 200 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ bounceDamping: 0 }}
			>
				<Card className='mx-auto w-xl rounded-xl p-64 shadow print:w-auto print:rounded-none print:bg-transparent print:shadow-none'>
					<CardContent>
						<div className='flex items-start justify-between'>
							<div className='grid grid-cols-2 gap-x-16 gap-y-1'>
								<Typography
									className='text-4xl tracking-tight'
									color='text.secondary'
								>
									ใบแจ้งหนี้
								</Typography>
								<Typography className='text-4xl'>#9-0004</Typography>
								<Typography
									className='font-medium tracking-tight'
									color='text.secondary'
								>
									วันที่ออกใบแจ้งหนี้
								</Typography>
								<Typography className='font-medium'>19 กรกฎาคม 2565</Typography>
								<Typography
									className='font-medium tracking-tight'
									color='text.secondary'
								>
									กำหนดชำระ
								</Typography>
								<Typography className='font-medium'>19 สิงหาคม 2565</Typography>
								<Typography
									className='font-medium tracking-tight'
									color='text.secondary'
								>
									ยอดรวมที่ต้องชำระ
								</Typography>
								<Typography className='font-medium'>฿235,000.00</Typography>
							</div>

							<Box
								sx={(theme) => ({
									backgroundColor: theme.palette.primary.light,
									color: theme.palette.getContrastText(theme.palette.primary.dark)
								})}
								className='-mr-64 grid auto-cols-max grid-flow-col gap-x-32 rounded-l-2xl px-32 py-24'
							>
								<div className='w-96 place-self-center'>
									<img
										className='w-96'
										src='/assets/images/logo/FarmSuk-TM.png'
										alt='logo'
									/>
								</div>
								<Box
									className='border-l pl-40 text-md'
									sx={{
										borderColor: (theme) =>
											alpha(theme.palette.getContrastText(theme.palette.primary.dark), 0.25)
									}}
								>
									<Typography className='font-medium'>Smart Devices Co., Ltd.</Typography>
									<Typography>123/45 ถนนสุขุมวิท</Typography>
									<Typography>แขวงคลองตันเหนือ เขตวัฒนา</Typography>
									<Typography>กรุงเทพมหานคร 10110</Typography>
									<Typography>+66 123 456 789</Typography>
									<Typography>info@smartdevices.com</Typography>
									<Typography>www.smartdevices.com</Typography>
								</Box>
							</Box>
						</div>

						<div className='text-md'>
							<Typography className='text-xl font-medium'>นายสมชาย ใจดี</Typography>
							<Typography>88/99 หมู่บ้านสวนสมชาย</Typography>
							<Typography>แขวงบางนา เขตบางนา</Typography>
							<Typography>กรุงเทพมหานคร 10260</Typography>
							<Typography>somchai.jaidee@customer.com</Typography>
							<Typography>+66 987 654 321</Typography>
						</div>

						<div className='mt-48 grid grid-cols-12 gap-x-4'>
							<div
								className='col-span-8 text-md font-medium'
								color='text.secondary'
							>
								สินค้า / บริการ
							</div>
							<div
								className='text-right text-md font-medium'
								color='text.secondary'
							>
								ราคาต่อหน่วย
							</div>
							<div
								className='text-right text-md font-medium'
								color='text.secondary'
							>
								จำนวน
							</div>
							<div
								className='col-span-2 text-right text-md font-medium'
								color='text.secondary'
							>
								ยอดรวม
							</div>

							<div className='col-span-12 my-16 border-b' />

							<Typography className='col-span-8 text-lg font-medium'>Smart Home Assistant</Typography>
							<Typography className='self-center text-right'>฿5,000.00</Typography>
							<Typography className='self-center text-right'>10</Typography>
							<Typography className='col-span-2 self-center text-right'>฿50,000.00</Typography>

							<div className='col-span-12 my-16 border-b' />

							<Typography className='col-span-8 text-lg font-medium'>Smart Security Camera</Typography>
							<Typography className='self-center text-right'>฿2,500.00</Typography>
							<Typography className='self-center text-right'>20</Typography>
							<Typography className='col-span-2 self-center text-right'>฿50,000.00</Typography>

							<div className='col-span-12 my-16 border-b' />

							<Typography className='col-span-8 text-lg font-medium'>Wireless Doorbell</Typography>
							<Typography className='self-center text-right'>฿3,000.00</Typography>
							<Typography className='self-center text-right'>15</Typography>
							<Typography className='col-span-2 self-center text-right'>฿45,000.00</Typography>

							<div className='col-span-12 my-16 border-b' />

							<Typography
								className='col-span-10 self-center font-medium tracking-tight'
								color='text.secondary'
							>
								ยอดรวมย่อย
							</Typography>
							<Typography className='col-span-2 text-right text-lg'>฿145,000.00</Typography>

							<div className='col-span-12 my-12 border-b' />

							<Typography
								className='col-span-10 self-center font-medium tracking-tight'
								color='text.secondary'
							>
								ภาษีมูลค่าเพิ่ม (7%)
							</Typography>
							<Typography className='col-span-2 text-right text-lg'>฿10,150.00</Typography>

							<div className='col-span-12 my-12 border-b' />

							<Typography
								className='col-span-10 self-center text-2xl font-medium tracking-tight'
								color='text.secondary'
							>
								ยอดรวมสุทธิ
							</Typography>
							<Typography className='col-span-2 text-right text-2xl font-medium'>฿155,150.00</Typography>
						</div>

						<div className='mt-64'>
							<Typography className='font-medium'>
								กรุณาชำระเงินภายใน 15 วัน ขอบคุณสำหรับการสั่งซื้อของคุณ
							</Typography>
							<div className='mt-16 flex items-start'>
								<img
									className='flex-0 mt-8 w-36'
									src='/assets/images/logo/FarmSuk-TM.png'
									alt='logo'
								/>
								<Typography
									className='ml-24 text-sm'
									color='text.secondary'
								>
									ขอบคุณที่เลือกซื้อสินค้าอัจฉริยะจากเรา
									เรามุ่งมั่นที่จะนำเสนออุปกรณ์ที่ช่วยทำให้ชีวิตคุณสะดวกสบาย
									ไม่ว่าจะเป็นกล้องวงจรปิดอัจฉริยะหรือผู้ช่วยในบ้านอัตโนมัติ
									เราพร้อมให้บริการคุณด้วยความจริงใจ หากคุณมีคำถามหรือข้อสงสัยเพิ่มเติม
									โปรดติดต่อเราผ่านช่องทางที่ระบุในใบแจ้งหนี้นี้
									ขอให้คุณเพลิดเพลินกับการใช้ผลิตภัณฑ์และขอบคุณที่ไว้วางใจเราเสมอ
								</Typography>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

export default CompactInvoicePage;
