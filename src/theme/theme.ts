import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  fontFamily: '"Be Vietnam Pro", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"Be Vietnam Pro", Inter, ui-sans-serif, system-ui, sans-serif',
    fontWeight: '700',
  },
  primaryColor: 'indigo',
  primaryShade: 6,
  defaultRadius: 'md',
  cursorType: 'pointer',
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        fw: 650,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'xl',
        withBorder: true,
      },
    },
    Card: {
      defaultProps: {
        radius: 'xl',
        withBorder: true,
      },
    },
    Modal: {
      defaultProps: {
        radius: 'xl',
        centered: true,
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
