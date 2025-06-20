"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
  {
    mese: "Gen",
    consulenze: 1200,
    ricavi: 18000,
    telefono: 540,
    video: 420,
    chat: 240,
  },
  {
    mese: "Feb",
    consulenze: 1900,
    ricavi: 28500,
    telefono: 855,
    video: 665,
    chat: 380,
  },
  {
    mese: "Mar",
    consulenze: 2800,
    ricavi: 42000,
    telefono: 1260,
    video: 980,
    chat: 560,
  },
  {
    mese: "Apr",
    consulenze: 3900,
    ricavi: 58500,
    telefono: 1755,
    video: 1365,
    chat: 780,
  },
  {
    mese: "Mag",
    consulenze: 4200,
    ricavi: 63000,
    telefono: 1890,
    video: 1470,
    chat: 840,
  },
  {
    mese: "Giu",
    consulenze: 3800,
    ricavi: 57000,
    telefono: 1710,
    video: 1330,
    chat: 760,
  },
  {
    mese: "Lug",
    consulenze: 4500,
    ricavi: 67500,
    telefono: 2025,
    video: 1575,
    chat: 900,
  },
  {
    mese: "Ago",
    consulenze: 4100,
    ricavi: 61500,
    telefono: 1845,
    video: 1435,
    chat: 820,
  },
  {
    mese: "Set",
    consulenze: 4800,
    ricavi: 72000,
    telefono: 2160,
    video: 1680,
    chat: 960,
  },
  {
    mese: "Ott",
    consulenze: 5200,
    ricavi: 78000,
    telefono: 2340,
    video: 1820,
    chat: 1040,
  },
  {
    mese: "Nov",
    consulenze: 4900,
    ricavi: 73500,
    telefono: 2205,
    video: 1715,
    chat: 980,
  },
  {
    mese: "Dic",
    consulenze: 5500,
    ricavi: 82500,
    telefono: 2475,
    video: 1925,
    chat: 1100,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="mese" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip
          formatter={(value, name) => [
            name === "ricavi" ? `€${value}` : value,
            name === "ricavi" ? "Ricavi" : "Consulenze",
          ]}
          labelFormatter={(label) => `Mese: ${label}`}
        />
        <Legend />
        <Bar dataKey="ricavi" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ricavi (€)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
