export const calculateNextSRS = (lastGrade, currentSrs) => {
  // lastGrade: 0=Again, 1=Hard, 2=Good, 3=Easy
  let { easeFactor = 2.5, interval = 0 } = currentSrs || {};
  // easeFactor (EF) càng cao -> nhớ tốt -> interval lớn

  // SuperMemo-2 simplified logic
  // Grade is 0-3. Map it to SM-2's 0-5 scale:
  // 0 <-> 1 (Again)
  // 1 <-> 3 (Hard)
  // 2 <-> 4 (Good)
  // 3 <-> 5 (Easy)
  let quality = 0;
  if (lastGrade === 0) quality = 1;
  else if (lastGrade === 1) quality = 3;
  else if (lastGrade === 2) quality = 4;
  else if (lastGrade === 3) quality = 5;

  if (quality < 3) {
    interval = 1;
  } else {
    if (interval === 0) {
      interval = 1; // First success
    } else if (interval === 1) {
      interval = 6; // Second success
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  return {
    easeFactor,
    interval,
    lastGrade,
    nextReviewAt,
  };
};
