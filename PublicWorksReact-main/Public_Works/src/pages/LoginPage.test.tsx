/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./LoginPage";
import axios from "axios";

// Mock axios
vi.mock("axios");

// Mock window.location
delete (window as any).location;
(window as any).location = { href: "", search: "" };

describe("LoginPage Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders user login button by default", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /Sign in with Google/i })).toBeInTheDocument();
  });

  it("switches to admin form when clicking Admin", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /Admin/i }));

    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  it("calls admin login API and redirects on success", async () => {
    (axios.post as any).mockResolvedValue({
      status: 200,
      data: { token: "fake_token", user: { name: "Admin" } },
    });

    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /Admin/i }));

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5142/auth/adminauth",
        { username: "admin", password: "1234" }
      );
    });

    expect(localStorage.getItem("token")).toBe("fake_token");
    expect(window.location.href).toBe("/admin");
  });

  it("shows error message when admin login fails", async () => {
    (axios.post as any).mockRejectedValue(new Error("Invalid login"));

    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /Admin/i }));

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "bad" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
    });
  });
});
