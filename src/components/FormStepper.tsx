import React from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';

interface FormStepperProps {
	activeStep: number;
	steps: string[];
}

export const FormStepper: React.FC<FormStepperProps> = ({ activeStep, steps }) => (
	<Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 3, md: 6 }, mb: 4 }}>
		<Stepper
			activeStep={activeStep}
			alternativeLabel
		>
			{steps.map((label) => (
				<Step key={label}>
					<StepLabel
						StepIconProps={{
							sx: {
								'&.Mui-active': { color: '#d32f2f' },
								'&.Mui-completed': { color: '#d32f2f' }
							}
						}}
					>
						{label}
					</StepLabel>
				</Step>
			))}
		</Stepper>
	</Box>
);
