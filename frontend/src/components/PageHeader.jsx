export default function PageHeader({ eyebrow, title, description, actions = null, children = null }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1c8f6b] dark:text-[#4ED0A6]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-heading text-2xl font-extrabold text-foreground sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}