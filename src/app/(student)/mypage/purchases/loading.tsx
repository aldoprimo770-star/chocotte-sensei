import { ListPageLoading } from "@/components/common/page-loading";

export default function PurchasesLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <ListPageLoading rows={5} />
    </div>
  );
}
