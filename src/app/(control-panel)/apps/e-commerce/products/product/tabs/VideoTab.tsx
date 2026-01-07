import {
	Box,
	Button,
	Grid,
	Typography,
	Card,
	CardContent,
	IconButton,
	TextField,
	MenuItem,
	FormControl,
	InputLabel,
	Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';

function VideosTab() {
	const { control } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'videos'
	});

	const videoTypes = [
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'vimeo', label: 'Vimeo' },
		{ value: 'custom', label: 'Custom URL' }
	];

	const addNewVideo = () => {
		append({
			url: '',
			type: 'youtube',
			display_order: fields.length
		});
	};

	return (
		<Box>
			<Typography
				variant='h6'
				gutterBottom
			>
				Product Videos
			</Typography>

			<Button
				variant='outlined'
				startIcon={<AddIcon />}
				onClick={addNewVideo}
				sx={{ mb: 3 }}
			>
				Add Video
			</Button>

			<Grid
				container
				spacing={3}
			>
				{fields.map((field, index) => (
					<Grid
						item
						xs={12}
						key={field.id}
					>
						<Card variant='outlined'>
							<CardContent>
								<Grid
									container
									spacing={2}
								>
									<Grid
										item
										xs={12}
										md={6}
									>
										<Controller
											name={`videos.${index}.url`}
											control={control}
											rules={{ required: 'Video URL is required' }}
											render={({ field, fieldState: { error } }) => (
												<TextField
													{...field}
													fullWidth
													label='Video URL'
													variant='outlined'
													error={!!error}
													helperText={error?.message}
												/>
											)}
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={3}
									>
										<Controller
											name={`videos.${index}.type`}
											control={control}
											render={({ field }) => (
												<FormControl fullWidth>
													<InputLabel>Video Type</InputLabel>
													<Select
														{...field}
														label='Video Type'
													>
														{videoTypes.map((type) => (
															<MenuItem
																key={type.value}
																value={type.value}
															>
																{type.label}
															</MenuItem>
														))}
													</Select>
												</FormControl>
											)}
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={2}
									>
										<Controller
											name={`videos.${index}.display_order`}
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													fullWidth
													type='number'
													label='Display Order'
													variant='outlined'
												/>
											)}
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={1}
										sx={{ display: 'flex', alignItems: 'center' }}
									>
										<IconButton
											color='error'
											onClick={() => remove(index)}
										>
											<DeleteIcon />
										</IconButton>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			{fields.length === 0 && (
				<Typography
					variant='body2'
					color='textSecondary'
					sx={{ mt: 2, textAlign: 'center' }}
				>
					No videos added yet. Videos are optional but can help showcase your product.
				</Typography>
			)}
		</Box>
	);
}

export default VideosTab;
