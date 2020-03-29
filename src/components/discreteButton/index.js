import React from 'react';
import DiscreteButtonStyle from './style'

const DiscreteButton = ({ children, onClick }) => {
  
  return (
    <DiscreteButtonStyle onClick={onClick}>
      {children}
    </DiscreteButtonStyle>
  )
}

export default DiscreteButton;