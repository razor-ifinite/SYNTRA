@import 'tailwindcss';

@font-face {
  font-family: 'Bungee';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://static.figma.com/font/Bungee-Regular_1') format('woff2');
}

@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://static.figma.com/font/DMSans_opsz_wght__1') format('woff2');
}

@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('https://static.figma.com/font/DMSans_opsz_wght__1') format('woff2');
}

@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('https://static.figma.com/font/DMSans_opsz_wght__1') format('woff2');
}

@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('https://static.figma.com/font/DMSans_opsz_wght__1') format('woff2');
}

@theme {
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-display: 'Bungee', sans-serif;

  /* Light mode tokens */
  --color-bg: #F5F3FF;
  --color-surface: #FFFFFF;
  --color-surface-2: #EDE9FE;
  --color-border: #DDD6FE;
  --color-text: #1E1040;
  --color-text-muted: #6B5FA0;
  --color-primary: #7C3AED;
  --color-primary-light: #8B5CF6;
  --color-primary-dim: #EDE9FE;
  --color-accent: #A78BFA;
  --color-success: #10B981;
  --color-warning: #F59E0B;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 0; height: 0; }
scrollbar-width: none;
