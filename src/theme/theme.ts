import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
    fontWeight: '650'
  },
  primaryColor: 'indigo',
  primaryShade: 6,
  defaultRadius: 'md',
  spacing: { xs: rem(8), sm: rem(12), md: rem(16), lg: rem(24), xl: rem(32) },
  components: {
    Button: {
      defaultProps: { radius: 'md', fw: 600 }
    },
    Paper: {
      defaultProps: { radius: 'lg', withBorder: true }
    }
  }
});
