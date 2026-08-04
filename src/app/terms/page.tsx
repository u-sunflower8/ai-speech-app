export const metadata = { title: "利用規約 | 話し方診断AI" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">利用規約</h1>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold text-neutral-900">サービス内容</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          本サービスは、ユーザーが録音またはアップロードした音声をAIが分析し、話し方に関するフィードバックを提供するものです。
          診断結果は話し方改善の参考情報であり、内容の正確性・完全性を保証するものではありません。
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-semibold text-neutral-900">禁止事項</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          第三者の音声を無断でアップロードする行為、本サービスの運営を妨げる行為、法令に違反する行為を禁止します。
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-semibold text-neutral-900">アカウントの管理</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          ユーザーは自身のアカウント情報を適切に管理する責任を負います。
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-semibold text-neutral-900">免責事項</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          本サービスの利用により生じた損害について、運営者は故意または重過失がある場合を除き責任を負いません。
        </p>
      </section>
    </main>
  );
}
