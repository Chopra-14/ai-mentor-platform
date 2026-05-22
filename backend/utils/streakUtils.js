const calculateStreak = (activityDates) => {
  if (!activityDates || activityDates.length === 0) {
    return 0;
  }

  const uniqueDays = [
    ...new Set(
      activityDates.map((d) => {
        const date = new Date(d);
        return date.toISOString().slice(0, 10);
      })
    )
  ].sort((a, b) => b.localeCompare(a));

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round((prev - curr) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

module.exports = { calculateStreak };
