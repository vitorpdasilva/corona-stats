export default function checkTheme() {
  const theme = window.localStorage.getItem('theme');
  if (!theme) window.localStorage.setItem('theme', 'light');
  return theme ?? 'light';
}