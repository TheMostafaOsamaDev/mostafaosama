import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

const components: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-12 scroll-mt-8 text-[1.25rem] leading-7 font-semibold tracking-[-0.01em] text-balance"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="mt-8 scroll-mt-8 text-body font-semibold" {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="mt-5" {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const external = props.href?.startsWith("http");
    return <a className="link" {...props} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} />;
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-5 list-disc space-y-2 pl-5 marker:text-span" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 marker:text-muted" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="mt-5 border-l-2 border-hairline pl-4 text-muted" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded-[2px] bg-hairline/60 px-1 py-px font-mono text-[0.88em]" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mt-5 overflow-x-auto rounded-[2px] border border-hairline p-4 text-small [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  hr: () => <hr className="mt-10 border-hairline" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
