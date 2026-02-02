"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ProjectInfo } from "@/src/types/projectinfo";
import { createProject, getProjects } from "@/src/lib/api/project";

type ProjectsContextValue = {
    projects: ProjectInfo[];
    setProjects: React.Dispatch<React.SetStateAction<ProjectInfo[]>>;
    currentProjectId: string;
    setCurrentProjectId: React.Dispatch<React.SetStateAction<string>>;
    current_user: string;
    addProject: (title: string) => Promise<ProjectInfo>;
};

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string>("");
    const current_user = 'efbb5c23-0bac-4210-b7be-360b5e9c907d'
    useEffect(() => {
        getProjects().then((list) => {
            setProjects(list);

            // Optional: select first project by default (better UX)
            if (list.length > 0 && !currentProjectId) {
                setCurrentProjectId(list[0].id);
            }
        });
    }, []);

    const addProject = async (title: string) => {
        const project = await createProject(title);
        setProjects((prev) => [project, ...prev]);
        if (!currentProjectId) {
            setCurrentProjectId(String(project.id));
        }
        return project;
    };

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                setProjects,
                currentProjectId,
                setCurrentProjectId,
                current_user,
                addProject,
            }}

        >
            {children}
        </ProjectsContext.Provider>
    );
}


export function useProjects() {
    const ctx = useContext(ProjectsContext);
    if (!ctx) {
        throw new Error("useProjects must be used within ProjectsProvider");
    }
    return ctx;
}



