import { Stage,UUID } from '@/src/types/common';

export interface ProjectInfo {
    id: UUID;
    title: string;
    current_stage: Stage;
    ready_to_gen_sum?: "Y" | "N";
    updated_at: string;
    is_archived?: boolean;
}
