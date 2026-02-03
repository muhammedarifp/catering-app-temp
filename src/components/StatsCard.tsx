import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: 'default' | 'highlight' | 'warning';
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {

  const variants = {
    default: 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow',
    highlight: 'bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/10',
    warning: 'bg-amber-50 border-amber-200 hover:border-amber-300',
  };

  const iconVariants = {
    default: 'bg-zinc-50 text-zinc-600',
    highlight: 'bg-zinc-800 text-zinc-100',
    warning: 'bg-amber-100/50 text-amber-700',
  };

  const textVariants = {
    default: {
      title: 'text-zinc-500',
      value: 'text-zinc-900',
      subtitle: 'text-zinc-400',
    },
    highlight: {
      title: 'text-zinc-400',
      value: 'text-white',
      subtitle: 'text-zinc-400',
    },
    warning: {
      title: 'text-amber-700',
      value: 'text-amber-900',
      subtitle: 'text-amber-600',
    },
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 
      ${variants[variant]}
    `}>
      <div className="relative z-10 flex flex-col justify-between h-full gap-4">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-xl ${iconVariants[variant]}`}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          {trend && (
            <div className={`
               flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
               ${trend.positive
                ? (variant === 'highlight' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                : (variant === 'highlight' ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600')
              }
             `}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className={`text-sm font-medium ${textVariants[variant].title}`}>
            {title}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${textVariants[variant].value}`}>
              {value}
            </span>
          </div>
          {subtitle && (
            <p className={`text-xs mt-1 ${textVariants[variant].subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Decorative Background Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
        <Icon className={`w-32 h-32 ${variant === 'highlight' ? 'text-white' : 'text-black'}`} />
      </div>
    </div>
  );
}
