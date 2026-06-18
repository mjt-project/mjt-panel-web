import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
  primaryColor: 'indigo',
  defaultRadius: 'md',
  colors: {
    indigo: [
      '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8',
      '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81',
    ],
  },
  headings: { fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif' },
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: {
        root: { fontWeight: 600 },
      },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
    },
    Select: {
      defaultProps: { radius: 'md' },
    },
  },
  other: { panelHeaderHeight: rem(66) },
});
