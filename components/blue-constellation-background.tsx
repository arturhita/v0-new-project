"use client"

export const BlueConstellationBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-[#0a183d] via-[#0c1a42] to-[#1c2d5a]">
    {/* This uses the hero-background.png which has a subtle constellation pattern */}
    <div className="absolute inset-0 bg-[url('/images/hero-background.png')] bg-cover bg-center opacity-10" />
  </div>
)
