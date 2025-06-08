import FloatingMenuButton from "@/components/FloatingMenuButton";
import BreadcrumbWrapper from "@/components/BreadcrumbWrapper";
import MainTitle from "@/components/MainTitle";
import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | すきなものリスト",
  description: "すきなものリストに関するご質問やご要望がございましたら、お気軽にお問い合わせください。",
  openGraph: {
    title: "お問い合わせ | すきなものリスト",
    description: "すきなものリストに関するご質問やご要望がございましたら、お気軽にお問い合わせください。",
  },
};

export default function ContactPage() {
  return (
    <>
      <FloatingMenuButton />
      <MainTitle />
      <BreadcrumbWrapper />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <ContactForm />
        </div>
      </div>
    </>
  );
}