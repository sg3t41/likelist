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
    <Suspense fallback={null}>
      <Breadcrumb pageUser={pageUser} allCategories={allCategories} />
    </Suspense>
  );
}