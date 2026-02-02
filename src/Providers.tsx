// src/Providers.tsx
"use client";

import React from "react";
import { ProjectsProvider } from "@/src/context/ProjectsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ProjectsProvider>{children}</ProjectsProvider>;
}
