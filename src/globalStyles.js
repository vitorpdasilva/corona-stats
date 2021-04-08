import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    border: 0;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    background: ${({ theme, selectedTheme }) => theme[selectedTheme].background};
    color: ${({ theme, selectedTheme }) => theme[selectedTheme].text};
  }
  .ui.styled.accordion {
    background: ${({ theme, selectedTheme }) => theme[selectedTheme].background};
    color: ${({ theme, selectedTheme }) => theme[selectedTheme].text};
    border: ${({ theme, selectedTheme }) => `1px solid ${theme[selectedTheme].border}`};
    > div {
      border-bottom: ${({ theme, selectedTheme }) => `1px solid ${theme[selectedTheme].border}`};
      &:last-of-type, &:first-of-type {
        border: 0;
      }
      .active.title, .title {
        color: ${({ theme, selectedTheme }) => theme[selectedTheme].text};  
      }
    }
  }
  .ui.statistic {
    > .value.value.value, > .label.label.label {
      color: ${({ theme, selectedTheme }) => theme[selectedTheme].text};
    }
  }
`;

export default GlobalStyle;