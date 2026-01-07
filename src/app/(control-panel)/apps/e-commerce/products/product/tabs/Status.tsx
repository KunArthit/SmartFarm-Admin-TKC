import { Box, FormControlLabel, Switch, Typography, Paper, Grid, Alert } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

function StatusTab() {
	const { control, watch } = useFormContext();
	const isActive = watch('is_active');
	const isFeatured = watch('is_featured');

	return (
		<Box>
			<Typography
				variant='h6'
				gutterBottom
			>
				Product Status
			</Typography>

			<Grid
				container
				spacing={3}
			>
				<Grid
					item
					xs={12}
				>
					<Paper
						variant='outlined'
						sx={{ p: 3, mb: 3 }}
					>
						<Grid
							container
							spacing={2}
						>
							<Grid
								item
								xs={12}
							>
								<Controller
									name='is_active'
									control={control}
									render={({ field: { value, onChange } }) => (
										<FormControlLabel
											control={
												<Switch
													checked={value}
													onChange={(e) => onChange(e.target.checked)}
													color='primary'
												/>
											}
											label='Active Product'
										/>
									)}
								/>
								<Typography
									variant='body2'
									color='textSecondary'
								>
									{isActive
										? 'Product will be visible and available for purchase'
										: 'Product will be hidden from customers'}
								</Typography>
							</Grid>

							<Grid
								item
								xs={12}
								sx={{ mt: 2 }}
							>
								<Controller
									name='is_featured'
									control={control}
									render={({ field: { value, onChange } }) => (
										<FormControlLabel
											control={
												<Switch
													checked={value}
													onChange={(e) => onChange(e.target.checked)}
													color='primary'
												/>
											}
											label='Featured Product'
										/>
									)}
								/>
								<Typography
									variant='body2'
									color='textSecondary'
								>
									{isFeatured
										? 'Product will be highlighted on the homepage and featured sections'
										: 'Product will appear in regular listings only'}
								</Typography>
							</Grid>
						</Grid>
					</Paper>
				</Grid>

				<Grid
					item
					xs={12}
				>
					<Alert severity='info'>
						<Typography variant='body2'>
							Once you create this product, it will be added to your catalog. You can always edit the
							product later.
						</Typography>
					</Alert>
				</Grid>

				<Grid
					item
					xs={12}
				>
					<Alert severity='warning'>
						<Typography variant='body2'>
							Make sure you have completed all previous steps before finalizing your product:
							<ul>
								<li>Added basic product information and selected a category</li>
								<li>Set pricing and stock information</li>
								<li>Uploaded at least one product image</li>
							</ul>
						</Typography>
					</Alert>
				</Grid>
			</Grid>
		</Box>
	);
}

export default StatusTab;
