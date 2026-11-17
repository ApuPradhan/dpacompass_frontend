
export default function DashboardSection({
    title,
    subtitle,
    children,
    action,
}) {
    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold theme-text-primary">
                        {title}
                    </h2>
                    {
                        subtitle && (
                            <p className="text-sm theme-text-secondary mt-1">
                                {subtitle}
                            </p>
                        )
                    }
                </div>
                {action}
            </div>
            {children}
        </section>
    );

}
