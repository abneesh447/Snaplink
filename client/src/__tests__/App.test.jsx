import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App.jsx';

// Mock Clerk React SDK
vi.mock('@clerk/clerk-react', () => {
  return {
    SignedIn: ({ children }) => <>{children}</>,
    SignedOut: ({ children }) => <>{children}</>,
    SignInButton: ({ children }) => <div data-testid="signin-btn">{children}</div>,
    SignUpButton: ({ children }) => <div data-testid="signup-btn">{children}</div>,
    UserButton: () => <button>User Profile</button>,
    useAuth: () => ({
      getToken: async () => 'mock_token',
    }),
    useUser: () => ({
      user: { firstName: 'Test' },
    }),
  };
});

// Mock Dashboard Component to avoid complex API call testing in simple UI checks
vi.mock('../components/Dashboard.jsx', () => {
  return {
    default: () => <div data-testid="dashboard-mock">Mocked Dashboard</div>,
  };
});

describe('SnapLink React App UI', () => {
  it('renders application brand name', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/Snap/);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('contains signed out landing page tags', () => {
    render(<App />);
    expect(screen.getByText(/Enterprise Link/i)).toBeDefined();
  });
});
