import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal component', () => {
  it('should render modal content when isOpen is true', () => {
    render(
      <Modal isOpen={true} title="Test Title">
        <p>Modal Body</p>
      </Modal>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Body')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} title="Test Title">
        <p>Modal Body</p>
      </Modal>
    );
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} title="Test Title" onClose={handleClose}>
        <p>Body</p>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should render footer if provided', () => {
    render(
      <Modal isOpen={true} title="Title" footer={<button>Save</button>}>
        <p>Body</p>
      </Modal>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
