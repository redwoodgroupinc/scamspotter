import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UrlChecker } from "@/components/checker/UrlChecker";
import { URL_EXAMPLES } from "@/lib/detection";

describe("UrlChecker", () => {
  it("checks an address without creating a link to it", async () => {
    const user = userEvent.setup();
    render(<UrlChecker examples={URL_EXAMPLES} />);
    await user.type(screen.getByLabelText("Web address to check"), "http://paypa1-login.top/verify");
    await user.click(screen.getByRole("button", { name: /Check This Address/ }));
    const results = screen.getByTestId("checker-results");
    expect(within(results).getByText("Looks like an imitation of PayPal")).toBeInTheDocument();
    expect(within(results).getByText(/does not visit links/)).toBeInTheDocument();
    const hrefs = Array.from(results.querySelectorAll("a")).map((anchor) => anchor.getAttribute("href"));
    expect(hrefs.some((href) => href?.includes("paypa1"))).toBe(false);
  });

  it("refuses javascript: URLs with an explanation", () => {
    render(<UrlChecker examples={[]} />);
    fireEvent.change(screen.getByLabelText("Web address to check"), {
      target: { value: "javascript:alert(document.cookie)" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check This Address/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/isn't a normal website address/);
    expect(screen.queryByTestId("checker-results")).toBeNull();
  });

  it("marks shortened links as having a hidden destination", async () => {
    const user = userEvent.setup();
    render(<UrlChecker examples={URL_EXAMPLES} />);
    await user.click(screen.getByRole("button", { name: /Shortened link/ }));
    expect(screen.getAllByText("Destination hidden").length).toBeGreaterThan(0);
  });

  it("explains that HTTPS doesn't prove legitimacy for a clean address", async () => {
    const user = userEvent.setup();
    render(<UrlChecker examples={URL_EXAMPLES} />);
    await user.click(screen.getByRole("button", { name: /Official government address/ }));
    expect(screen.getByText(/does NOT mean the site is legitimate/)).toBeInTheDocument();
  });
});
