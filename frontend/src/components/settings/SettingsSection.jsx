export default function SettingsSection({ id, icon: Icon, title, description, children, footer = null }) {
  return (
    <section id={id} className="card-surface animate-rise overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-[15px] font-bold">{title}</h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-5 py-3.5 sm:px-6">
          {footer}
        </div>
      )}
    </section>
  );
}