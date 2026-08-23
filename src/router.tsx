import React, { useEffect, useState } from "react";

export interface Route {
  path: string;
  parts: string[];
  query: URLSearchParams;
}

export function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return {
    path,
    parts: path.split("/").filter(Boolean),
    query: new URLSearchParams(queryPart || ""),
  };
}

export function navigate(to: string): void {
  window.location.hash = to.startsWith("#") ? to.slice(1) : to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function useScrollToTop(dep: string): void {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [dep]);
}
