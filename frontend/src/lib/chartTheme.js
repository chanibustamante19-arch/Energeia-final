export const CHART = {
  eco: '#27AE83',
  lime: '#B7F34A',
  navy: '#101C2C',
  sky: '#4FA3D1',
  violet: '#8F7BE8',
  amber: '#E8B23A',
  coral: '#F08A5D',
  mint: '#57C1A3',
  gray: '#9AA7B0',
};

export const PIE_COLORS = [
  CHART.eco,
  CHART.lime,
  CHART.sky,
  CHART.violet,
  CHART.amber,
  CHART.mint,
  CHART.coral,
  CHART.gray,
];

export const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 14,
  fontSize: 12,
  color: 'hsl(var(--foreground))',
  boxShadow: '0 18px 40px -24px rgba(16,28,44,0.55)',
  padding: '10px 12px',
};

export const tooltipLabelStyle = {
  color: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 4,
};

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
};

export const gridProps = {
  stroke: 'hsl(var(--border))',
  strokeDasharray: '4 6',
  vertical: false,
};