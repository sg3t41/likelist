"use client";

import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex ${className}`} aria-label="パンくずリスト">
      <ol role="list" className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="flex-shrink-0 w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              <span
                className={
                  item.current
                    ? "font-medium text-gray-900 truncate max-w-xs"
                    : "text-gray-500 truncate max-w-xs"
                }
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}