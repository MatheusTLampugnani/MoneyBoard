import React from 'react';
import { Form } from 'react-bootstrap';

const Input = ({ id, label, error, ...props }) => {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Form.Control isInvalid={!!error} {...props} />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </Form.Group>
  );
};

export default Input;