import { render, screen } from "@testing-library/react";
import Page from "../../app/(marketing)/page";

describe("Home page", () => {
  it("renders marketing content", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { name: /IdeaSense\.AI/i })
    ).toBeInTheDocument();
  });
});
