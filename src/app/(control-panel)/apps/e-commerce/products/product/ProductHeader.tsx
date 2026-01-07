/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTranslation } from 'react-i18next';
import useNavigate from '@fuse/hooks/useNavigate';
import {
	useCreateECommerceProductMutation,
	useDeleteECommerceProductMutation,
	useUpdateECommerceProductMutation
} from '../../ECommerceApi';
import { API_BASE_URL } from '@/utils/apiFetch';

/**
 * The product header.
 */
function ProductHeader() {
	const routeParams = useParams<{ productId: string }>();
	const { productId } = routeParams;
	const { t, i18n } = useTranslation('EcommPage');
	const [createProduct] = useCreateECommerceProductMutation();
	const [saveProduct] = useUpdateECommerceProductMutation();
	const [removeProduct] = useDeleteECommerceProductMutation();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();

	const { name, images, featuredImageId } = watch();

	function handleSaveProduct() {
		// ✅ เพิ่มการบันทึกผ่าน fetch() ถ้าต้องการ
		alert('Save function not implemented with fetch.');
	}

	function handleCreateProduct() {
		const formValues = getValues();

		const payload = {
			...formValues,
			category_id: formValues.category?.id || null
		};

		// console.log('Submitting payload:', payload);

		fetch(`${API_BASE_URL}/products/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
			.then((res) => {
				if (!res.ok) throw new Error('Failed to create product');

				return res.json();
			})
			.then((data) => {
				// console.log('Created:', data);
				navigate(`/apps/e-commerce/products/${data.id}`);
			})
			.catch((err) => {
				console.error(err);
				alert('Create failed');
			});
	}

	function handleRemoveProduct() {
		// ✅ เพิ่มการลบผ่าน fetch() ถ้าต้องการ
		alert('Remove function not implemented with fetch.');
	}

	return (
		<div className='flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-24 sm:py-32'>
			<div className='flex flex-col items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0'>
				<motion.div
					initial={{ x: 20, opacity: 0 }}
					animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
				></motion.div>

				<div className='flex items-center max-w-full space-x-12'>
					<motion.div
						className='hidden sm:flex'
						initial={{ scale: 0 }}
						animate={{ scale: 1, transition: { delay: 0.3 } }}
					>
						{images && images.length > 0 && featuredImageId ? (
							<img
								className='w-32 sm:w-48 rounded'
								src={_.find(images, { id: featuredImageId })?.url}
								alt={name}
							/>
						) : (
							<img
								className='w-32 sm:w-48 rounded'
								src='/assets/images/apps/ecommerce/product-image-placeholder.png'
								alt={name}
							/>
						)}
					</motion.div>
					<motion.div
						className='flex flex-col min-w-0'
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className='text-15 sm:text-2xl truncate font-semibold'>
							{name || t('New Product')}
						</Typography>
						<Typography
							variant='caption'
							className='font-medium'
						>
							{t('Product Detail')}
						</Typography>
					</motion.div>
				</div>
			</div>

			<motion.div
				className='flex flex-1 w-full'
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{productId !== 'new' ? (
					<>
						<Button
							className='whitespace-nowrap mx-4'
							variant='contained'
							color='error'
							onClick={handleRemoveProduct}
							startIcon={<FuseSvgIcon className='hidden sm:flex'>heroicons-outline:trash</FuseSvgIcon>}
						>
							{t('Remove')}
						</Button>
						<Button
							className='whitespace-nowrap mx-4'
							variant='contained'
							color='primary'
							disabled={_.isEmpty(dirtyFields) || !isValid}
							onClick={handleSaveProduct}
						>
							{t('Save')}
						</Button>
					</>
				) : (
					<div></div>
				)}
			</motion.div>
		</div>
	);
}

export default ProductHeader;
