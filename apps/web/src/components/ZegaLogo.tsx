"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";

interface ZegaLogoProps {
  variant?: "full" | "icon";
  className?: string;
  height?: number;
}

export function ZegaLogo({ variant = "full", className = "", height = 36 }: ZegaLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Light theme icon */}
        <img
          src="/branding/zegamail-icon-light-transparent.png"
          alt="Zega Mail"
          className={`h-9 w-auto object-contain dark:hidden transition-transform`}
        />
        {/* Dark theme icon */}
        <img
          src="/branding/zegamail-icon-dark-transparent.png"
          alt="Zega Mail"
          className={`h-9 w-auto object-contain hidden dark:block transition-transform`}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Light Theme Full Logo */}
      <img
        src="/branding/zegamail-light-transparent.png"
        alt="Zega Mail — A Product of ZegaCloud"
        className="h-10 sm:h-11 w-auto object-contain dark:hidden"
      />
      {/* Dark Theme Full Logo */}
      <img
        src="/branding/zegamail-dark-transparent.png"
        alt="Zega Mail — A Product of ZegaCloud"
        className="h-10 sm:h-11 w-auto object-contain hidden dark:block"
      />
    </div>
  );
}
