import LoadingSpinner from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <LoadingSpinner className="h-12 w-12 text-white" />
    </div>
  );
}
