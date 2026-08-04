export const metadata = { title: "プライバシーポリシー | 話し方診断AI" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">プライバシーポリシー</h1>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold text-neutral-900">音声データの取り扱い</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          お預かりした音声データは、話し方診断（文字起こし・音声分析・AIによる評価）の目的にのみ利用します。
          診断以外の目的で無断利用することはありません。音声データをAIの学習に利用する場合は、別途ご本人の同意を取得します。
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-semibold text-neutral-900">保存期間と削除</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          音声データおよび診断結果は、ユーザーご自身が削除するまで保存されます。ユーザーはいつでもご自身の音声データと診断履歴を削除できます。
          削除されたデータは復元できません。
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-semibold text-neutral-900">利用する外部サービス</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          本サービスは、データベース・認証・音声ストレージにSupabaseを、音声の文字起こしおよびAI診断にVercel
          AI Gatewayを経由した外部のAIプロバイダーを利用します。これらの外部サービスに対しては、診断処理に必要な範囲でのみデータを送信します。
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-semibold text-neutral-900">第三者への公開</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          初期状態では、診断結果や音声データを第三者へ公開することはありません。
        </p>
      </section>
    </main>
  );
}
