import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useSettingsStore } from "@features/settings/store";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().resetDefaults();
    useSettingsStore.getState().setLocale("en");
  });

  it("keeps edits in draft state until save is pressed", async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    const input = screen.getByLabelText(/api base url/i);
    await user.clear(input);
    await user.type(input, "http://localhost:8081");

    expect(useSettingsStore.getState().apiBaseUrl).toBe("http://localhost:8080");
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(useSettingsStore.getState().apiBaseUrl).toBe("http://localhost:8081");
    expect(screen.getByText(/saved/i)).toBeInTheDocument();
  });

  it("resets draft values without changing persisted settings", async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    const input = screen.getByLabelText(/api base url/i);
    await user.clear(input);
    await user.type(input, "http://localhost:8081");
    await user.click(screen.getByRole("button", { name: /^reset$/i }));

    expect(input).toHaveValue("http://localhost:8080");
    expect(useSettingsStore.getState().apiBaseUrl).toBe("http://localhost:8080");
  });

  it("explains that settings control frontend transport and not runtime target ports", () => {
    render(<SettingsPage />);

    expect(
      screen.getByText(/these values control where the frontend connects for rest and websocket/i)
    ).toBeInTheDocument();
  });
});
