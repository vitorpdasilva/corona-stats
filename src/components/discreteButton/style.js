import styled from 'styled-components';

const DiscreteButtonStyle = styled.button`
  background: none;
  border: 0;
  border-bottom: 1px solid black;
  &:focus {
    outline: none;
  }
  cursor: pointer;
`;

export default DiscreteButtonStyle;