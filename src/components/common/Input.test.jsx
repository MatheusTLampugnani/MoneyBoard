import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Input from './Input';

describe('Input component', () => {
  it('should render label and input field', () => {
    render(<Input id="email" label="Email Address" type="email" placeholder="Enter email" />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('should render error message when error prop is provided', () => {
    render(<Input id="password" label="Password" error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should not render error feedback when error is undefined', () => {
    render(<Input id="username" label="Username" />);
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Username')).not.toHaveClass('is-invalid');
  });
});
