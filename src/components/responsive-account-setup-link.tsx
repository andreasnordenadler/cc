import Link from "next/link";
import type { ReactNode } from "react";

export default function ResponsiveAccountSetupLink({
  mobileHref,
  desktopHref,
  className,
  children,
}: {
  mobileHref: string;
  desktopHref?: string;
  className?: string;
  children: ReactNode;
}) {
  if (!desktopHref) {
    return <Link className={className} href={mobileHref}>{children}</Link>;
  }

  const sharedClassName = className ? `${className} sqc-responsive-account-link` : "sqc-responsive-account-link";

  return (
    <span className="sqc-responsive-account-link-group">
      <Link className={`${sharedClassName} mobile`} href={mobileHref}>{children}</Link>
      <Link className={`${sharedClassName} desktop`} href={desktopHref}>{children}</Link>
    </span>
  );
}
