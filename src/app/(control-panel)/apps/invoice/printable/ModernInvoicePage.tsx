import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';

/**
 * The modern invoice page for smart devices in Thai.
 */
function ModernInvoicePage() {
	return (
		<div className='inline-block w-full overflow-auto p-24 text-left sm:p-40 print:p-0'>
			<motion.div
				initial={{ opacity: 0, y: 200 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ bounceDamping: 0 }}
			>
				<Card className='mx-auto w-xl rounded-xl p-64 shadow print:w-auto print:rounded-none print:bg-transparent print:shadow-none'>
					<CardContent>
						<div className='flex items-start'>
							<div className='grid grid-rows-2 place-items-start gap-y-48'>
								<div className='grid auto-cols-max grid-flow-col gap-x-32'>
									<div className='w-96 place-self-center'>
										<img
											className='w-96'
											src='/assets/images/logo/FarmSuk-TM.png'
											alt='logo'
										/>
									</div>
									<div className='border-l pl-40 text-md'>
										<Typography className='font-medium'>Smart Devices Co., Ltd.</Typography>
										<Typography>123/45 ถนนสุขุมวิท</Typography>
										<Typography>แขวงคลองตันเหนือ เขตวัฒนา</Typography>
										<Typography>กรุงเทพมหานคร 10110</Typography>
										<Typography>+66 123 456 789</Typography>
										<Typography>info@smartdevices.com</Typography>
										<Typography>www.smartdevices.com</Typography>
									</div>
								</div>
								<div className='grid auto-cols-max grid-flow-col gap-x-32'>
									<Typography
										className='w-96 place-self-center text-center text-2xl'
										color='text.secondary'
									>
										บิลถึง
									</Typography>
									<div className='border-l pl-40 text-md'>
										<Typography className='font-medium'>นายสมชาย ใจดี</Typography>
										<Typography>88/99 หมู่บ้านสวนสมชาย</Typography>
										<Typography>แขวงบางนา เขตบางนา</Typography>
										<Typography>กรุงเทพมหานคร 10260</Typography>
										<Typography>somchai.jaidee@customer.com</Typography>
										<Typography>+66 987 654 321</Typography>
									</div>
								</div>
							</div>
							<div className='ml-auto grid grid-cols-2 gap-x-16 gap-y-4'>
								<Typography
									className='justify-self-end text-4xl tracking-tight'
									color='text.secondary'
								>
									ใบแจ้งหนี้
								</Typography>
								<Typography className='text-4xl'>#9-0004</Typography>
								<Typography
									className='justify-self-end font-medium tracking-tight'
									color='text.secondary'
								>
									วันที่ออกใบแจ้งหนี้
								</Typography>
								<Typography className='font-medium'>19 กรกฎาคม 2565</Typography>
								<Typography
									className='justify-self-end font-medium tracking-tight'
									color='text.secondary'
								>
									กำหนดชำระ
								</Typography>
								<Typography className='font-medium'>19 สิงหาคม 2565</Typography>
								<Typography
									className='justify-self-end font-medium tracking-tight'
									color='text.secondary'
								>
									ยอดรวมที่ต้องชำระ
								</Typography>
								<Typography className='font-medium'>฿49,000.00</Typography>
							</div>
						</div>

						<div className='mt-16 grid grid-cols-12 gap-x-4'>
							<Typography
								className='col-span-8 text-md font-medium'
								color='text.secondary'
							>
								สินค้า / บริการ
							</Typography>
							<Typography
								className='text-right text-md font-medium'
								color='text.secondary'
							>
								ราคาต่อหน่วย
							</Typography>
							<Typography
								className='text-right text-md font-medium'
								color='text.secondary'
							>
								จำนวน
							</Typography>
							<Typography
								className='col-span-2 text-right text-md font-medium'
								color='text.secondary'
							>
								ยอดรวม
							</Typography>

							<div className='col-span-12 my-16 border-b' />

							<div className='col-span-8'>
								<Typography className='text-lg font-medium'>กล้องวงจรปิดอัจฉริยะ</Typography>
								<Typography
									className='mt-8 text-md'
									color='text.secondary'
								>
									กล้องวงจรปิดที่มาพร้อมกับ AI
									สำหรับการตรวจจับการเคลื่อนไหวและส่งสัญญาณแจ้งเตือนแบบเรียลไทม์
								</Typography>
							</div>
							<Typography className='self-center text-right'>฿5,000.00</Typography>
							<Typography className='self-center text-right'>5</Typography>
							<Typography className='col-span-2 self-center text-right'>฿25,000.00</Typography>

							<div className='col-span-12 my-16 border-b' />

							<div className='col-span-8'>
								<Typography className='text-lg font-medium'>ระบบไฟอัจฉริยะ</Typography>
								<Typography
									className='mt-8 text-md'
									color='text.secondary'
								>
									หลอดไฟที่สามารถควบคุมผ่านแอปพลิเคชัน พร้อมฟังก์ชันเปลี่ยนสีได้หลากหลาย
								</Typography>
							</div>
							<Typography className='self-center text-right'>฿2,500.00</Typography>
							<Typography className='self-center text-right'>8</Typography>
							<Typography className='col-span-2 self-center text-right'>฿20,000.00</Typography>

							<div className='col-span-12 my-16 border-b' />

							<Typography
								className='col-span-10 self-center text-2xl font-medium tracking-tight'
								color='text.secondary'
							>
								ยอดรวมสุทธิ
							</Typography>
							<Typography className='col-span-2 text-right text-2xl font-medium'>฿49,000.00</Typography>
						</div>

						<div className='mt-64'>
							<Typography className='font-medium'>
								กรุณาชำระเงินภายใน 15 วัน ขอบคุณที่เลือกใช้บริการของเรา
							</Typography>
							<div className='mt-16 flex items-start'>
								<img
									className='flex-0 mt-8 w-36'
									src='/assets/images/logo/logo.svg'
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

export default ModernInvoicePage;
