import { motion } from 'motion/react';
import SummaryWidget from './widgets/SummaryWidget';
import OverdueWidget from './widgets/OverdueWidget';
import IssuesWidget from './widgets/IssuesWidget';
import FeaturesWidget from './widgets/FeaturesWidget';
import GithubIssuesWidget from './widgets/GithubIssuesWidget';
import TaskDistributionWidget from './widgets/TaskDistributionWidget';
// import ScheduleWidget from './widgets/ScheduleWidget';
import { useTranslation } from 'react-i18next';
// import CategoryDistributionWidget from './widgets/CategoryDistributionWidget';

/**
 * The HomeTab component.
 */
function HomeTab() {
	const { t } = useTranslation('projectPage');

	const container = {
		show: {
			transition: {
				staggerChildren: 0.04
			}
		}
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	return (
		<motion.div
			className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-24 w-full min-w-0 py-24 px-24 md:px-32'
			variants={container}
			initial='hidden'
			animate='show'
		>
			<motion.div variants={item}>
				<SummaryWidget title={t('Summary')} />
			</motion.div>
			<motion.div variants={item}>
				<OverdueWidget title={t('Categories')} />
			</motion.div>
			<motion.div variants={item}>
				<IssuesWidget title={t('Solutions')} />
			</motion.div>
			<motion.div variants={item}>
				<FeaturesWidget title={t('Number of Orders')} />
			</motion.div>
			<motion.div
				variants={item}
				className='sm:col-span-2 md:col-span-4'
			>
				<GithubIssuesWidget title={t('Github Issues')} />
			</motion.div>
			<motion.div
				variants={item}
				className='sm:col-span-2 md:col-span-4 lg:col-span-2'
			>
				<TaskDistributionWidget title={t('Task Distribution')} />
			</motion.div>
		</motion.div>
	);
}

export default HomeTab;
