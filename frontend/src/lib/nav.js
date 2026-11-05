import {
  LayoutDashboard,
  Plug,
  History,
  Lightbulb,
  FlaskConical,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Overview', path: '/overview', icon: LayoutDashboard, hint: 'Your energy at a glance' },
  { label: 'Appliances', path: '/appliances', icon: Plug, hint: 'Loads and schedules' },
  { label: 'History', path: '/history', icon: History, hint: 'Bills and consumption' },
  { label: 'Insights', path: '/insights', icon: Lightbulb, hint: 'Ways to save' },
  { label: 'Scenarios', path: '/scenarios', icon: FlaskConical, hint: 'What-if planning' },
  { label: 'Settings', path: '/settings', icon: Settings, hint: 'Household and billing' },
];