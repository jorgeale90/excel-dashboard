<template>
  <div class="relative w-full" style="height: 200px;">
    <svg
      v-if="points.length > 1"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="none"
      class="w-full h-full"
    >
      <defs>
        <linearGradient id="grad-ingreso" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#39d353" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#39d353" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="grad-out" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f85149" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#f85149" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <line
        v-for="(tick, i) in yTicks"
        :key="i"
        :x1="PAD_L"
        :y1="scaleY(tick)"
        :x2="W - PAD_R"
        :y2="scaleY(tick)"
        stroke="#21262d"
        stroke-width="1"
      />

      <!-- Y-axis labels -->
      <text
        v-for="(tick, i) in yTicks"
        :key="'yl'+i"
        :x="PAD_L - 6"
        :y="scaleY(tick) + 3.5"
        fill="#6e7681"
        font-size="8"
        text-anchor="end"
        font-family="DM Mono, monospace"
      >{{ formatK(tick) }}</text>

      <!-- Ingreso area fill -->
      <path :d="areaPath(ingresoPoints)" fill="url(#grad-ingreso)" />
      <!-- Out area fill -->
      <path :d="areaPath(outPoints)" fill="url(#grad-out)" />

      <!-- Ingreso line -->
      <polyline
        :points="polylineStr(ingresoPoints)"
        fill="none"
        stroke="#39d353"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- Out line -->
      <polyline
        :points="polylineStr(outPoints)"
        fill="none"
        stroke="#f85149"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- X-axis date labels — every Nth point -->
      <text
        v-for="(p, i) in labelPoints"
        :key="'xl'+i"
        :x="p.x"
        :y="H - 2"
        fill="#6e7681"
        font-size="7"
        text-anchor="middle"
        font-family="DM Mono, monospace"
      >{{ p.label }}</text>
    </svg>

    <!-- Empty state -->
    <div v-else class="flex items-center justify-center h-full text-gray-700 text-xs font-mono">
      Sin datos suficientes para graficar
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] } // [{ fecha, ingreso, out, balance }]
})

// SVG canvas dimensions
const W = 700, H = 200, PAD_L = 46, PAD_R = 12, PAD_T = 10, PAD_B = 18

const points = computed(() => props.data.filter(d => d.fecha && d.fecha !== '—'))

const allVals = computed(() => [
  ...points.value.map(d => d.ingreso),
  ...points.value.map(d => d.out)
].filter(v => !isNaN(v)))

const minVal = computed(() => 0)
const maxVal = computed(() => {
  const m = Math.max(...allVals.value, 1)
  return m * 1.1
})

const yTicks = computed(() => {
  const range = maxVal.value - minVal.value
  const step  = Math.pow(10, Math.floor(Math.log10(range / 4)))
  const ticks  = []
  for (let v = 0; v <= maxVal.value; v += step * 2) ticks.push(v)
  return ticks.slice(0, 6)
})

function scaleX(i) {
  return PAD_L + (i / (points.value.length - 1)) * (W - PAD_L - PAD_R)
}
function scaleY(val) {
  return PAD_T + (1 - (val - minVal.value) / (maxVal.value - minVal.value)) * (H - PAD_T - PAD_B)
}

const ingresoPoints = computed(() => points.value.map((d, i) => ({ x: scaleX(i), y: scaleY(d.ingreso) })))
const outPoints     = computed(() => points.value.map((d, i) => ({ x: scaleX(i), y: scaleY(d.out) })))

function polylineStr(pts) {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}

function areaPath(pts) {
  if (!pts.length) return ''
  const bottom = H - PAD_B
  let d = `M ${pts[0].x} ${bottom} L ${pts[0].x} ${pts[0].y} `
  d += pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
  d += ` L ${pts[pts.length - 1].x} ${bottom} Z`
  return d
}

// Show ~8 date labels evenly spaced
const labelPoints = computed(() => {
  const n = points.value.length
  if (!n) return []
  const step = Math.max(1, Math.floor(n / 8))
  return points.value
    .filter((_, i) => i % step === 0 || i === n - 1)
    .map((d, j, arr) => {
      const origIndex = points.value.indexOf(d)
      return {
        x: scaleX(origIndex),
        label: d.fecha ? d.fecha.slice(5) : '' // MM-DD
      }
    })
})

function formatK(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
  return String(v)
}
</script>
