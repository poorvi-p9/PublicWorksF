import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import AdminDashboard from '../pages/AdminDashboard'
import * as authUtils from '../utils/auth';

// Mock the react-router-dom

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth utilities
jest.mock('../utils/auth', () => ({
  getAuthRole: jest.fn(),
  getAuthToken: jest.fn(),
}));

// Mock MessageModal and RemarksModal
jest.mock('../components/MessageModal', () => {
  return function MessageModal({ isOpen, onClose }: any) {
    return isOpen ? <div data-testid="message-modal">Message Modal</div> : null;
  };
});

jest.mock('../components/RemarksModal', () => ({
  RemarksModal: function RemarksModal({ isOpen, onClose }: any) {
    return isOpen ? <div data-testid="remarks-modal">Remarks Modal</div> : null;
  },
}));

// Mock data
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
    description: 'Pothole on Main Street',
    issueCategoryId: 1,
    statusId: 1,
    priorityId: 3,
    reporterUserId: 5,
    location: 'POINT (77.1025 28.7041)',
    createdAt: '2025-10-10T10:00:00Z',
  },
  {
    issueId: 2,
    description: 'Water leakage',
    issueCategoryId: 2,
    statusId: 2,
    priorityId: 2,
    reporterUserId: 6,
    location: 'POINT (77.2090 28.6139)',
    createdAt: '2025-10-11T11:00:00Z',
  },
];

const mockStats = {
  totalIssues: 10,
  pending: 3,
  inProgress: 4,
  resolved: 3,
  highPriority: 2,
};

const mockImages = [
  { imagePath: '/uploads/image1.jpg' },
  { imagePath: '/uploads/image2.jpg' },
];

describe('AdminDashboard', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userEmail') return 'admin@test.com';
      if (key === 'user') return JSON.stringify({ userId: 1 });
      return null;
    });
    
    // Setup default auth
    (authUtils.getAuthRole as jest.Mock).mockReturnValue(1);
    (authUtils.getAuthToken as jest.Mock).mockReturnValue('fake-token');
    
    // Setup fetch mock
    global.fetch = jest.fn((url) => {
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
      if (url.includes('/Issue') && !url.includes('images') && !url.includes('update-issue')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockIssues),
        });
      }
      if (url.includes('/images')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockImages),
        });
      }
      if (url.includes('update-issue')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authorization', () => {
    it('should redirect unauthorized users', () => {
      (authUtils.getAuthRole as jest.Mock).mockReturnValue(2); // Non-admin role
      
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      expect(screen.getByText('NOT AUTHORIZED')).toBeInTheDocument();
    });

    it('should render dashboard for authorized admin', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('AGREEYA Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch and display stats', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // Total Issues
        expect(screen.getByText('3')).toBeInTheDocument(); // Pending
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
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
        expect(screen.getByText('Water leakage')).toBeInTheDocument();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const statusSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusSelect, { target: { value: '1' } });
      
      const applyButton = screen.getByText('Apply Filter');
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('statusId=1'),
          expect.any(Object)
        );
      });
    });

    it('should filter by priority', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const prioritySelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(prioritySelect, { target: { value: '3' } });
      
      const applyButton = screen.getByText('Apply Filter');
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('priorityId=3'),
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
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        const statusSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
        expect(statusSelect.value).toBe('');
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
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const statusSelects = screen.getAllByRole('combobox');
      const issueStatusSelect = statusSelects.find(
        (select) => (select as HTMLSelectElement).value === '1'
      );
      
      if (issueStatusSelect) {
        fireEvent.change(issueStatusSelect, { target: { value: '2' } });
        
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('update-issue/1'),
            expect.objectContaining({
              method: 'PUT',
              body: JSON.stringify({ statusId: 2 }),
            })
          );
        });
      }
    });

    it('should update issue priority', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const prioritySelects = screen.getAllByRole('combobox');
      const issuePrioritySelect = prioritySelects.find(
        (select) => (select as HTMLSelectElement).value === '3'
      );
      
      if (issuePrioritySelect) {
        fireEvent.change(issuePrioritySelect, { target: { value: '1' } });
        
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('update-issue/1'),
            expect.objectContaining({
              method: 'PUT',
              body: JSON.stringify({ priorityId: 1 }),
            })
          );
        });
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
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/Issue/1/images'),
          expect.any(Object)
        );
      });
    });

    it('should show alert when no images available', async () => {
      global.fetch = jest.fn((url) => {
        if (url.includes('/images')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockIssues),
        });
      }) as jest.Mock;
      
      window.alert = jest.fn();
      
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('No images available for this issue');
      });
    });
  });

  describe('Map Viewer', () => {
    it('should open map when View Map button is clicked', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const viewMapButtons = screen.getAllByText('View Map');
      fireEvent.click(viewMapButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Issue Location')).toBeInTheDocument();
      });
    });

    it('should close map when close button is clicked', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const viewMapButtons = screen.getAllByText('View Map');
      fireEvent.click(viewMapButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Issue Location')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByTitle('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Issue Location')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modals', () => {
    it('should open message modal when Message button is clicked', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const messageButtons = screen.getAllByText('Message');
      fireEvent.click(messageButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('message-modal')).toBeInTheDocument();
      });
    });

    it('should open remarks modal when Remarks button is clicked', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      });
      
      const remarksButtons = screen.getAllByText('Remarks');
      fireEvent.click(remarksButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('remarks-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no issues', async () => {
      global.fetch = jest.fn((url) => {
        if (url.includes('/Issue') && !url.includes('summary')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatuses),
        });
      }) as jest.Mock;
      
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