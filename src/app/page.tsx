import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  { title: "話すスピード", desc: "1分あたりの文字数から、話す速さの傾向がわかります。" },
  { title: "間の取り方", desc: "無音の回数や長さから、間の取り方の癖がわかります。" },
  { title: "口癖", desc: "「えー」「あのー」などの口癖の回数がわかります。" },
  { title: "話の構成・わかりやすさ", desc: "AIが結論・理由・具体例の有無や伝わりやすさを評価します。" },
];

export default function TopPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          話すだけで、自分の話し方がわかる。
        </h1>
        <p className="mt-4 text-balance text-neutral-600">
          音声を録音すると、AIが話すスピード、間、口癖、話の構成を分析。
          <br className="hidden sm:block" />
          24時間いつでも、自分の話し方を客観的に診断できます。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            無料で診断する
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            ログイン
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="mb-6 text-center text-lg font-semibold text-neutral-900">
          診断できる項目
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-neutral-200">
              <CardContent>
                <h3 className="font-medium text-neutral-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-4xl justify-center gap-6 px-6 pb-10 text-sm text-neutral-500">
        <Link href="/terms" className="hover:underline">
          利用規約
        </Link>
        <Link href="/privacy" className="hover:underline">
          プライバシーポリシー
        </Link>
      </footer>
    </main>
  );
}
