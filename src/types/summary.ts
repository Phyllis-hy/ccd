// src/types/summary.ts
import type { Stage } from "@/src/types/common";
import { UUID } from "crypto";

export interface SummaryItem {
    id: UUID;
    projectId: UUID;
    stage: Stage;
    summaryText: string;    created_at: string; // ???? created_at
}

export interface StageSummary {
    summary: SummaryItem[];
}

