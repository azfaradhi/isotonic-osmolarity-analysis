'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type Plugin,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export interface BarDataset {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
}

export interface ReferenceLine {
  value: number
  label: string
  color?: string
}

interface BarChartProps {
  labels: string[]
  datasets: BarDataset[]
  referenceLines?: ReferenceLine[]
  horizontal?: boolean
  height?: number
}

const PALETTE = [
  { bg: '#0d0129cc', border: '#0d0129' },
  { bg: '#19615ccc', border: '#19615c' },
  { bg: '#fae59bcc', border: '#0d0129' },
]

function makeRefPlugin(lines: ReferenceLine[], horizontal: boolean): Plugin<'bar'> {
  return {
    id: 'refLines',
    afterDraw(chart) {
      if (!lines.length) return
      const { ctx, chartArea, scales } = chart
      const scale = horizontal ? scales.x : scales.y
      lines.forEach(({ value, label, color = '#19615c' }) => {
        const pos = scale.getPixelForValue(value)
        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 4])
        ctx.beginPath()
        if (horizontal) {
          ctx.moveTo(pos, chartArea.top)
          ctx.lineTo(pos, chartArea.bottom)
        } else {
          ctx.moveTo(chartArea.left, pos)
          ctx.lineTo(chartArea.right, pos)
        }
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = color
        ctx.font = '11px monospace'
        ctx.fillText(label, horizontal ? pos + 4 : chartArea.left + 4, horizontal ? chartArea.top + 12 : pos - 4)
        ctx.restore()
      })
    },
  }
}

export default function BarChart({
  labels,
  datasets,
  referenceLines = [],
  horizontal = false,
  height = 300,
}: BarChartProps) {
  const options: ChartOptions<'bar'> = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: datasets.length > 1, position: 'top' } },
    scales: {
      x: { grid: { color: '#0d012915' }, ticks: { font: { family: 'monospace', size: 11 } } },
      y: { grid: { color: '#0d012915' }, ticks: { font: { family: 'monospace', size: 11 } } },
    },
  }

  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: datasets.map((d, i) => {
            const c = PALETTE[i % PALETTE.length]
            return {
              label: d.label,
              data: d.data,
              backgroundColor: d.backgroundColor ?? c.bg,
              borderColor: d.borderColor ?? c.border,
              borderWidth: 1,
              borderRadius: 0,
            }
          }),
        }}
        options={options}
        plugins={[makeRefPlugin(referenceLines, horizontal)]}
      />
    </div>
  )
}
