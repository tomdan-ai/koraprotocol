'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useWalletStore } from '@/store/wallet'

type Message = { role: 'user' | 'assistant'; text: string }

const prompts = [
  { label: "What's moving on Injective right now?", text: "What's moving on Injective right now?" },
  { label: "Where is the best yield for INJ?", text: "Where is the best yield for INJ?" },
  { label: "Explain the top market's orderbook", text: "Explain the top market's orderbook." },
  { label: "Analyse my portfolio", text: "Analyse my portfolio." },
]

export default function AIChat() {
  const address = useWalletStore((s) => s.address)
  const [messages, setMessages] = useState<Message[]>([])
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text) return
      setMessages((prev) => [...prev, { role: 'user', text }])
      setValue('')
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: text, walletAddress: address }),
        })
        const data = await res.json()
        const reply = data.reply ?? 'No response.'
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
      } catch (err) {
        setError((err as any)?.message ?? 'Failed to send.')
      } finally {
        setLoading(false)
      }
    },
    [address],
  )

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      sendMessage(value)
    },
    [sendMessage, value],
  )

  const onPrompt = useCallback(
    (prompt: string) => {
      sendMessage(prompt)
    },
    [sendMessage],
  )

  const scrollAnchor = useMemo(() => Math.random().toString(16).slice(2), [])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/30 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {prompts.map((p) => (
            <button
              key={p.label}
              onClick={() => onPrompt(p.text)}
              className="rounded-full bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-100 hover:bg-zinc-800"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
        {messages.length === 0 ? (
          <div className="text-sm text-zinc-400">Ask something to see insights from the live Injective market.</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-4 ${
                  msg.role === 'user' ? 'bg-indigo-500/20 text-white' : 'bg-zinc-900/60 text-zinc-100'
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {msg.role === 'user' ? 'You' : 'Kora'}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm">{msg.text}</div>
              </div>
            ))}
          </div>
        )}
        <div id={scrollAnchor} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={address ? 'Ask Kora about markets or your portfolio…' : 'Connect your wallet to get portfolio-aware answers'}
          disabled={!address || loading}
          className="flex-1 rounded-full border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!address || loading || !value.trim()}
          className="rounded-full bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
      {error && <div className="text-sm text-rose-300">{error}</div>}
    </div>
  )
}
