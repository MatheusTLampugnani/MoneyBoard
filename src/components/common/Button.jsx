import React from 'react';
import { Button as RBButton } from 'react-bootstrap';

const Button = ({ children, variant = 'primary', icon: Icon, ...props }) => {
  return (
    <RBButton variant={variant} {...props}>
      {Icon && <span className="me-2">{Icon}</span>}
      {children}
    </RBButton>
  );
};

export default Button;