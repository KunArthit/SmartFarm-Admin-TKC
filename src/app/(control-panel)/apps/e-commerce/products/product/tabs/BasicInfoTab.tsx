/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { TextField, Autocomplete, Grid, Button } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

interface Solution {
	id: number;
	name: string;
}

interface ProductCategory {
	id: number;
	name: string;
}

function BasicInfoTab() {
	const { control, formState, setValue } = useFormContext();
	const { errors } = formState;

	const [solutionOptions, setSolutionOptions] = useState<Solution[]>([]);
	const [productCategoryOptions, setProductCategoryOptions] = useState<ProductCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	// Add a debug function
	const debugForm = () => {};

	useEffect(() => {
		setLoading(true);

		// Fetch solutions from your API
		fetch(`${API_BASE_URL}/solution-categories`)
			.then((res) => res.json())
			.then((data) => {
				// console.log('Solutions loaded:', data);
				setSolutionOptions(data);

				// If there's only one solution, automatically select it
				if (data.length === 1) {
					setValue('solution', data[0]);
				}
			})
			.catch((error) => {
				console.error('Error loading solutions:', error);
			})
			.finally(() => setLoading(false));

		// Fetch product categories from your API
		fetch(`${API_BASE_URL}/product-categories`)
			.then((res) => res.json())
			.then((data) => {
				// console.log('Product categories loaded:', data);
				setProductCategoryOptions(data);

				// If there's only one product category, automatically select it
				if (data.length === 1) {
					setValue('product_category', data[0]);
				}
			})
			.catch((error) => {
				console.error('Error loading product categories:', error);
			});
	}, [setValue]);

	return (
		<Grid
			container
			spacing={2}
		>
			<Grid
				item
				xs={12}
			>
				<Controller
					name='name'
					control={control}
					rules={{ required: 'Product name is required' }}
					render={({ field }) => (
						<TextField
							{...field}
							fullWidth
							label='Product Name'
							variant='outlined'
							error={!!errors.name}
							helperText={errors.name?.message as string}
						/>
					)}
				/>
			</Grid>

			<Grid
				item
				xs={12}
			>
				<Controller
					name='sku'
					control={control}
					rules={{ required: 'SKU is required' }}
					render={({ field }) => (
						<TextField
							{...field}
							fullWidth
							label='SKU'
							variant='outlined'
							error={!!errors.sku}
							helperText={errors.sku?.message as string}
						/>
					)}
				/>
			</Grid>

			<Grid
				item
				xs={12}
			>
				<Controller
					name='description'
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							fullWidth
							label='Full Description'
							multiline
							rows={5}
							variant='outlined'
							error={!!errors.description}
							helperText={errors.description?.message as string}
						/>
					)}
				/>
			</Grid>

			<Grid
				item
				xs={12}
			>
				<Controller
					name='short_description'
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							fullWidth
							label='Short Description'
							multiline
							rows={2}
							variant='outlined'
							error={!!errors.short_description}
							helperText={errors.short_description?.message as string}
						/>
					)}
				/>
			</Grid>

			<Grid
				item
				xs={12}
			>
				<Controller
					name='solution'
					control={control}
					rules={{ required: 'Solution is required' }}
					render={({ field: { onChange, value } }) => (
						<Autocomplete
							options={solutionOptions}
							loading={loading}
							getOptionLabel={(option) => option.name || ''}
							isOptionEqualToValue={(option, value) => option?.id === value?.id}
							value={value}
							onChange={(event, newValue) => {
								// console.log('Solution selected:', newValue);
								onChange(newValue);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label='Solution'
									variant='outlined'
									error={!!errors.solution}
									helperText={errors.solution?.message as string}
								/>
							)}
						/>
					)}
				/>
			</Grid>

			<Grid
				item
				xs={12}
			>
				<Controller
					name='product_category'
					control={control}
					rules={{ required: 'Product category is required' }}
					render={({ field: { onChange, value } }) => (
						<Autocomplete
							options={productCategoryOptions}
							getOptionLabel={(option) => option.name || ''}
							isOptionEqualToValue={(option, value) => option?.id === value?.id}
							value={value}
							onChange={(event, newValue) => {
								onChange(newValue);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label='Product Category'
									variant='outlined'
									error={!!errors.product_category}
									helperText={errors.product_category?.message as string}
								/>
							)}
						/>
					)}
				/>
			</Grid>

			{/* Debug button - can remove in production */}
			<Grid
				item
				xs={12}
				sx={{ mt: 2 }}
			>
				<Button
					onClick={debugForm}
					variant='outlined'
					color='secondary'
				>
					Debug Form Values
				</Button>
			</Grid>
		</Grid>
	);
}

export default BasicInfoTab;
