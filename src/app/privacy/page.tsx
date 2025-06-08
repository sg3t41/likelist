import FloatingMenuButton from "@/components/FloatingMenuButton";
import BreadcrumbWrapper from "@/components/BreadcrumbWrapper";
import { Metadata } from "next";

// 静的生成を強制
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: "プライバシーポリシー | すきなものリスト",
  description: "すきなものリストの個人情報保護方針について説明しています。",
  openGraph: {
    title: "プライバシーポリシー | すきなものリスト",
    description: "すきなものリストの個人情報保護方針について説明しています。",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <FloatingMenuButton />
      <BreadcrumbWrapper />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            プライバシーポリシー
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">個人情報の利用目的</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトでは、お問い合わせやサービス提供のために個人情報を収集する場合があります。
                収集した個人情報は、以下の目的で利用いたします：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>お問い合わせへの回答</li>
                <li>サービスの提供・運営</li>
                <li>サービスの改善・向上</li>
                <li>重要なお知らせの配信</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">個人情報の第三者提供</h2>
              <p className="text-gray-700 leading-relaxed">
                法令に基づく場合を除き、ご本人様の同意なく個人情報を第三者に提供することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cookieについて</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトでは、より良いサービス提供のためにCookieを使用しています。
                Cookieの使用により、お客様のプライバシーが侵害されることはありません。
                Cookieの無効化をご希望の場合は、ブラウザの設定で無効にすることができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">認証・セッション管理について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトでは、ログイン状態を維持するためにCookieを使用しています。
                これらのCookieは認証とセッション管理のみに使用され、
                お客様のプライバシーが侵害されることはありません。
                ログアウト時またはCookieの有効期限が切れた際に自動的に削除されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">アフィリエイトプログラムについて</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトは、Amazon.co.jpアソシエイト、楽天アフィリエイト等のアフィリエイトプログラムに参加しています。
                これらのプログラムにより、商品購入時に当サイトが収益を得る場合があります。
              </p>
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Amazonアソシエイトについて</h3>
              <p className="text-gray-700 leading-relaxed">
                当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、
                Amazonアソシエイト・プログラムの参加者です。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">お問い合わせ</h2>
              <p className="text-gray-700 leading-relaxed">
                本プライバシーポリシーに関するお問い合わせは、お問い合わせページよりご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">プライバシーポリシーの変更</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、
                本プライバシーポリシーの内容を適宜見直し、その改善に努めます。
                修正された最新のプライバシーポリシーは常に本ページにて開示いたします。
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-gray-600 text-center">
                制定日：{new Date().getFullYear()}年{new Date().getMonth() + 1}月{new Date().getDate()}日
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}