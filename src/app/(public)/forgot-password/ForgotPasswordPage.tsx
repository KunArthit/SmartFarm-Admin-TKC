import React from 'react';

const ForgotPassword: React.FC = () => {
	const handleBackToLogin = () => {
		window.location.href = '/sign-in';
	};

	// Keyframes for animations
	const pulseAnimation = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes ping {
      0% { transform: scale(1); opacity: 1; }
      75%, 100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(10px, -10px) rotate(1deg); }
      66% { transform: translate(-5px, 5px) rotate(-1deg); }
    }
    .pulse { animation: pulse 2s ease-in-out infinite; }
    .bounce { animation: bounce 2s ease-in-out infinite; }
    .ping { animation: ping 2s ease-in-out infinite; }
    .float { animation: float 6s ease-in-out infinite; }
  `;

	const containerStyle: React.CSSProperties = {
		minHeight: '100vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
		padding: '48px 16px',
		position: 'relative',
		overflow: 'hidden',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
	};

	const decorationStyle = (
		top: string,
		left: string,
		right: string,
		bottom: string,
		size: string,
		color: string,
		animation: string
	): React.CSSProperties => ({
		position: 'absolute',
		top,
		left,
		right,
		bottom,
		width: size,
		height: size,
		backgroundColor: color,
		borderRadius: '50%',
		opacity: 0.3,
		animation: `${animation} 3s ease-in-out infinite`
	});

	const mainCardStyle: React.CSSProperties = {
		maxWidth: '448px',
		width: '100%',
		position: 'relative',
		zIndex: 10
	};

	const headerStyle: React.CSSProperties = {
		textAlign: 'center',
		marginBottom: '32px'
	};

	const lockIconContainerStyle: React.CSSProperties = {
		margin: '0 auto',
		height: '64px',
		width: '64px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '16px',
		background: 'linear-gradient(135deg, #f87171 0%, #ec4899 100%)',
		boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		transition: 'transform 0.3s ease',
		cursor: 'pointer'
	};

	const titleStyle: React.CSSProperties = {
		marginTop: '24px',
		textAlign: 'center',
		fontSize: '36px',
		fontWeight: 'bold',
		background: 'linear-gradient(135deg, #1f2937 0%, #6b7280 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text'
	};

	const subtitleBadgeStyle: React.CSSProperties = {
		marginTop: '12px',
		display: 'inline-flex',
		alignItems: 'center',
		padding: '8px 16px',
		borderRadius: '9999px',
		background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
		border: '1px solid #bfdbfe'
	};

	const statusDotStyle: React.CSSProperties = {
		width: '8px',
		height: '8px',
		backgroundColor: '#3b82f6',
		borderRadius: '50%',
		marginRight: '8px',
		animation: 'pulse 2s ease-in-out infinite'
	};

	const mainContentStyle: React.CSSProperties = {
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		backdropFilter: 'blur(10px)',
		padding: '32px 24px',
		boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
		borderRadius: '24px',
		border: '1px solid rgba(255, 255, 255, 0.5)',
		transition: 'box-shadow 0.5s ease',
		marginBottom: '32px'
	};

	const helpIconContainerStyle: React.CSSProperties = {
		margin: '0 auto',
		height: '80px',
		width: '80px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '50%',
		background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
		marginBottom: '24px',
		boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
		transition: 'transform 0.3s ease',
		cursor: 'pointer'
	};

	const helpTitleStyle: React.CSSProperties = {
		fontSize: '20px',
		fontWeight: 'bold',
		color: '#1f2937',
		marginBottom: '24px',
		textAlign: 'center'
	};

	const warningBoxStyle: React.CSSProperties = {
		background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
		border: '1px solid #fbbf24',
		borderRadius: '16px',
		padding: '20px',
		marginBottom: '32px',
		boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
	};

	const warningIconStyle: React.CSSProperties = {
		height: '32px',
		width: '32px',
		background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0
	};

	const contactCardStyle: React.CSSProperties = {
		background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
		borderRadius: '16px',
		padding: '24px',
		boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
		border: '1px solid #a7f3d0',
		transition: 'box-shadow 0.3s ease',
		marginBottom: '24px'
	};

	const contactIconStyle: React.CSSProperties = {
		height: '48px',
		width: '48px',
		background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: '12px'
	};

	const phoneButtonStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.6)',
		borderRadius: '12px',
		padding: '16px',
		transition: 'background-color 0.2s ease',
		textDecoration: 'none',
		marginBottom: '16px'
	};

	const infoCardStyle: React.CSSProperties = {
		background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
		borderRadius: '16px',
		padding: '24px',
		boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
		border: '1px solid #bfdbfe',
		transition: 'box-shadow 0.3s ease'
	};

	const infoIconStyle: React.CSSProperties = {
		height: '48px',
		width: '48px',
		background: 'linear-gradient(135deg, #60a5fa 0%, #6366f1 100%)',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: '12px'
	};

	const listItemStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.6)',
		borderRadius: '8px',
		padding: '12px',
		transition: 'background-color 0.2s ease',
		marginBottom: '12px'
	};

	const numberBadgeStyle: React.CSSProperties = {
		height: '24px',
		width: '24px',
		background: 'linear-gradient(135deg, #60a5fa 0%, #6366f1 100%)',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: '12px',
		flexShrink: 0
	};

	const backButtonStyle: React.CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '12px 24px',
		borderRadius: '9999px',
		background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
		border: '1px solid #d1d5db',
		transition: 'all 0.3s ease',
		cursor: 'pointer',
		textDecoration: 'none',
		boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
	};

	return (
		<div style={containerStyle}>
			<style>{pulseAnimation}</style>

			{/* Background decorations */}
			<div
				style={decorationStyle('40px', '40px', 'auto', 'auto', '80px', '#bfdbfe', 'pulse')}
				className='pulse'
			></div>
			<div
				style={decorationStyle('160px', 'auto', '80px', 'auto', '64px', '#e9d5ff', 'bounce')}
				className='bounce'
			></div>
			<div
				style={decorationStyle('auto', '25%', 'auto', '80px', '48px', '#fbcfe8', 'ping')}
				className='ping'
			></div>
			<div
				style={decorationStyle('auto', 'auto', '40px', '160px', '96px', '#c7d2fe', 'pulse')}
				className='pulse'
			></div>

			<div style={mainCardStyle}>
				<div style={headerStyle}>
					<div
						style={lockIconContainerStyle}
						onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
						onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
					>
						<svg
							style={{ height: '32px', width: '32px', color: 'white' }}
							className='pulse'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
							/>
						</svg>
					</div>

					<h2 style={titleStyle}>ลืมรหัสผ่าน</h2>

					<div style={subtitleBadgeStyle}>
						<div
							style={statusDotStyle}
							className='pulse'
						></div>
						<p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', margin: 0 }}>
							Admin Panel - Password Recovery
						</p>
					</div>
				</div>

				<div
					style={mainContentStyle}
					onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 35px 60px -12px rgba(0, 0, 0, 0.3)')}
					onMouseOut={(e) => (e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)')}
				>
					<div style={{ textAlign: 'center' }}>
						<div
							style={helpIconContainerStyle}
							onMouseOver={(e) => (e.currentTarget.style.transform = 'rotate(12deg)')}
							onMouseOut={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
						>
							<svg
								style={{ height: '40px', width: '40px', color: 'white' }}
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						</div>

						<h3 style={helpTitleStyle}>ต้องการความช่วยเหลือในการเข้าสู่ระบบ?</h3>

						<div style={warningBoxStyle}>
							<div style={{ display: 'flex', alignItems: 'flex-start' }}>
								<div style={warningIconStyle}>
									<svg
										style={{ height: '16px', width: '16px', color: 'white' }}
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<div style={{ marginLeft: '16px' }}>
									<h4
										style={{
											fontSize: '14px',
											fontWeight: 'bold',
											color: '#92400e',
											marginBottom: '8px'
										}}
									>
										ข้อมูลสำคัญ
									</h4>
									<p style={{ fontSize: '14px', color: '#a16207', lineHeight: '1.6', margin: 0 }}>
										เนื่องจากระบบ Admin มีความปลอดภัยสูง
										การรีเซ็ตรหัสผ่านจำเป็นต้องได้รับการยืนยันจาก IT Support
									</p>
								</div>
							</div>
						</div>

						<div style={{ marginBottom: '24px' }}>
							<div
								style={contactCardStyle}
								onMouseOver={(e) =>
									(e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)')
								}
								onMouseOut={(e) =>
									(e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
								}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: '16px'
									}}
								>
									<div style={contactIconStyle}>
										<svg
											style={{ height: '24px', width: '24px', color: 'white' }}
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
											/>
										</svg>
									</div>
									<h4 style={{ fontWeight: 'bold', color: '#065f46', fontSize: '18px', margin: 0 }}>
										กรุณาติดต่อ IT Support
									</h4>
								</div>

								<div
									style={phoneButtonStyle}
									onMouseOver={(e) =>
										(e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)')
									}
									onMouseOut={(e) =>
										(e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)')
									}
								>
									<svg
										style={{ height: '24px', width: '24px', color: '#059669', marginRight: '12px' }}
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
										/>
									</svg>
									<a
										href='tel:09x-xxx-xxxx'
										style={{
											fontSize: '24px',
											fontFamily: 'monospace',
											fontWeight: 'bold',
											color: '#047857',
											textDecoration: 'none'
										}}
									>
										09x-xxx-xxxx
									</a>
								</div>

								<div
									style={{
										backgroundColor: 'rgba(255, 255, 255, 0.4)',
										borderRadius: '8px',
										padding: '12px',
										textAlign: 'center'
									}}
								>
									<p style={{ fontSize: '14px', fontWeight: 500, color: '#047857', margin: 0 }}>
										⏰ เวลาทำการ: จันทร์-ศุกร์ 08:00-17:00 น.
									</p>
								</div>
							</div>
						</div>

						<div
							style={infoCardStyle}
							onMouseOver={(e) =>
								(e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)')
							}
							onMouseOut={(e) => (e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)')}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									marginBottom: '16px'
								}}
							>
								<div style={infoIconStyle}>
									<svg
										style={{ height: '24px', width: '24px', color: 'white' }}
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
										/>
									</svg>
								</div>
								<h4 style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '18px', margin: 0 }}>
									ข้อมูลที่ต้องเตรียม
								</h4>
							</div>

							<div>
								{[
									'ชื่อผู้ใช้งาน (Username) ที่ต้องการรีเซ็ต',
									'หมายเลขพนักงานหรือรหัสประจำตัว',
									'ข้อมูลส่วนตัวเพื่อยืนยันตัวตน'
								].map((item, index) => (
									<div
										key={index}
										style={listItemStyle}
										onMouseOver={(e) =>
											(e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)')
										}
										onMouseOut={(e) =>
											(e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)')
										}
									>
										<div style={numberBadgeStyle}>
											<span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
												{index + 1}
											</span>
										</div>
										<span style={{ fontSize: '14px', fontWeight: 500, color: '#1e40af' }}>
											{item}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<div style={{ textAlign: 'center' }}>
					<button
						onClick={handleBackToLogin}
						style={backButtonStyle}
						onMouseOver={(e) => {
							e.currentTarget.style.background = 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)';
							e.currentTarget.style.borderColor = '#3b82f6';
							e.currentTarget.style.transform = 'scale(1.05)';
						}}
						onMouseOut={(e) => {
							e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
							e.currentTarget.style.borderColor = '#d1d5db';
							e.currentTarget.style.transform = 'scale(1)';
						}}
					>
						<svg
							style={{
								height: '20px',
								width: '20px',
								marginRight: '8px',
								color: '#4b5563',
								transition: 'all 0.3s ease'
							}}
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M7 16l-4-4m0 0l4-4m-4 4h18'
							/>
						</svg>
						<span style={{ fontWeight: 500, color: '#374151' }}>กลับไปหน้าเข้าสู่ระบบ</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
