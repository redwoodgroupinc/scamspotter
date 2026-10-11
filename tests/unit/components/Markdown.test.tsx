import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/content/Markdown";

describe("Markdown renderer", () => {
  it("adds ids to headings and keeps external links safe", () => {
    const { container } = render(
      <Markdown>
        {"## What to do next\n\nSee [the FTC](https://reportfraud.ftc.gov/) or [our guide](/guides)."}
      </Markdown>,
    );
    expect(container.querySelector("h2")?.id).toBe("what-to-do-next");
    const external = container.querySelector('a[href="https://reportfraud.ftc.gov/"]');
    expect(external?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(container.querySelector('a[href="/guides"]')).not.toBeNull();
  });

  it("does not render raw HTML", () => {
    const { container } = render(
      <Markdown>{'Hello <script>alert(1)</script><img src=x onerror="alert(2)">'}</Markdown>,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });
});
