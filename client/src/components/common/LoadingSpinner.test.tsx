import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders correctly", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.querySelector(".custom-class");
    expect(spinner).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { container: small } = render(<LoadingSpinner size="sm" />);
    const { container: medium } = render(<LoadingSpinner size="md" />);
    const { container: large } = render(<LoadingSpinner size="lg" />);

    expect(small.firstChild).toBeInTheDocument();
    expect(medium.firstChild).toBeInTheDocument();
    expect(large.firstChild).toBeInTheDocument();
  });
});

