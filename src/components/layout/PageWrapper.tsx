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
        <div className="min-w-0">
          <h1 className="break-words text-3xl text-foreground sm:text-4xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="flex w-full sm:w-auto sm:shrink-0 [&>*]:w-full sm:[&>*]:w-auto">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
