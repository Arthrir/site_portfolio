export type Suit = 'S' | 'H' | 'D' | 'C'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export interface Card {
  rank: Rank
  suit: Suit
  id: number
}

export const SUITS: Suit[] = ['S', 'H', 'D', 'C']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
export const DECKS = 6

let uid = 0
export function buildShoe(): Card[] {
  const shoe: Card[] = []
  for (let d = 0; d < DECKS; d++)
    for (const suit of SUITS) for (const rank of RANKS) shoe.push({ rank, suit, id: uid++ })
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shoe[i], shoe[j]] = [shoe[j], shoe[i]]
  }
  return shoe
}

export function cardValue(r: Rank): number {
  if (r === 'A') return 11
  if (r === 'J' || r === 'Q' || r === 'K') return 10
  return parseInt(r, 10)
}

export function hiLo(r: Rank): number {
  const v = cardValue(r)
  if (v <= 6) return 1
  if (v >= 10) return -1
  return 0
}

export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0
  let aces = 0
  for (const c of cards) {
    total += cardValue(c.rank)
    if (c.rank === 'A') aces++
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return { total, soft: aces > 0 }
}

export const isBlackjack = (cards: Card[]) => cards.length === 2 && handValue(cards).total === 21

export type Move = 'H' | 'S' | 'D' | 'P'
export const MOVE_LABEL: Record<Move, string> = { H: 'Tirer', S: 'Rester', D: 'Doubler', P: 'Séparer' }

/** Stratégie de base : 6 jeux, S17, doublement après séparation autorisé. */
export function basicStrategy(
  cards: Card[],
  up: Rank,
  canDouble: boolean,
  canSplit: boolean,
): { move: Move; why: string } {
  const d = cardValue(up)
  const { total, soft } = handValue(cards)
  const dbl = (why: string, fallback: Move = 'H'): { move: Move; why: string } =>
    canDouble ? { move: 'D', why } : { move: fallback, why: why + ' (doublement impossible)' }

  if (canSplit && cards.length === 2 && cardValue(cards[0].rank) === cardValue(cards[1].rank)) {
    const p = cardValue(cards[0].rank)
    const split = (why: string) => ({ move: 'P' as Move, why })
    if (p === 11) return split('Toujours séparer les As : deux mains partant de 11.')
    if (p === 8) return split('Toujours séparer les 8 : 16 est la pire main du jeu.')
    if (p === 9 && d !== 7 && d < 10) return split('9-9 contre 2-9 (sauf 7) : deux mains de 19 potentielles.')
    if ((p === 7 || p === 2 || p === 3) && d <= 7) return split(`Paire de ${p} contre carte faible : séparer.`)
    if (p === 6 && d <= 6) return split('6-6 contre 2-6 : le croupier risque de sauter.')
    if (p === 4 && (d === 5 || d === 6)) return split('4-4 contre 5-6 uniquement (DAS).')
  }

  if (soft && cards.length >= 2) {
    if (total >= 20) return { move: 'S', why: 'Main souple 20+ : rester.' }
    if (total === 19) return d === 6 ? dbl('A-8 contre 6 : doubler.', 'S') : { move: 'S', why: '19 souple : rester.' }
    if (total === 18) {
      if (d <= 6) return dbl('18 souple contre 2-6 : doubler.', 'S')
      if (d <= 8) return { move: 'S', why: '18 souple contre 7-8 : rester.' }
      return { move: 'H', why: '18 souple contre 9-A : tirer, sans risque de sauter.' }
    }
    if (total === 17) return d >= 3 && d <= 6 ? dbl('17 souple contre 3-6 : doubler.') : { move: 'H', why: '17 souple : tirer.' }
    if (total >= 15) return d >= 4 && d <= 6 ? dbl(`${total} souple contre 4-6 : doubler.`) : { move: 'H', why: `${total} souple : tirer.` }
    return d >= 5 && d <= 6 ? dbl(`${total} souple contre 5-6 : doubler.`) : { move: 'H', why: `${total} souple : tirer.` }
  }

  if (total >= 17) return { move: 'S', why: `${total} dur : tirer ferait sauter dans ${Math.round(((13 - (21 - total)) / 13) * 100)} % des cas. Rester.` }
  if (total >= 13) return d <= 6
    ? { move: 'S', why: `${total} contre ${up} : le croupier saute souvent (35-42 %). Rester.` }
    : { move: 'H', why: `${total} contre ${up} : rester perd trop souvent. Tirer.` }
  if (total === 12) return d >= 4 && d <= 6
    ? { move: 'S', why: '12 contre 4-6 : laisser le croupier sauter.' }
    : { move: 'H', why: '12 contre 2, 3 ou 7+ : tirer.' }
  if (total === 11) return dbl('11 : meilleur total de doublement.')
  if (total === 10) return d <= 9 ? dbl('10 contre 2-9 : doubler.') : { move: 'H', why: '10 contre 10/A : tirer.' }
  if (total === 9) return d >= 3 && d <= 6 ? dbl('9 contre 3-6 : doubler.') : { move: 'H', why: '9 : tirer.' }
  return { move: 'H', why: `${total} : aucun risque de sauter. Tirer.` }
}

/* ---------------- Modèle TIPE (A. Doradoux & P. Aubert) ---------------- */
export type Outcome = 'blackjack' | 'win' | 'push' | 'loss' | 'loss-double'
export const H0 = 70
export const H_EXIT = 15
export interface Mood {
  h: number
  wins: number
  losses: number
}

/** Mise à jour asymétrique du bonheur H (aversion aux pertes, Kahneman-Tversky). */
export function updateMood(m: Mood, o: Outcome): Mood {
  let { h, wins, losses } = m
  if (o === 'blackjack') { h += 25; wins++; losses = 0 }
  else if (o === 'win') { h += 14 + wins * 2; wins++; losses = 0 }
  else if (o === 'push') h -= 2.5
  else if (o === 'loss-double') { h -= 28; losses++; wins = 0 }
  else { h -= 18 + losses * 3; losses++; wins = 0 }
  return { h: Math.max(0, Math.min(100, h)), wins, losses }
}

/** Probabilité de rester à la table pour la main suivante. */
export const retention = (h: number) => Math.min(0.99, Math.max(0.01, Math.pow(h / 100, 1.15)))

/** Avantage maison théorique (6 jeux, S17, DAS, BJ 3:2, stratégie de base). */
export const HOUSE_EDGE_BASIC = 0.0046
/** Joueur « intuitif » sans stratégie de base. */
export const HOUSE_EDGE_NAIVE = 0.02

/** Nombre de mains futures attendu (loi géométrique tronquée) avant départ. */
export function expectedHands(h: number, horizon = 200): number {
  const r = retention(h)
  return (r * (1 - Math.pow(r, horizon))) / (1 - r)
}
