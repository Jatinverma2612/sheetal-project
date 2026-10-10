"use client";

import { useEffect, useRef, useState } from "react";

type DeferredSectionProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  idleTimeout?: number;
};

const DeferredSection = ({
  children,
  fallback = null,
  rootMargin = "300px 0px",
  idleTimeout = 1500,
}: DeferredSectionProps) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) return;

    let cancelled = false;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const mount = () => {
      if (!cancelled) {
        setShouldMount(true);
      }
    };

    const element = anchorRef.current;
    if (!element) {
      mount();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          mount();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(mount, {
        timeout: idleTimeout,
      });
    } else {
      timeoutId = setTimeout(mount, idleTimeout);
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [idleTimeout, rootMargin, shouldMount]);

  return <div ref={anchorRef}>{shouldMount ? children : fallback}</div>;
};

export default DeferredSection;
