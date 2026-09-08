import type { AnchorHTMLAttributes, ReactNode } from "react";

type FullDocumentLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export default function FullDocumentLink({ href, children, ...props }: FullDocumentLinkProps) {
  return <a {...props} data-sqc-navigation="document" href={href}>{children}</a>;
}
