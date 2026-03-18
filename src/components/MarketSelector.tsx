'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, BarChart2 } from 'lucide-react'

type Props = {
  markets: any[]
  value?: string
  onChange?: (m: string) => void
}

export default function MarketSelector({ markets = [], value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedMarket = markets.find(m => (m.id ?? m.marketId ?? `${m.base}-${m.quote}`) === value)
  const displayLabel = selectedMarket 
    ? (selectedMarket.name ?? selectedMarket.marketId ?? `${selectedMarket.base}/${selectedMarket.quote}`)
    : 'Select Market'

  return (
    <div className="relative w-full z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white/5 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-white/10 rounded-xl shadow-lg transition-all duration-300 hover:border-cyan-500/50 hover:bg-white/10 dark:hover:bg-white/5 group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
            <BarChart2 size={16} />
          </div>
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">{displayLabel}</span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-white/70 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {markets.length === 0 ? (
            <div className="p-3 text-sm text-center text-zinc-500">Loading markets...</div>
          ) : (
            markets.map((m) => {
              const val = m.id ?? m.marketId ?? `${m.base}-${m.quote}`
              const label = m.name ?? m.marketId ?? `${m.base}/${m.quote}`
              const isSelected = val === value

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onChange?.(val)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 ${
                    isSelected 
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold' 
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-transparent'}`} />
                  {label}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
