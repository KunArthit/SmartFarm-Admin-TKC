import { Grid, TextField, InputAdornment } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

function PricingTab() {
	const { control, formState, watch } = useFormContext();
	const { errors } = formState;

	const price = watch('price');

	return (
		<Grid
			container
			spacing={3}
		>
			<Grid
				item
				xs={12}
				md={6}
			>
				<Controller
					name='price'
					control={control}
					rules={{
						required: 'Price is required',
						min: { value: 0, message: 'Price cannot be negative' }
					}}
					render={({ field }) => (
						<TextField
							{...field}
							fullWidth
							type='number'
							label='Regular Price'
							variant='outlined'
							InputProps={{
								startAdornment: <InputAdornment position='start'>$</InputAdornment>
							}}
							error={!!errors.price}
							helperText={errors.price?.message as string}
						/>
					)}
				/>
			</Grid>

			<Grid
				item
				xs={12}
				md={6}
			>
				<Controller
					name='sale_price'
					control={control}
					rules={{
						min: { value: 0, message: 'Sale price cannot be negative' },
						validate: (value) =>
							value === 0 || value < price || 'Sale price must be less than regular price'
					}}
					render={({ field }) => (
						<TextField
							{...field}
							fullWidth
							type='number'
							label='Sale Price (optional)'
							variant='outlined'
							InputProps={{
								startAdornment: <InputAdornment position='start'>$</InputAdornment>
							}}
							error={!!errors.sale_price}
							helperText={errors.sale_price?.message as string}
						/>
					)}
				/>
			</Grid>

			<Grid
				item
				xs={12}
				md={6}
			>
				<Controller
					name='stock_quantity'
					control={control}
					rules={{
						required: 'Stock quantity is required',
						min: { value: 0, message: 'Stock quantity cannot be negative' }
					}}
					render={({ field }) => (
						<TextField
							{...field}
							fullWidth
							type='number'
							label='Stock Quantity'
							variant='outlined'
							error={!!errors.stock_quantity}
							helperText={errors.stock_quantity?.message as string}
						/>
					)}
				/>
			</Grid>
		</Grid>
	);
}

export default PricingTab;
