import type { ReactNode } from "react";

type PageWrapperProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function PageWrapper({ title, description, action, children }: PageWrapperProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl text-foreground">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
