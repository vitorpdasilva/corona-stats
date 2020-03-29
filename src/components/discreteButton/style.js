import styled from 'styled-components';

const DiscreteButtonStyle = styled.button`
  background: none;
  border: 0;
  border-bottom: 1px solid black;
  cursor: pointer;
  font-size: 1rem;
  &:focus {
    outline: none;
  }
`;

export default DiscreteButtonStyle;