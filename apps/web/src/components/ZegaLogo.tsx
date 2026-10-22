"use client";

import React from "react";

interface ZegaLogoProps {
  variant?: "full" | "icon";
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export function ZegaLogo({
  variant = "full",
  className = "",
  imgClassName = "",
  alt = "ZegaMail Business Email",
}: ZegaLogoProps) {
  if (variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        {/* Light theme icon */}
        <img
          src="/branding/zegamail-icon-light-transparent.png"
          alt={alt}
          className={`h-8 sm:h-9 w-auto object-contain dark:hidden transition-transform select-none ${imgClassName}`}
          loading="eager"
        />
        {/* Dark theme icon */}
        <img
          src="/branding/zegamail-icon-dark-transparent.png"
          alt={alt}
          className={`h-8 sm:h-9 w-auto object-contain hidden dark:block transition-transform select-none ${imgClassName}`}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`}>
      {/* Light Theme Full Logo */}
      <img
        src="/branding/zegamail-light-transparent.png"
        alt={alt}
        className={`h-8 sm:h-9.5 md:h-10 w-auto object-contain dark:hidden select-none ${imgClassName}`}
        loading="eager"
      />
      {/* Dark Theme Full Logo */}
      <img
        src="/branding/zegamail-dark-transparent.png"
        alt={alt}
        className={`h-8 sm:h-9.5 md:h-10 w-auto object-contain hidden dark:block select-none ${imgClassName}`}
        loading="eager"
      />
    </div>
  );
}
