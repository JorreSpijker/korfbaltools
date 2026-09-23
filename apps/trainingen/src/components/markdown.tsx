import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// De oefeningtekst uit content/oefeningen/*.md. Geen typography-plugin in dit
// project, dus de paar elementen die in oefeningen voorkomen krijgen hier hun
// stijl uit het design mee.
export function Markdown({ children, klein = false }: { children: string; klein?: boolean }) {
  const tekst = klein ? "text-[15px] leading-[1.5]" : "text-base leading-[1.55]";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className={`m-0 ${tekst}`}>{children}</p>,
        h3: ({ children }) => <h3 className="m-0 mt-1 text-base font-extrabold">{children}</h3>,
        h4: ({ children }) => <h4 className="m-0 mt-1 text-[15px] font-extrabold">{children}</h4>,
        ul: ({ children }) => <ul className={`m-0 flex list-disc flex-col gap-1 pl-5 ${tekst}`}>{children}</ul>,
        ol: ({ children }) => <ol className={`m-0 flex list-decimal flex-col gap-1 pl-5 ${tekst}`}>{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        a: ({ children, href }) => (
          <a href={href} className="text-accent underline underline-offset-2">
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
