import { Droplets, Fan, Laptop, Lightbulb, Plug, Snowflake, Tv, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  cooling: Snowflake,
  kitchen: Waves,
  laundry: Fan,
  entertainment: Tv,
  bath: Droplets,
  work: Laptop,
  lighting: Lightbulb,
  default: Plug,
};

const TONES = {
  cooling: 'bg-[#4FA3D1]/12 text-[#2A7DA9] dark:text-[#7CC3E8]',
  kitchen: 'bg-[#27AE83]/12 text-[#1c8f6b] dark:text-[#4ED0A6]',
  laundry: 'bg-[#8F7BE8]/12 text-[#6A54C9] dark:text-[#B0A2F5]',
  entertainment: 'bg-[#F08A5D]/14 text-[#C4592C] dark:text-[#F09A72]',
  bath: 'bg-[#4FA3D1]/12 text-[#2A7DA9] dark:text-[#7CC3E8]',
  work: 'bg-[#B7F34A]/24 text-[#5c7f10] dark:text-[#B7F34A]',
  default: 'bg-muted text-muted-foreground',
};

export default function ApplianceIcon({ icon = 'default', className = '', size = 'md' }) {
  const Icon = ICONS[icon] || ICONS.default;
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl',
        size === 'md' ? 'h-11 w-11' : 'h-9 w-9',
        TONES[icon] || TONES.default,
        className
      )}
    >
      <Icon className={size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={1.9} />
    </span>
  );
}