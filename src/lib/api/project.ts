// src/lib/api/project.ts
import type { ProjectInfo } from "@/src/types/projectinfo";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/src/lib/api/request";

type ProjectsResponse = {
    projects: ProjectInfo[];
};
type ProjectResponse = {
    project: ProjectInfo & { created_at?: string };
};
type DeleteProjectResponse = {
    deleted: boolean;
    project_id: string;
};


// 1）获取当前用户项目列表 GET /api/projects
export async function getProjects(): Promise<ProjectInfo[]> {
    const data = await apiGet<ProjectsResponse>("/api/projects/");
    return data.projects;
}

// 2）创建项目 POST /api/projects
export async function createProject(
    title: string,
    currentUserId?: string
): Promise<ProjectInfo> {
    const suffix = currentUserId
        ? `?current_user=${encodeURIComponent(currentUserId)}`
        : "";
    const data = await apiPost<ProjectResponse>(`/api/projects/${suffix}`, { title });
    return {
        ...data.project,
        updated_at: data.project.updated_at ?? data.project.created_at ?? new Date().toISOString(),
        is_archived: data.project.is_archived ?? false,
    };
}

// 3）获取单个项目 GET /api/projects/{projectId}
export async function getProjectById(projectId: string): Promise<ProjectInfo> {
    const data = await apiGet<ProjectResponse>(`/api/projects/${projectId}`);
    return data.project;
}

// 4）更新项目 PATCH /api/projects/{projectId}
export async function updateProject(
    projectId: string,
    payload: {
        title?: string;
        current_stage?: ProjectInfo["current_stage"];
        is_archived?: "Y" | "N";
    }
): Promise<ProjectInfo> {
    const data = await apiPatch<ProjectResponse>(
        `/api/projects/${projectId}`,
        payload
    );
    return data.project;
}

// 5）删除项目 DELETE /api/projects/{projectId}
export async function deleteProject(projectId: string): Promise<DeleteProjectResponse> {
    const data = await apiDelete<DeleteProjectResponse>(`/api/projects/${projectId}`);
    return data;
}
