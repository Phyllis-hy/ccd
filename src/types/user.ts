import type { UUID, UserRole } from "@/src/types/common";
export interface CurrentUser {
    id: UUID;       
    email: string;   
    role: UserRole;  
    created_at: string;
}
