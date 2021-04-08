import styled from 'styled-components';

const StyledSidebar = styled.nav`
  width: 250px;
  display: flex;
  flex-direction:column;
  background: white;
  position: sticky;
  top: 2px;
  a {
    padding: 15px 50px;
    height: 100px;
    width: 100%;
    display: flex;
    align-items: center;
    color: black;
    background: white;
    justify-content: flex-start;
    border-bottom: 1px solid #dfdfdf;
    &:hover {
      background: lightgrey;
    }
    &:first-of-type {
      border-top: 1px solid #dfdfdf;
      margin-top: 57px;
    }
  }
  .field {
    padding: 15px 30px 15px 50px;
    height: 100px;
    width: 100%;
    display: flex;
    align-items: center;
    color: black;
    background: white;
    justify-content: flex-start;
    border-bottom: 1px solid #dfdfdf;
    label {
      opacity: 1;
    }
  }
`;

export default StyledSidebar;
