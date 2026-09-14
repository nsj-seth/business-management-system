import { LayoutDashboard, ShoppingBag, PiggyBank, Package } from 'lucide-react';

// Adding a future module = adding one object here. Nothing else
// in the layout needs to change.
export const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Bakery', path: '/bakery', icon: ShoppingBag },
  { label: 'Reserves', path: '/reserves', icon: PiggyBank },
  { label: 'Cement', path: '/cement', icon: Package },
];