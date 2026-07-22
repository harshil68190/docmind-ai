import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * react-markdown v10's `code` component has no `inline` prop (removed in
 * earlier v9) -- the only reliable signal for "this is a fenced code
 * block, not inline code" is the presence of a `language-xxx` className,
 * which remark/rehype only attach to fenced blocks.
 */
export const markdownComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1 className={cn("mb-2 mt-4 text-lg font-semibold first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("mb-2 mt-4 text-base font-semibold first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mb-1 mt-3 text-sm font-semibold first:mt-0", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mb-2 leading-relaxed last:mb-0", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mb-2 ml-5 list-disc space-y-1 last:mb-0", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("mb-2 ml-5 list-decimal space-y-1 last:mb-0", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("leading-relaxed", className)} {...props} />,
  a: ({ className, ...props }) => (
    <a
      className={cn("text-primary underline underline-offset-2 hover:no-underline", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("mb-2 border-l-2 border-border pl-3 italic text-muted-foreground last:mb-0", className)}
      {...props}
    />
  ),
  code: ({ className, children, ...props }) => {
    const isFencedBlock = /language-/.test(className ?? "");
    if (!isFencedBlock) {
      return (
        <code
          className={cn("rounded bg-secondary px-1 py-0.5 text-[0.85em]", className)}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn("block font-mono text-xs", className)} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ className, ...props }) => (
    <pre
      className={cn("mb-2 overflow-x-auto rounded-md bg-secondary p-3 last:mb-0", className)}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th className={cn("border border-border bg-secondary/50 px-2 py-1 text-left font-medium", className)} {...props} />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("border border-border px-2 py-1", className)} {...props} />
  ),
};
