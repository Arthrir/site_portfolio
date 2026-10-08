import { useId } from 'react'
import type { Card, Rank, Suit } from './engine'

const RED = '#B3261E'
const INK = '#121211'
export const suitColor = (s: Suit) => (s === 'H' || s === 'D' ? RED : INK)

/** Symbole de couleur dessiné dans une boîte de 20 x 20 centrée sur l'origine. */
export function SuitShape({ suit, color }: { suit: Suit; color: string }) {
  switch (suit) {
    case 'H':
      return <path fill={color} d="M0 9 C-6 4 -10 0.5 -10 -3.8 C-10 -7.8 -6.5 -10 -3.6 -9.2 C-1.6 -8.6 -0.4 -7 0 -5.6 C0.4 -7 1.6 -8.6 3.6 -9.2 C6.5 -10 10 -7.8 10 -3.8 C10 0.5 6 4 0 9Z" />
    case 'D':
      return <path fill={color} d="M0 -10 C2 -6.5 4.5 -3 7.5 0 C4.5 3 2 6.5 0 10 C-2 6.5 -4.5 3 -7.5 0 C-4.5 -3 -2 -6.5 0 -10Z" />
    case 'S':
      return <path fill={color} d="M0 -10 C-3 -5.5 -10 -2.5 -10 2.6 C-10 6.4 -6.8 8 -4.2 7.2 C-2.6 6.8 -1.4 5.8 -0.8 4.6 C-1 7 -2.2 8.8 -4.2 10 L4.2 10 C2.2 8.8 1 7 0.8 4.6 C1.4 5.8 2.6 6.8 4.2 7.2 C6.8 8 10 6.4 10 2.6 C10 -2.5 3 -5.5 0 -10Z" />
    default:
      return (
        <g fill={color}>
          <circle cx="0" cy="-4.8" r="4.4" />
          <circle cx="-5" cy="2" r="4.4" />
          <circle cx="5" cy="2" r="4.4" />
          <circle cx="0" cy="0.5" r="2.4" />
          <path d="M-0.9 1 L0.9 1 C1 5 2 8.5 4.2 10 L-4.2 10 C-2 8.5 -1 5 -0.9 1Z" />
        </g>
      )
  }
}

// Colonnes et rangées de la disposition standard des points.
const L = 30, C = 50, R = 70
const T = 30, B = 110, M = 70
const q1 = T + (B - T) / 3, q3 = T + (2 * (B - T)) / 3
const PIPS: Record<string, [number, number][]> = {
  '2': [[C, T], [C, B]],
  '3': [[C, T], [C, M], [C, B]],
  '4': [[L, T], [R, T], [L, B], [R, B]],
  '5': [[L, T], [R, T], [C, M], [L, B], [R, B]],
  '6': [[L, T], [R, T], [L, M], [R, M], [L, B], [R, B]],
  '7': [[L, T], [R, T], [C, (T + M) / 2], [L, M], [R, M], [L, B], [R, B]],
  '8': [[L, T], [R, T], [C, (T + M) / 2], [L, M], [R, M], [C, (M + B) / 2], [L, B], [R, B]],
  '9': [[L, T], [R, T], [L, q1], [R, q1], [C, M], [L, q3], [R, q3], [L, B], [R, B]],
  '10': [[L, T], [R, T], [C, (T + q1) / 2], [L, q1], [R, q1], [L, q3], [R, q3], [C, (q3 + B) / 2], [L, B], [R, B]],
}

const FACE_NAME: Partial<Record<Rank, string>> = { J: 'Valet', Q: 'Dame', K: 'Roi' }

function Face({ rank, suit, color }: { rank: Rank; suit: Suit; color: string }) {
  const half = (
    <g>
      {/* buste stylisé */}
      <path d="M34 70 L34 56 C34 48 40 44 50 44 C60 44 66 48 66 56 L66 70Z" fill="none" stroke={color} strokeWidth="1.1" />
      <circle cx="50" cy="36" r="7" fill="none" stroke={color} strokeWidth="1.1" />
      {rank === 'K' && <path d="M42 29 L42 22 L46 26 L50 20 L54 26 L58 22 L58 29Z" fill={color} />}
      {rank === 'Q' && <path d="M43 29 Q50 21 57 29" fill="none" stroke={color} strokeWidth="1.6" />}
      {rank === 'J' && <rect x="42.5" y="25" width="15" height="4" fill={color} />}
      <path d="M50 51 L50 70" stroke={color} strokeWidth="0.8" />
      <g transform="translate(59 59) scale(0.42)"><SuitShape suit={suit} color={color} /></g>
    </g>
  )
  return (
    <g>
      <rect x="22" y="18" width="56" height="104" fill="none" stroke={color} strokeWidth="0.8" />
      <rect x="22" y="18" width="56" height="104" fill={color} opacity="0.06" />
      <svg x="22" y="18" width="56" height="52" viewBox="22 18 56 52" overflow="hidden">{half}</svg>
      <g transform="rotate(180 50 70)">
        <svg x="22" y="18" width="56" height="52" viewBox="22 18 56 52" overflow="hidden">{half}</svg>
      </g>
      <line x1="22" y1="70" x2="78" y2="70" stroke={color} strokeWidth="0.8" />
      <title>{FACE_NAME[rank]}</title>
    </g>
  )
}

function Index({ rank, suit, color }: { rank: Rank; suit: Suit; color: string }) {
  return (
    <g>
      <text x="10" y="19" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontWeight="700" fontSize={rank === '10' ? 13 : 15} letterSpacing={rank === '10' ? -1 : 0} fill={color}>
        {rank}
      </text>
      <g transform="translate(10 28) scale(0.4)"><SuitShape suit={suit} color={color} /></g>
    </g>
  )
}

export default function PlayingCard({ card, hidden = false, width = 84 }: { card: Card; hidden?: boolean; width?: number }) {
  const h = (width * 140) / 100
  const pid = useId()
  if (hidden) {
    return (
      <svg width={width} height={h} viewBox="0 0 100 140" className="block shadow-[0_1px_0_rgba(0,0,0,0.25)]">
        <defs>
          <pattern id={pid} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#EFEDE7" strokeWidth="0.6" opacity="0.35" />
          </pattern>
        </defs>
        <rect x="0.5" y="0.5" width="99" height="139" rx="4" fill="#EFEDE7" stroke="#121211" strokeWidth="0.6" />
        <rect x="6" y="6" width="88" height="128" fill="#121211" />
        <rect x="6" y="6" width="88" height="128" fill={`url(#${pid})`} />
        <rect x="12" y="12" width="76" height="116" fill="none" stroke="#EFEDE7" strokeWidth="0.5" opacity="0.5" />
      </svg>
    )
  }
  const color = suitColor(card.suit)
  const isFace = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K'
  return (
    <svg width={width} height={h} viewBox="0 0 100 140" className="block shadow-[0_1px_0_rgba(0,0,0,0.25)]" aria-label={`${card.rank}${card.suit}`}>
      <rect x="0.5" y="0.5" width="99" height="139" rx="4" fill="#FBFAF6" stroke="#121211" strokeWidth="0.6" />
      <Index rank={card.rank} suit={card.suit} color={color} />
      <g transform="rotate(180 50 70)">
        <Index rank={card.rank} suit={card.suit} color={color} />
      </g>
      {card.rank === 'A' ? (
        <g transform={`translate(50 70) scale(${card.suit === 'S' ? 2.4 : 1.7})`}><SuitShape suit={card.suit} color={color} /></g>
      ) : isFace ? (
        <Face rank={card.rank} suit={card.suit} color={color} />
      ) : (
        PIPS[card.rank].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(0.8)${y > M ? ' rotate(180)' : ''}`}>
            <SuitShape suit={card.suit} color={color} />
          </g>
        ))
      )}
    </svg>
  )
}
