import { render, screen } from "@testing-library/react";
import StagePage from "../../src/components/StagePage";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}));

jest.mock("@/src/context/ProjectsContext", () => ({
  useProjects: () => ({
    projects: [],
    setProjects: jest.fn(),
    currentProjectId: "",
    setCurrentProjectId: jest.fn(),
    current_user: "test-user",
    addProject: jest.fn(),
  }),
}));

describe("Stage page", () => {
  it("renders empty state when no project is selected", () => {
    render(<StagePage />);
    expect(screen.getByText(/select a project/i)).toBeInTheDocument();
  });
});
