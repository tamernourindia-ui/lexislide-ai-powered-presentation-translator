import { useTheme } from '@/hooks/use-theme';
export function ArchitectureDiagram() {
  const { isDark } = useTheme();
  const textColor = isDark ? '#E2E8F0' : '#4A5568';
  const boxBg = isDark ? '#2D3748' : '#F7FAFC';
  const boxBorder = isDark ? '#4A5568' : '#E2E8F0';
  const primaryColor = '#4F46E5'; // indigo-600
  const Arrow = ({ id }: { id: string }) => (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="5"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill={primaryColor} />
    </marker>
  );
  const Box = ({ x, y, width, height, text }: { x: number; y: number; width: number; height: number; text: string[] }) => (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="8"
        ry="8"
        fill={boxBg}
        stroke={boxBorder}
        strokeWidth="1.5"
      />
      {text.map((line, index) => (
        <text
          key={index}
          x={x + width / 2}
          y={y + height / 2 - (text.length > 1 ? 8 : 0) + (index * 16)}
          textAnchor="middle"
          fill={textColor}
          fontSize="12"
          fontWeight="500"
        >
          {line}
        </text>
      ))}
    </g>
  );
  const Line = ({ x1, y1, x2, y2, markerId }: { x1: number; y1: number; x2: number; y2: number; markerId: string }) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={primaryColor}
      strokeWidth="2"
      markerEnd={`url(#${markerId})`}
    />
  );
  return (
    <div className="p-4 bg-secondary/50 rounded-lg">
      <svg viewBox="0 0 400 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <Arrow id="arrow" />
        </defs>
        {/* Boxes */}
        <Box x={10} y={75} width={120} height={50} text={["User", "(React Frontend)"]} />
        <Box x={160} y={75} width={100} height={50} text={["Google AI", "API"]} />
        <Box x={290} y={75} width={100} height={50} text={["Gemini", "AI Model"]} />
        {/* Lines */}
        <Line x1={130} y1={100} x2={160} y2={100} markerId="arrow" />
        <Line x1={260} y1={100} x2={290} y2={100} markerId="arrow" />
      </svg>
    </div>
  );
}