import { render, screen } from "@testing-library/react";
import LoginPage from "../../app/(marketing)/login/page";

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(""),
}));

describe("Login page", () => {
  it("renders login form", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /log in/i })
    ).toBeInTheDocument();
  });
});
