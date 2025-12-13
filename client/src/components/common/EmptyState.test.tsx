import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { EmptyState } from "./EmptyState";
import { Search } from "lucide-react";

describe("EmptyState", () => {
  it("renders with title and description", () => {
    render(
      <EmptyState
        title="No items found"
        description="Try searching for something else"
      />,
    );
    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(
      screen.getByText("Try searching for something else"),
    ).toBeInTheDocument();
  });

  it("renders with icon", () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        description="Description"
        icon={Search}
      />,
    );
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="Empty"
        description="Description"
        action={<button>Create</button>}
      />,
    );
    expect(screen.getByText("Create")).toBeInTheDocument();
  });
});

