import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

/** 404 Not Found ページ */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
          <p
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-4xl"
            aria-hidden="true"
          >
            🍫
          </p>
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            ページが見つかりません
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            お探しのページは移動または削除された可能性があります。
            URLをご確認いただくか、トップページからお探しください。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/" variant="primary">
              トップページへ
            </Button>
            <Button href="/teachers" variant="outline">
              先生を探す
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted">
            <Link href="/contact" className="text-primary hover:underline">
              お問い合わせ
            </Link>
            からもご連絡いただけます。
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
