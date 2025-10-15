import React from 'react';
import { Modal as RBModal } from 'react-bootstrap';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <RBModal show={isOpen} onHide={onClose} centered>
      <RBModal.Header closeButton>
        <RBModal.Title>{title}</RBModal.Title>
      </RBModal.Header>
      <RBModal.Body>{children}</RBModal.Body>
      {footer && <RBModal.Footer>{footer}</RBModal.Footer>}
    </RBModal>
  );
};

export default Modal;