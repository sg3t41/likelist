import FloatingMenuButton from "@/components/FloatingMenuButton";
import BreadcrumbWrapper from "@/components/BreadcrumbWrapper";
import { Metadata } from "next";

// 静的生成を強制

export const metadata: Metadata = {
  title: "免責事項 | すきなものリスト",
  description: "すきなものリストの免責事項について説明しています。",
  openGraph: {
    title: "免責事項 | すきなものリスト",
    description: "すきなものリストの免責事項について説明しています。",
  },
};

export default function DisclaimerPage() {
  return (
    <>
      <FloatingMenuButton />
      <BreadcrumbWrapper />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            免責事項
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">当サイトの情報について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトに掲載されている情報については、可能な限り正確な情報を掲載するよう努めておりますが、
                誤情報が入り込んだり、情報が古くなったりすることもあります。
                必ずしも正確性を保証するものではありません。
                また合法性や安全性なども保証いたしません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">損害等の責任について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますので、ご了承ください。
                また当サイトからリンクやバナーなどによって他のサイトに移動された場合、
                移動先サイトで提供される情報、サービス等について一切の責任も負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">当サイトの保守・運営について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトに掲載されている情報の変更、削除、追加、
                サイトの一時的な中断や運営の中止によって生じる損害等についても責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">個人の判断について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトをご利用いただく際には、上記のことをご理解いただいた上で、
                個人の責任において行ってくださいますようお願いいたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">商品・サービスについて</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトで紹介している商品やサービスについては、
                提供元の企業や販売店等が責任を負います。
                当サイトでは商品やサービスの品質、内容、正確性、安全性等について一切保証いたしません。
              </p>
              <p className="text-gray-700 leading-relaxed">
                商品の購入やサービスの利用に関して発生したトラブルについては、
                当サイトでは責任を負いかねますので、
                直接提供元にお問い合わせください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">アフィリエイトについて</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトでは、Amazon.co.jpアソシエイト、楽天アフィリエイト等の
                アフィリエイトプログラムを利用して商品を紹介しています。
                これらのプログラムにより、商品購入時に当サイトが収益を得る場合があります。
              </p>
              <p className="text-gray-700 leading-relaxed">
                商品の価格や在庫状況は変動することがあります。
                また、商品の詳細情報や最新の価格については、
                各販売サイトでご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">著作権・肖像権について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトで使用している画像・文章等は著作権法により保護されています。
                無断での使用・転載は禁止いたします。
                また、肖像権侵害にあたる画像については、
                該当する方からのご連絡をいただき次第、速やかに削除いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">外部リンクについて</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトには外部サイトへのリンクが含まれています。
                これらのリンク先サイトの内容については、
                当サイトでは責任を負いかねます。
                リンク先サイトをご利用の際は、
                各サイトの利用規約等をよくお読みの上、自己責任でご利用ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">免責事項の変更について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトでは、免責事項の内容を予告なく変更することがあります。
                変更後の免責事項については、当サイトに掲載した時点で効力を生じるものとします。
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