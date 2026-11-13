import { useLocation } from 'react-router-dom';
import { navigation } from '../../config/navigation';
const descriptions = {
  '/': 'A clear view of your business balances, daily activity, and financial trends.',
  '/bakery': 'Manage daily sales and expenses, and follow your weekly balance.',
  '/reserves': 'Track profits, expenses, and your running reserve balance.',
  '/cement': 'Record cement sales and purchases, and review your ledger.',
  '/farms': 'Keep farm income, expenditure, and balances in one place.',
};
export function PageIntro() {
  const { pathname } = useLocation();
  const page = navigation.find(item => item.path === '/' ? pathname === '/' : pathname.startsWith(item.path));
  return <section className="page-intro"><p className="text-xs font-semibold uppercase tracking-[.16em] text-accent mb-2">AG Rose / Business workspace</p><h1>{pathname.startsWith('/bakery/days/') ? 'Bakery day details' : page?.label || 'Page not found'}</h1><p>{descriptions[page?.path] || 'Use the navigation to return to your workspace.'}</p></section>;
}
