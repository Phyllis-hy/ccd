import { render, screen } from "@testing-library/react";
import ProfilePage from "../../src/components/Profile/ProfilePage";

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "test@example.com" },
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
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

describe("Profile page", () => {
  it("renders project section", () => {
    render(<ProfilePage />);
    expect(
      screen.getByRole("heading", { name: "Projects" })
    ).toBeInTheDocument();
  });
});
