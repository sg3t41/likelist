import { Suspense } from "react";
import Breadcrumb from "./Breadcrumb";

interface BreadcrumbWrapperProps {
  pageUser?: {
    name: string | null;
    username: string | null;
    id: string;
  };
  allCategories?: any[];
}

export default function BreadcrumbWrapper({ pageUser, allCategories }: BreadcrumbWrapperProps) {
  return (
    <Suspense fallback={
      <nav className="sticky top-0 z-30" aria-label="パンくずリスト">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="py-3 px-4 sm:px-6 lg:px-8">
              <div className="h-4">&nbsp;</div>
            </div>
          </div>
        </div>
      </nav>
    }>
      <Breadcrumb pageUser={pageUser} allCategories={allCategories} />
    </Suspense>
  );
}