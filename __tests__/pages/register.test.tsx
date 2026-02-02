import { render, screen } from "@testing-library/react";
import RegisterPage from "../../app/(marketing)/register/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(""),
}));

describe("Register page", () => {
  it("renders registration form", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });
});
