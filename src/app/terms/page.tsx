import Header from "@/components/Header";

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            利用規約
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第1条（適用）</h2>
              <p className="text-gray-700 leading-relaxed">
                この利用規約（以下「本規約」）は、当サイト（以下「当サービス」）の利用条件を定めるものです。
                登録ユーザーの皆様（以下「ユーザー」）には、本規約に従って、本サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第2条（利用登録）</h2>
              <p className="text-gray-700 leading-relaxed">
                本サービスにおいては、登録希望者が本規約に同意の上、運営者の定める方法によって利用登録を申請し、
                運営者がこれを承認することによって、利用登録が完了するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
              <p className="text-gray-700 leading-relaxed">
                ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
                ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、
                もしくは第三者と共用することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第4条（禁止事項）</h2>
              <p className="text-gray-700 leading-relaxed">
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>他のユーザー、第三者、または運営者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>運営者のサービスの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他のユーザーになりすます行為</li>
                <li>運営者のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第5条（本サービスの提供の停止等）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
                本サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第6条（著作権）</h2>
              <p className="text-gray-700 leading-relaxed">
                ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、
                画像や映像等の情報に関してのみ、本サービスを利用し、投稿ないしアップロードすることができるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第7条（利用制限および登録抹消）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、
                投稿データを削除し、ユーザーに対して本サービスの全部もしくは一部の利用を制限し、
                またはユーザーとしての登録を抹消することができるものとします。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>運営者からの連絡に対し、一定期間返答がない場合</li>
                <li>本サービスについて、最後の利用から一定期間利用がない場合</li>
                <li>その他、運営者が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第8条（免責事項）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、
                特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）
                がないことを明示的にも黙示的にも保証しておりません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第9条（サービス内容の変更等）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、
                ユーザーはこれを承諾するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第10条（利用規約の変更）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>本規約の変更がユーザーの一般の利益に適合するとき</li>
                <li>本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第11条（準拠法・裁判管轄）</h2>
              <p className="text-gray-700 leading-relaxed">
                本規約の解釈にあたっては、日本法を準拠法とします。
                本サービスに関して紛争が生じた場合には、運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。
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