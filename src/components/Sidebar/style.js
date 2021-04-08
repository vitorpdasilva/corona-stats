import styled from 'styled-components';
import checkTheme from '../../helpers/checkTheme';

// const selectedTheme = checkTheme();

const StyledSidebar = styled.div`
  min-height: 100vh;
  border-right: 1px solid lightgrey;
  background: ${({ theme, selectedTheme }) => theme[selectedTheme].background};
  nav {
    width: 250px;
    display: flex;
    flex-direction:column;
    background: ${({ theme, selectedTheme }) => theme[selectedTheme].background};
    position: sticky;
    top: 2px;
    a {
      padding: 15px 50px;
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      color: ${({ theme, selectedTheme }) => theme[selectedTheme].text};
      background: ${({ theme, selectedTheme }) => theme[selectedTheme].background};
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
      color: ${({ theme, selectedTheme }) => theme[selectedTheme].text};
      ${({ theme, selectedTheme }) => theme[selectedTheme].background};
      justify-content: flex-start;
      border-bottom: 1px solid #dfdfdf;
      .ui.toggle.checkbox {
        label {
          opacity: 1;
          color: ${({ theme, selectedTheme }) => theme[selectedTheme].text}!important;
        }
      }
    }
  }
`;

export default StyledSidebar;
