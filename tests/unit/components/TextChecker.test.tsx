import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TextChecker } from "@/components/checker/TextChecker";
import { MAX_TEXT_LENGTH, TEXT_EXAMPLES } from "@/lib/detection";

function renderChecker(props: Partial<Parameters<typeof TextChecker>[0]> = {}) {
  return render(
    <TextChecker
      kind="message"
      inputLabel="Paste the suspicious message"
      inputHint="Any message"
      placeholder="Paste here"
      examples={TEXT_EXAMPLES.message}
      {...props}
    />,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TextChecker", () => {
  it("renders an accessible form with a privacy reminder", () => {
    renderChecker();
    const textarea = screen.getByLabelText("Paste the suspicious message");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("aria-describedby")).toMatch(/privacy/);
    expect(screen.getByText(/remove passwords, verification codes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Check for Warning Signs/ })).toBeEnabled();
  });

  it("shows an error for empty input and keeps focus on the field", async () => {
    const user = userEvent.setup();
    renderChecker();
    await user.click(screen.getByRole("button", { name: /Check for Warning Signs/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/paste the message/i);
    expect(screen.getByLabelText("Paste the suspicious message")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Paste the suspicious message")).toHaveFocus();
  });

  it("explains when input is too long", () => {
    renderChecker();
    const textarea = screen.getByLabelText("Paste the suspicious message");
    fireEvent.change(textarea, { target: { value: "a".repeat(MAX_TEXT_LENGTH + 5) } });
    expect(screen.getByText(/\(too long\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Check for Warning Signs/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/limit is 10,000/);
  });

  it("analyses a message and announces the result", async () => {
    const user = userEvent.setup();
    renderChecker();
    await user.type(
      screen.getByLabelText("Paste the suspicious message"),
      "URGENT: your account is locked. Send me the verification code now",
    );
    await user.click(screen.getByRole("button", { name: /Check for Warning Signs/ }));
    const results = screen.getByTestId("checker-results");
    expect(within(results).getByText(/Warning signs found/)).toBeInTheDocument();
    expect(within(results).getByText("Asks you to share a verification code")).toBeInTheDocument();
    expect(within(results).getByText(/Recommended next steps/)).toBeInTheDocument();
    expect(within(results).getByText(/not a trained AI model/)).toBeInTheDocument();
    const status = screen.getAllByRole("status").find((node) => node.textContent?.includes("Check complete"));
    expect(status).toBeDefined();
  });

  it("renders user content as text, never as HTML", async () => {
    renderChecker();
    const payload =
      '<script>window.__xss=2</script><img src=x onerror="window.__xss=1"><b onmouseover="window.__xss=3">send me your password</b>';
    fireEvent.change(screen.getByLabelText("Paste the suspicious message"), { target: { value: payload } });
    fireEvent.click(screen.getByRole("button", { name: /Check for Warning Signs/ }));
    const results = screen.getByTestId("checker-results");
    expect(results.querySelector("img")).toBeNull();
    expect(results.querySelector("script")).toBeNull();
    expect(results.querySelector("[onmouseover]")).toBeNull();
    expect(results.textContent).toContain('window.__xss=3">send me your password</b>');
    expect((window as unknown as { __xss?: number }).__xss).toBeUndefined();
  });

  it("never turns links from the message into clickable anchors", () => {
    renderChecker();
    fireEvent.change(screen.getByLabelText("Paste the suspicious message"), {
      target: { value: "Pay here https://royalmail-redelivery.example/pay javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check for Warning Signs/ }));
    const results = screen.getByTestId("checker-results");
    const anchors = Array.from(results.querySelectorAll("a")).map((anchor) => anchor.getAttribute("href"));
    expect(anchors.every((href) => href?.startsWith("/"))).toBe(true);
    expect(within(results).getByText(/Links found \(1\)/)).toBeInTheDocument();
  });

  it("runs an example and labels suspicious and legitimate examples", async () => {
    const user = userEvent.setup();
    renderChecker();
    expect(screen.getAllByText("Suspicious").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Legitimate").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /Genuine-style verification code/ }));
    expect(screen.getByLabelText("Paste the suspicious message")).toHaveValue(TEXT_EXAMPLES.message[4]!.text);
    expect(screen.getByText("Low: no common warning signs found")).toBeInTheDocument();
    expect(screen.getByText(/does NOT mean it's safe/)).toBeInTheDocument();
  });

  it("clears the input and results", async () => {
    const user = userEvent.setup();
    renderChecker();
    await user.click(screen.getByRole("button", { name: /Parcel 'unpaid fee' text/ }));
    expect(screen.getByTestId("checker-results")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByTestId("checker-results")).toBeNull();
    expect(screen.getByLabelText("Paste the suspicious message")).toHaveValue("");
    expect(screen.getByLabelText("Paste the suspicious message")).toHaveFocus();
  });

  it("copies a plain-text report to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderChecker();
    await user.click(screen.getByRole("button", { name: /Parcel 'unpaid fee' text/ }));
    await user.click(screen.getByRole("button", { name: /Copy results/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0]![0]).toContain("Warning-sign level: High");
    expect(screen.getByText("Results copied to your clipboard.")).toBeInTheDocument();
  });

  it("explains when copying isn't possible", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    renderChecker();
    await user.click(screen.getByRole("button", { name: /Parcel 'unpaid fee' text/ }));
    await user.click(screen.getByRole("button", { name: /Copy results/ }));
    expect(await screen.findByText(/Couldn't copy automatically/)).toBeInTheDocument();
  });

  it("includes an optional sender field for the email checker", async () => {
    const user = userEvent.setup();
    renderChecker({
      kind: "email",
      examples: TEXT_EXAMPLES.email,
      showSender: true,
      inputLabel: "Paste the email text",
    });
    await user.type(screen.getByLabelText("Paste the email text"), "Please review the attached invoice.");
    await user.type(screen.getByLabelText(/Sender address/), "billing@micros0ft-billing.example");
    await user.click(screen.getByRole("button", { name: /Check for Warning Signs/ }));
    expect(screen.getByRole("heading", { name: "Sender address" })).toBeInTheDocument();
    expect(screen.getAllByText(/Domain imitates Microsoft/).length).toBeGreaterThan(0);
  });
});
