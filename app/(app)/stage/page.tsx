// app/stage/page.tsx
import { Suspense } from "react";
import StagePage from "@/src/components/StagePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StagePage />
    </Suspense>
  );
}
