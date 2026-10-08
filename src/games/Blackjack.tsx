import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useLang } from '../i18n'
import PlayingCard from './blackjack/PlayingCard'
import {
  type Card, type Mood, type Move, type Outcome,
  DECKS, H0, H_EXIT, HOUSE_EDGE_BASIC, HOUSE_EDGE_NAIVE, MOVE_LABEL,
  basicStrategy, buildShoe, cardValue, expectedHands, handValue, hiLo, isBlackjack, updateMood,
} from './blackjack/engine'

interface Hand {
  cards: Card[]
  bet: number
  done: boolean
  doubled: boolean
  fromSplit: boolean
  result?: Outcome
  payout?: number
}
type Phase = 'bet' | 'play' | 'done'
interface G {
  shoe: Card[]
  rc: number
  bankroll: number
  bet: number
  hands: Hand[]
  active: number
  dealer: Card[]
  phase: Phase
  mood: Mood
  hist: number[]
  played: number
  wagered: number
  houseProfit: number
  decisions: number
  deviations: number
  comps: number
  message: string
  ragequit: boolean
}

const START = 1000
const CHIPS = [5, 25, 100, 500]
const MAX_HANDS = 4

const fresh = (): G => ({
  shoe: buildShoe(), rc: 0, bankroll: START, bet: 25, hands: [], active: 0, dealer: [], phase: 'bet',
  mood: { h: H0, wins: 0, losses: 0 }, hist: [H0], played: 0, wagered: 0, houseProfit: 0,
  decisions: 0, deviations: 0, comps: 0, message: 'Choisissez une mise, puis distribuez.', ragequit: false,
})

function draw(g: G): Card {
  if (g.shoe.length < 52) { g.shoe = buildShoe(); g.rc = 0 }
  const c = g.shoe.pop()!
  g.rc += hiLo(c.rank)
  return c
}

const canSplitHand = (g: G, h: Hand) =>
  h.cards.length === 2 && cardValue(h.cards[0].rank) === cardValue(h.cards[1].rank) &&
  g.hands.length < MAX_HANDS && g.bankroll >= h.bet
const canDoubleHand = (g: G, h: Hand) => h.cards.length === 2 && g.bankroll >= h.bet

function settle(g: G) {
  const live = g.hands.some((h) => handValue(h.cards).total <= 21)
  if (live) while (handValue(g.dealer).total < 17) g.dealer.push(draw(g)) // S17
  const d = handValue(g.dealer).total
  const parts: string[] = []
  for (const h of g.hands) {
    const p = handValue(h.cards).total
    let o: Outcome
    let pay = 0
    if (p > 21) o = h.doubled ? 'loss-double' : 'loss'
    else if (d > 21 || p > d) { o = 'win'; pay = h.bet * 2 }
    else if (p === d) { o = 'push'; pay = h.bet }
    else o = h.doubled ? 'loss-double' : 'loss'
    applyResult(g, h, o, pay)
    parts.push(o === 'win' ? `+${pay - h.bet}` : o === 'push' ? '0' : `-${h.bet}`)
  }
  const net = g.hands.reduce((s, h) => s + (h.payout ?? 0) - h.bet, 0)
  g.message = `Croupier ${d > 21 ? 'saute' : d}. ${g.hands.length > 1 ? `Mains : ${parts.join(' / ')}. ` : ''}Net ${net >= 0 ? '+' : ''}${net} $.`
  endRound(g)
}

function applyResult(g: G, h: Hand, o: Outcome, pay: number) {
  h.result = o
  h.payout = pay
  g.bankroll += pay
  g.houseProfit += h.bet - pay
  g.mood = updateMood(g.mood, o)
}

function endRound(g: G) {
  g.phase = 'done'
  g.hist = [...g.hist, g.mood.h].slice(-60)
  if (g.mood.h < H_EXIT) g.ragequit = true
  if (g.bet > g.bankroll) g.bet = Math.max(0, Math.min(g.bet, g.bankroll))
}

function advance(g: G) {
  const next = g.hands.findIndex((h) => !h.done)
  if (next === -1) settle(g)
  else g.active = next
}

const fmt = (n: number, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })

export default function Blackjack({ onClose }: { onClose: () => void }) {
  const { tr } = useLang()
  const [g, setG] = useState<G>(fresh)
  const [hint, setHint] = useState(true)
  const [count, setCount] = useState(false)
  const [view, setView] = useState<'joueur' | 'banque'>('joueur')

  const mutate = useCallback((fn: (d: G) => void) => {
    setG((prev) => {
      const d: G = { ...prev, hands: prev.hands.map((h) => ({ ...h, cards: [...h.cards] })), dealer: [...prev.dealer], shoe: [...prev.shoe] }
      fn(d)
      return d
    })
  }, [])

  const hand = g.phase === 'play' ? g.hands[g.active] : undefined
  const up = g.dealer[0]
  const advice = hand && up ? basicStrategy(hand.cards, up.rank, canDoubleHand(g, hand), canSplitHand(g, hand)) : undefined

  const act = useCallback((m: Move) => {
    mutate((d) => {
      if (d.phase !== 'play') return
      const h = d.hands[d.active]
      if (m === 'D' && !canDoubleHand(d, h)) return
      if (m === 'P' && !canSplitHand(d, h)) return
      const best = basicStrategy(h.cards, d.dealer[0].rank, canDoubleHand(d, h), canSplitHand(d, h)).move
      d.decisions++
      if (best !== m) d.deviations++
      if (m === 'H') {
        h.cards.push(draw(d))
        if (handValue(h.cards).total >= 21) h.done = true
      } else if (m === 'S') h.done = true
      else if (m === 'D') {
        d.bankroll -= h.bet; d.wagered += h.bet; h.bet *= 2; h.doubled = true
        h.cards.push(draw(d)); h.done = true
      } else {
        d.bankroll -= h.bet; d.wagered += h.bet
        const aces = h.cards[0].rank === 'A'
        const a: Hand = { cards: [h.cards[0], draw(d)], bet: h.bet, done: aces, doubled: false, fromSplit: true }
        const b: Hand = { cards: [h.cards[1], draw(d)], bet: h.bet, done: aces, doubled: false, fromSplit: true }
        if (handValue(a.cards).total === 21) a.done = true
        if (handValue(b.cards).total === 21) b.done = true
        d.hands.splice(d.active, 1, a, b)
      }
      d.message = d.hands.length > 1 ? `Main ${d.active + 1} sur ${d.hands.length}.` : 'Votre décision.'
      if (d.hands[d.active].done) advance(d)
    })
  }, [mutate])

  const deal = useCallback(() => {
    mutate((d) => {
      if (d.phase === 'play' || d.ragequit || d.bet <= 0 || d.bet > d.bankroll) return
      d.bankroll -= d.bet; d.wagered += d.bet; d.played++
      const p = [draw(d)]; d.dealer = [draw(d)]; p.push(draw(d)); d.dealer.push(draw(d))
      d.hands = [{ cards: p, bet: d.bet, done: false, doubled: false, fromSplit: false }]
      d.active = 0
      d.phase = 'play'
      d.message = 'Votre décision.'
      const pbj = isBlackjack(p), dbj = isBlackjack(d.dealer)
      if (pbj || dbj) {
        const h = d.hands[0]; h.done = true
        if (pbj && dbj) { applyResult(d, h, 'push', h.bet); d.message = 'Deux blackjacks : mise rendue.' }
        else if (pbj) { applyResult(d, h, 'blackjack', h.bet * 2.5); d.message = `Blackjack naturel, payé 3:2 : +${fmt(h.bet * 1.5)} $.` }
        else { applyResult(d, h, 'loss', 0); d.message = 'Le croupier a blackjack.' }
        endRound(d)
      }
    })
  }, [mutate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'BUTTON' || t.tagName === 'INPUT') && (e.key === 'Enter' || e.key === ' ')) return
      const k = e.key.toLowerCase()
      if (k === 'h') act('H'); else if (k === 's') act('S'); else if (k === 'd') act('D'); else if (k === 'p') act('P')
      else if (k === 'enter' || k === ' ') { e.preventDefault(); deal() }
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [act, deal, onClose])

  const hideHole = g.phase === 'play'
  const dealerShown = hideHole ? g.dealer.slice(0, 1) : g.dealer
  const decksLeft = g.shoe.length / 52
  const trueCount = g.rc / Math.max(0.5, decksLeft)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex flex-col bg-paper text-ink"
      role="dialog" aria-modal="true" aria-label="Blackjack"
    >
      {/* En-tête */}
      <header className="flex items-stretch border-b border-ink font-mono text-[11px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-3 border-r border-line px-5 py-3">
          <span className="h-2 w-2 bg-signal" />
          <span className="whitespace-nowrap">BJ-21 / Fiche technique</span>
        </div>
        <div className="hidden items-center gap-6 px-5 text-mute md:flex">
          <span>{DECKS} jeux</span><span>Croupier S17</span><span>BJ 3:2</span><span>Double après séparation</span>
        </div>
        <button onClick={onClose} className="ml-auto border-l border-line px-5 hover:bg-ink hover:text-paper">
          {tr("Fermer", "Close")}&nbsp;&nbsp;<span className="text-mute">ESC</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* Table */}
        <section className="flex shrink-0 flex-col lg:min-h-0 lg:flex-1 lg:shrink">
          <div className="relative flex min-h-[480px] flex-1 flex-col justify-between overflow-auto bg-[#173026] px-4 py-8 text-paper sm:px-8">
            <div className="pointer-events-none absolute inset-3 border border-paper/10" />
            <div className="relative flex justify-center">
              <Row label="Croupier" value={g.dealer.length ? (hideHole ? `${handValue(dealerShown).total} + ?` : String(handValue(g.dealer).total)) : '—'}>
                {g.dealer.map((c, i) => (
                  <CardIn key={c.id} card={c} i={i} hidden={hideHole && i === 1}
                    delay={i < 2 ? (i * 2 + 1) * STEP : (i - 2) * 0.3 + 0.35} />
                ))}
              </Row>
            </div>

            <div className="relative my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-paper/15" />
              <span className="min-h-[1.25rem] max-w-[56ch] text-center font-mono text-xs text-paper/90">{g.message}</span>
              <span className="h-px flex-1 bg-paper/15" />
            </div>

            <div className="relative flex flex-wrap items-start justify-center gap-x-10 gap-y-6">
              {g.hands.length === 0 && <Row label="Joueur" value="—">{null}</Row>}
              {g.hands.map((h, hi) => {
                const v = handValue(h.cards)
                const isActive = g.phase === 'play' && hi === g.active && g.hands.length > 1
                const initial = !h.fromSplit && g.hands.length === 1
                return (
                  <div key={`${h.cards[0].id}-${hi}`}
                    className={`border-t pt-3 transition-[border-color,opacity] duration-300 ${isActive ? 'border-signal' : 'border-transparent'} ${g.phase === 'play' && g.hands.length > 1 && !isActive ? 'opacity-60' : ''}`}>
                    <Row
                      label={g.hands.length > 1 ? `Main ${hi + 1}` : 'Joueur'}
                      value={`${v.soft && v.total < 21 ? 'souple ' : ''}${v.total}${v.total > 21 ? ' saute' : ''}`}
                      extra={`${h.bet} $${h.doubled ? ' ×2' : ''}`}
                      result={h.result}
                    >
                      {h.cards.map((c, i) => <CardIn key={c.id} card={c} i={i} delay={initial && i < 2 ? i * 2 * STEP : 0} />)}
                    </Row>
                  </div>
                )
              })}
            </div>

            <div className={`relative mt-8 grid gap-px font-mono text-[11px] sm:grid-cols-2 ${hint || count ? 'border-t border-paper/15' : ''}`}>
              <div className={`h-[72px] overflow-hidden px-1 pt-3 ${hint ? '' : 'invisible'}`} aria-hidden={!hint}>
                <div className="uppercase tracking-[0.12em] text-paper/60">Stratégie de base</div>
                <div className="mt-1 line-clamp-2 text-sm">
                  {advice ? <><span className="text-signal">{MOVE_LABEL[advice.move].toUpperCase()}</span> <span className="text-paper/80">{advice.why}</span></> : <span className="text-paper/60">En attente d'une main.</span>}
                </div>
              </div>
              <div className={`grid h-[72px] grid-cols-3 gap-2 px-1 pt-3 ${count ? '' : 'invisible'}`} aria-hidden={!count}>
                <Stat dark k="Compte Hi-Lo" v={(g.rc > 0 ? '+' : '') + g.rc} />
                <Stat dark k="Compte vrai" v={(trueCount > 0 ? '+' : '') + fmt(trueCount, 1)} />
                <Stat dark k="Sabot" v={`${g.shoe.length} c.`} />
              </div>
            </div>

            {g.ragequit && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/85 p-6">
                <div className="max-w-md border border-paper/30 bg-ink p-6 text-paper">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-signal">Rupture · H &lt; {H_EXIT} %</div>
                  <p className="mt-3 font-serif text-2xl leading-tight">Le joueur quitte la table.</p>
                  <p className="mt-3 text-sm text-paper/70">L'aversion aux pertes cumulées a fait passer l'indice de bonheur sous le seuil critique, après {g.played} mains. Profit de la banque : {fmt(g.houseProfit)} $.</p>
                  <button onClick={() => setG(fresh())} className="mt-5 border border-paper px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] hover:bg-paper hover:text-ink">Nouveau joueur</button>
                </div>
              </div>
            )}
          </div>

          {/* Commandes */}
          <div className="grid border-t border-ink md:grid-cols-[auto_1fr_auto]">
            <div className="flex gap-6 border-b border-line px-5 py-3 md:border-r md:border-b-0">
              <Stat k="Bankroll" v={`${fmt(g.bankroll)} $`} />
              <Stat k="Mise" v={`${fmt(g.bet)} $`} />
            </div>
            <div className="flex flex-wrap items-center gap-2 px-5 py-3">
              {g.phase !== 'play' ? (
                <>
                  {CHIPS.map((c) => (
                    <button key={c} disabled={g.bet + c > g.bankroll || g.ragequit} onClick={() => mutate((d) => { d.bet += c })}
                      className="h-10 min-w-[52px] rounded-full border border-ink px-3 font-mono text-xs tabular-nums transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-25">+{c}</button>
                  ))}
                  <button onClick={() => mutate((d) => { d.bet = 0 })} disabled={g.bet === 0} className="px-2 disabled:opacity-30 py-1.5 font-mono text-xs text-mute hover:text-ink">Effacer</button>
                  <button onClick={deal} disabled={g.bet <= 0 || g.bet > g.bankroll || g.ragequit}
                    className="ml-auto h-10 bg-ink px-5 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:bg-signal disabled:opacity-30">{g.phase === 'done' ? 'Nouvelle main' : 'Distribuer'} <span className="opacity-50">↵</span></button>
                </>
              ) : (
                (['H', 'S', 'D', 'P'] as Move[]).map((m) => {
                  const ok = hand && (m === 'D' ? canDoubleHand(g, hand) : m === 'P' ? canSplitHand(g, hand) : true)
                  const rec = hint && advice?.move === m
                  return (
                    <button key={m} disabled={!ok} onClick={() => act(m)}
                      className={`flex h-10 flex-1 items-center justify-center gap-2 border px-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors disabled:pointer-events-none disabled:opacity-20 sm:flex-none sm:px-4 ${rec ? 'border-signal text-signal' : 'border-ink hover:bg-ink hover:text-paper'}`}>
                      {MOVE_LABEL[m]} <span className="opacity-50">{m}</span>
                    </button>
                  )
                })
              )}
            </div>
            <div className="flex items-center gap-4 border-t border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] md:border-t-0 md:border-l">
              <Toggle on={hint} set={setHint} label="Conseil" />
              <Toggle on={count} set={setCount} label="Hi-Lo" />
            </div>
          </div>
        </section>

        {/* Panneau TIPE */}
        <aside className="flex w-full shrink-0 flex-col border-t border-ink lg:w-[360px] lg:border-t-0 lg:border-l">
          <div className="border-b border-line px-5 pt-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">TIPE — Arthur Doradoux &amp; Paul Aubert</div>
            <div className="mt-3 flex">
              {(['joueur', 'banque'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`-mb-px border-b-2 px-3 pb-2 font-mono text-xs uppercase tracking-[0.12em] ${view === v ? 'border-signal text-ink' : 'border-transparent text-mute hover:text-ink'}`}>
                  {v === 'joueur' ? 'Joueur' : 'Banque'}
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 py-5 lg:min-h-0 lg:flex-1 lg:overflow-auto">
            {view === 'joueur' ? <PlayerView g={g} /> : <BankView g={g} />}
          </div>
        </aside>
      </div>
    </motion.div>
  )
}

const RESULT: Record<Outcome, string> = { blackjack: 'blackjack', win: 'gagné', push: 'égalité', loss: 'perdu', 'loss-double': 'perdu x2' }

const FACE: React.CSSProperties = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

const STEP = 0.14
const CARD_W = 84
const OVERLAP = 56 // les cartes se chevauchent : seul l'index de gauche reste visible

/** Carte qui glisse depuis le sabot puis se retourne. Ne s'anime qu'au montage (clé = id de carte). */
function CardIn({ card, i, hidden = false, delay = 0 }: { card: Card; i: number; hidden?: boolean; delay?: number }) {
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true }, [])
  const flipDelay = mounted.current ? 0 : delay + 0.22
  return (
    <motion.div
      style={{ perspective: 800, marginLeft: i === 0 ? 0 : -OVERLAP, zIndex: i }}
      className="relative"
      initial={{ opacity: 0, x: 160, y: -60 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: hidden ? 180 : 0 }}
        transition={{ duration: 0.4, delay: hidden ? 0 : flipDelay, ease: 'easeInOut' }}
      >
        <div style={FACE} className="shadow-[0_2px_6px_rgba(0,0,0,0.25)]"><PlayingCard card={card} width={CARD_W} /></div>
        <div className="absolute inset-0" style={{ ...FACE, transform: 'rotateY(180deg)' }}><PlayingCard card={card} width={CARD_W} hidden /></div>
      </motion.div>
    </motion.div>
  )
}

const RESULT_TONE: Record<Outcome, string> = {
  blackjack: 'border-signal text-signal', win: 'border-paper text-paper', push: 'border-paper/40 text-paper/70',
  loss: 'border-paper/20 text-paper/45', 'loss-double': 'border-paper/20 text-paper/45',
}

function Row({ label, value, extra, result, children }: { label: string; value: string; extra?: string; result?: Outcome; children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="mb-3 flex h-5 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em]">
        <span className="text-paper/50">{label}</span>
        <span className="tabular-nums text-paper">{value}</span>
        {extra && <span className="tabular-nums text-paper/50">{extra}</span>}
        {result && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className={`border px-1.5 py-px text-[10px] ${RESULT_TONE[result]}`}>{RESULT[result]}</motion.span>
        )}
      </div>
      <div className="flex" style={{ minHeight: CARD_W * 1.4, minWidth: CARD_W }}>
        {children ?? <div className="rounded-[4px] border border-dashed border-paper/15" style={{ width: CARD_W, height: CARD_W * 1.4 }} />}
      </div>
    </div>
  )
}

function Stat({ k, v, dark, accent }: { k: string; v: string; dark?: boolean; accent?: boolean }) {
  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-[0.12em] ${dark ? 'text-paper/60' : 'text-mute'}`}>{k}</div>
      <div className={`font-mono text-base tabular-nums ${accent ? 'text-signal' : ''}`}>{v}</div>
    </div>
  )
}

function Toggle({ on, set, label }: { on: boolean; set: (b: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-2">
      <span className={`inline-block h-3 w-3 border border-ink ${on ? 'bg-signal' : ''}`} />
      <span className={on ? '' : 'text-mute'}>{label}</span>
    </button>
  )
}

function Spark({ data, threshold }: { data: number[]; threshold: number }) {
  const w = 300, h = 36
  const n = Math.max(2, data.length)
  const pts = data.map((v, i) => `${(i / (n - 1)) * w},${h - (v / 100) * h}`).join(' ')
  const ty = h - (threshold / 100) * h
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" preserveAspectRatio="none" height={h} aria-label="Historique de H">
      <line x1="0" x2={w} y1={ty} y2={ty} stroke="var(--color-signal)" strokeDasharray="3 3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <polyline points={pts} fill="none" stroke="var(--color-ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function PlayerView({ g }: { g: G }) {
  const h = g.mood.h
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Indice de bonheur H</div>
      <div className="font-serif text-6xl leading-none tabular-nums">{fmt(h)}<span className="text-2xl text-mute">%</span></div>
      <div className="relative mt-4 h-2 border border-ink">
        <motion.div className="h-full bg-ink" animate={{ width: `${h}%` }} transition={{ duration: 0.4 }} />
        <div className="absolute -top-1 -bottom-1 w-px bg-signal" style={{ left: `${H_EXIT}%` }} />
      </div>
      <div className="relative mt-1 h-4 font-mono text-[10px] text-mute">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2 text-signal" style={{ left: `${H_EXIT}%` }}>départ {H_EXIT}</span>
        <span className="absolute right-0">100</span>
      </div>
      <div className="mt-4"><Spark data={g.hist} threshold={H_EXIT} /></div>
      <p className="mt-4 text-sm leading-relaxed">
        Chaque perte fait baisser H plus qu'un gain ne le fait monter (aversion aux pertes) ; sous {H_EXIT} %, le joueur quitte la table.
      </p>
    </div>
  )
}

function BankView({ g }: { g: G }) {
  const devRate = g.decisions ? g.deviations / g.decisions : 0
  const edge = HOUSE_EDGE_BASIC + (HOUSE_EDGE_NAIVE - HOUSE_EDGE_BASIC) * devRate
  const avgBet = g.played ? g.wagered / g.played : g.bet || 25
  const ev = edge * avgBet
  const value = ev * expectedHands(g.mood.h)
  const items: [string, string, string][] = [
    ['Avantage de la maison', `${fmt(edge * 100, 2)} %`, 'Part moyenne de chaque mise que la banque garde, selon le jeu du joueur.'],
    ['Gain espéré par main', `${fmt(ev, 2)} $`, 'Avantage multiplié par la mise moyenne.'],
    ['Valeur client attendue', `${fmt(value, 0)} $`, 'Gain par main multiplié par le nombre de mains que H laisse espérer avant le départ.'],
  ]
  return (
    <div className="space-y-5">
      {items.map(([k, v, why]) => (
        <div key={k}>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">{k}</div>
          <div className="font-serif text-4xl leading-none tabular-nums">{v}</div>
          <p className="mt-1 text-sm text-mute">{why}</p>
        </div>
      ))}
    </div>
  )
}
