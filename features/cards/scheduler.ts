export type ReviewGrade = 0 | 1 | 2 | 3;

export type ReviewProgress = {
  cardId: string;
  due: number;
  interval: number;
  ease: number;
  repetitions: number;
  lapses: number;
  lastGrade: number | null;
};

export type SchedulableCard = {
  id: string;
  rank: number;
  basic: boolean;
};

export const DAY_IN_MILLISECONDS = 86_400_000;

export function currentReviewTimestamp(): number {
  return Date.now();
}

export function hasLowerPresentationPriority(card: SchedulableCard): boolean {
  return card.basic || card.rank <= 40;
}

export function nextInterval(
  progress: ReviewProgress | undefined,
  grade: ReviewGrade,
  lowerPriority: boolean,
): number {
  const previous = progress?.interval ?? 0;
  const ease = progress?.ease ?? 2.5;
  let days = 0;

  if (grade === 0) days = 1 / 1440;
  if (grade === 1) days = previous ? Math.max(10 / 1440, previous * 1.2) : 10 / 1440;
  if (grade === 2) days = previous ? Math.max(1, previous * ease) : 1;
  if (grade === 3) days = previous ? Math.max(4, previous * ease * 1.3) : 4;

  return lowerPriority && grade > 1 ? days * 1.8 : days;
}

export function scheduleReview(
  card: SchedulableCard,
  progress: ReviewProgress | undefined,
  grade: ReviewGrade,
  reviewedAt: number,
): ReviewProgress {
  const interval = nextInterval(progress, grade, hasLowerPresentationPriority(card));
  const easeDelta = grade === 0 ? -0.2 : grade === 1 ? -0.12 : grade === 3 ? 0.12 : 0;
  const ease = Math.min(3.2, Math.max(1.3, (progress?.ease ?? 2.5) + easeDelta));

  return {
    cardId: card.id,
    due: Math.round(reviewedAt + interval * DAY_IN_MILLISECONDS),
    interval,
    ease,
    repetitions: grade === 0 ? 0 : (progress?.repetitions ?? 0) + 1,
    lapses: (progress?.lapses ?? 0) + (grade === 0 ? 1 : 0),
    lastGrade: grade,
  };
}

export function intervalLabel(days: number): string {
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 1440))} мин`;
  if (days < 1) return `${Math.round(days * 24)} ч`;
  if (days < 30) return `${Math.round(days)} дн`;
  return `${Math.round(days / 30)} мес`;
}
