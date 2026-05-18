'use client'

import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export interface RadarDataset {
  label: string
  data: number[]
  color?: string
}

const PALETTE = ['#0d0129', '#19615c', '#b5860d', '#000000']

export default function RadarChart({
  labels,
  datasets,
  height = 320,
}: {
  labels: string[]
  datasets: RadarDataset[]
  height?: number
}) {
  return (
    <div style={{ height }}>
      <Radar
        data={{
          labels,
          datasets: datasets.map((d, i) => {
            const color = d.color ?? PALETTE[i % PALETTE.length]
            return {
              label: d.label,
              data: d.data,
              backgroundColor: color + '22',
              borderColor: color,
              borderWidth: 2,
              pointBackgroundColor: color,
              pointRadius: 4,
            }
          }),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'top' } },
          scales: {
            r: {
              beginAtZero: true,
              grid: { color: '#0d012920' },
              pointLabels: { font: { family: 'system-ui', size: 12 } },
              ticks: { font: { family: 'monospace', size: 10 }, backdropColor: 'transparent' },
            },
          },
        }}
      />
    </div>
  )
}
