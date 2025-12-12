/**
 * Markdown Renderer Component
 * Renders Markdown content with syntax highlighting and custom components
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { AlertCircle, Info, Lightbulb, CheckCircle2 } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium mt-3 mb-2 text-foreground">
              {children}
            </h4>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-foreground/90 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          // Code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto mb-4 border border-border">
              {children}
            </pre>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:underline"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          // Blockquotes (for callouts)
          blockquote: ({ children }) => {
            const content = String(children);
            const isWarning = content.includes("⚠️") || content.includes("WARNING");
            const isInfo = content.includes("ℹ️") || content.includes("INFO");
            const isTip = content.includes("💡") || content.includes("TIP");
            const isSuccess = content.includes("✅") || content.includes("SUCCESS");
            
            let icon = Info;
            let bgColor = "bg-blue-500/10";
            let borderColor = "border-blue-500/30";
            let textColor = "text-blue-400";
            
            if (isWarning) {
              icon = AlertCircle;
              bgColor = "bg-yellow-500/10";
              borderColor = "border-yellow-500/30";
              textColor = "text-yellow-400";
            } else if (isTip) {
              icon = Lightbulb;
              bgColor = "bg-purple-500/10";
              borderColor = "border-purple-500/30";
              textColor = "text-purple-400";
            } else if (isSuccess) {
              icon = CheckCircle2;
              bgColor = "bg-green-500/10";
              borderColor = "border-green-500/30";
              textColor = "text-green-400";
            }
            
            return (
              <blockquote className={cn(
                "border-l-4 rounded-r-lg p-4 my-4",
                bgColor,
                borderColor
              )}>
                <div className="flex items-start gap-3">
                  <icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", textColor)} />
                  <div className="text-foreground/90">{children}</div>
                </div>
              </blockquote>
            );
          },
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-foreground/90">{children}</td>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-8 border-border" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

