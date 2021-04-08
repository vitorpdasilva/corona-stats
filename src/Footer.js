import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        bottom: 0,
        width: '100%',
      }}
    >
      <small>
        Made with ❤ by <a href="https://github.com/vitorboccio" target="_blank" rel="noopener noreferrer">@vitorboccio</a>
      </small>
    </footer>
  )
}

export default Footer;