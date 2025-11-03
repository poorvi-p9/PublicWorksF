import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import * as auth from '../utils/auth';

// Mock the auth utilities
vi.mock('../utils/auth', () => ({
  getAuthRole: vi.fn(),
  getAuthToken: vi.fn(),
}));

// Mock the modals
vi.mock('../components/MessageModal', () => ({
  default: ({ isOpen, onClose, recipientEmail }: any) =>
    isOpen ? (
      <div data-testid="email-modal">
        <span>Email Modal for {recipientEmail}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('../components/RemarksModal', () => ({
  RemarksModal: ({ isOpen, onClose, issueId }: any) =>
    isOpen ? (
      <div data-testid="remarks-modal">
        <span>Remarks Modal for Issue {issueId}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;


// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AdminDashboard', () => {
  const mockStatuses = [
    { statusId: 1, name: 'Pending', description: 'Pending status' },
    { statusId: 2, name: 'In Progress', description: 'In progress status' },
    { statusId: 3, name: 'Resolved', description: 'Resolved status' },
  ];

  const mockPriorities = [
    { priorityId: 1, name: 'Low', description: 'Low priority' },
    { priorityId: 2, name: 'Medium', description: 'Medium priority' },
    { priorityId: 3, name: 'High', description: 'High priority' },
  ];

  const mockCategories = [
    { categoryId: 1, name: 'Road', description: 'Road issues' },
    { categoryId: 2, name: 'Water', description: 'Water issues' },
    { categoryId: 3, name: 'Electricity', description: 'Electricity issues' },
  ];

  const mockIssues = [
    {
      issueId: 1,
      description: 'Pothole on main street',
      issueCategoryId: 1,
      statusId: 1,
      priorityId: 3,
      reporterUserId: 101,
      location: 'POINT (75.8577 26.9124)',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      issueId: 2,
      description: 'Water leakage',
      issueCategoryId: 2,
      statusId: 2,
      priorityId: 2,
      reporterUserId: 102,
      location: null,
      createdAt: '2024-01-14T09:20:00',
    },
  ];

  const mockStats = {
    totalIssues: 10,
    pending: 3,
    inProgress: 4,
    resolved: 3,
    highPriority: 2,
  };

  const mockUserData = {
    userId: 1,
    email: 'admin@example.com',
    name: 'Admin User',
  };

  const setupDefaultFetchMock = () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/Status/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatuses),
        });
      }
      if (url.includes('/Priority/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPriorities),
        });
      }
      if (url.includes('/Category/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        });
      }
      if (url.includes('/Issue/summary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStats),
        });
      }
      if (url.includes('/update-issue/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      if (url.includes('/Issue') && !url.includes('/images') && !url.includes('/update-issue')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockIssues),
        });
      }
      if (url.includes('/images')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { imagePath: '/uploads/image1.jpg' },
            { imagePath: '/uploads/image2.jpg' },
          ]),
        });
      }
      if (url.includes('/User/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'user@example.com',
            name: 'Test User',
          }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup localStorage
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'userEmail') return 'admin@example.com';
      if (key === 'user') return JSON.stringify(mockUserData);
      return null;
    });

    // Setup auth mocks
    vi.mocked(auth.getAuthRole).mockReturnValue(1); // Admin role
    vi.mocked(auth.getAuthToken).mockReturnValue('mock-token-123');

    // Setup default fetch responses
    setupDefaultFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authorization', () => {
    it('should show NOT AUTHORIZED when user is not admin', async () => {
      vi.mocked(auth.getAuthRole).mockReturnValue(2); // Non-admin role

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('NOT AUTHORIZED')).toBeInTheDocument();
      });
    });

    it('should render dashboard when user is admin', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('AgreeYa Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Initial Data Loading', () => {
    it('should display loading state initially', () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should fetch and display stats', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Total Issues')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // Total
        const statCards = screen.getAllByText('3');
        expect(statCards.length).toBeGreaterThanOrEqual(1); // Pending and Resolved both have 3
        expect(screen.getByText('4')).toBeInTheDocument(); // In Progress
      });
    });

    it('should fetch and display issues', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
        expect(screen.getByText('Water leakage')).toBeInTheDocument();
      });
    });

    it('should make API calls with authorization token', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/Status/'),
          expect.objectContaining({
            headers: { Authorization: 'Bearer mock-token-123' },
          })
        );
      });
    });
  });

  describe('Filtering', () => {
    it('should filter issues by status', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
      });

      // Get the filter section and find the status select within it
      const filterSection = screen.getByText('Filter Issues:').parentElement;
      const selects = within(filterSection!).getAllByRole('combobox');
      const statusSelect = selects[0]; // First select is status

      fireEvent.change(statusSelect, { target: { value: '1' } });

      const applyButton = screen.getByText('Apply Filter');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('statusId=1'),
          expect.any(Object)
        );
      });
    });

    it('should reset filters', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Recent Issues')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        const calls = mockFetch.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).toBe('http://localhost:5142/api/Issue');
      });
    });
  });

  describe('Status and Priority Updates', () => {
    it('should update issue status', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
      });

      // Clear previous fetch calls
      mockFetch.mockClear();

      // Find the table row with the issue
      const rows = screen.getAllByRole('row');
      const issueRow = rows.find(row => row.textContent?.includes('Pothole on main street'));

      if (issueRow) {
        const selects = within(issueRow).getAllByRole('combobox');
        // Find the status select (it should have value "1" for Pending)
        const statusSelect = selects.find(select => (select as HTMLSelectElement).value === '1');

        if (statusSelect) {
          fireEvent.change(statusSelect, { target: { value: '2' } });

          await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
              expect.stringContaining('/update-issue/1'),
              expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ statusId: 2 }),
              })
            );
          });
        }
      }
    });
  });

  describe('Image Viewer', () => {
    it('should open image viewer when View button is clicked', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/images'),
          expect.any(Object)
        );
      });
    });

    it('should show alert when no images available', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

      // Reset to default mocks first
      setupDefaultFetchMock();

      // Then override just the images endpoint
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/images')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        // Call the original implementation for other URLs
        if (url.includes('/Status/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStatuses) });
        if (url.includes('/Priority/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPriorities) });
        if (url.includes('/Category/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) });
        if (url.includes('/Issue/summary')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStats) });
        if (url.includes('/Issue')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockIssues) });
        if (url.includes('/User/')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ email: 'user@example.com', name: 'Test User' }) });
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('No images available for this issue');
      }, { timeout: 3000 });

      alertSpy.mockRestore();
    });
  });

  describe('Map Modal', () => {
    it('should open map modal when View Map is clicked', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
      });

      const mapButton = screen.getByText('View Map');
      fireEvent.click(mapButton);

      await waitFor(() => {
        expect(screen.getByText('Issue Location')).toBeInTheDocument();
      });
    });

    it('should show N/A for issues without location', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Water leakage')).toBeInTheDocument();
      });

      const naTexts = screen.getAllByText('N/A');
      expect(naTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Email Modal', () => {
    it('should fetch user email and open email modal', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
      });

      // Clear previous calls
      mockFetch.mockClear();

      const emailButtons = screen.getAllByText('Email');
      fireEvent.click(emailButtons[1]); // Click email button for first issue (ID 1, userId 101)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:5142/api/User/101',
          expect.objectContaining({
            headers: { Authorization: 'Bearer mock-token-123' },
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('email-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Remarks Modal', () => {
    it('should open remarks modal when Remarks button is clicked', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pothole on main street')).toBeInTheDocument();
      });

      const remarksButtons = screen.getAllByText('Remarks');
      fireEvent.click(remarksButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('remarks-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API failure gracefully', async () => {
      // Mock all endpoints to fail after initial auth check
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/Status/') || url.includes('/Priority/') || url.includes('/Category/')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.reject(new Error('Network error')),
          });
        }
        if (url.includes('/Issue')) {
          return Promise.reject(new Error('Failed to fetch issues'));
        }
        return Promise.reject(new Error('Network error'));
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      // Wait for the component to finish loading
      await waitFor(() => {
        // The component should render but may show empty state
        expect(screen.getByText('AgreeYa Dashboard')).toBeInTheDocument();
      });
    });

    it('should show empty state when no issues found', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/Issue') && !url.includes('/summary')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        if (url.includes('/Status/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStatuses) });
        }
        if (url.includes('/Priority/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPriorities) });
        }
        if (url.includes('/Category/')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) });
        }
        if (url.includes('/summary')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStats) });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No issues found')).toBeInTheDocument();
      });
    });
  });
});