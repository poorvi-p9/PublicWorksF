import { render, screen, fireEvent, within } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { AuthProvider } from "../context/AuthContext"; // adjust to your project

const mockUser = {
  email: "testuser@example.com",
  name: "Test User",
  role: "admin", // important
};

describe("AdminDashboard Component", () => {
  const renderWithAuth = () => {
    render(
      <AuthProvider value={{ user: mockUser }}>
        <AdminDashboard />
      </AuthProvider>
    );
  };

  test("opens RemarksModal when clicking Remarks button", async () => {
    renderWithAuth();

    // Click the Remarks button
    fireEvent.click(screen.getByRole("button", { name: /Remarks/i }));

    // Wait for modal to appear
    const remarksModal = await screen.findByRole("dialog");

    expect(within(remarksModal).getByText(/Admin Remarks/i)).toBeInTheDocument();
  });
});
