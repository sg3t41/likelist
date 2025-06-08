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
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="py-4 px-8 sm:px-10">
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