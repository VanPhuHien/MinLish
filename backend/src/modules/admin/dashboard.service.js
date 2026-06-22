import User from '../../models/user.model.js';
import Lesson from '../../models/lesson.model.js';
import Deck from '../../models/deck.model.js';
import UserLessonProgress from '../../models/userLessonProgress.model.js';
import UserCardState from '../../models/userCardState.model.js';

export const getDashboardMetrics = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const totalLessons = await Lesson.countDocuments();
  const totalDecks = await Deck.countDocuments({ ownerType: 'system' });

  // User registration chart (6 tháng trước)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  const userChartRaw = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Format chart data
  const userRegistrationChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const record = userChartRaw.find(
      (r) => r._id.year === year && r._id.month === month
    );
    userRegistrationChart.push({
      label: `${month}/${year}`,
      count: record ? record.count : 0,
    });
  }

  const popularLessonsRaw = await UserLessonProgress.aggregate([
    {
      $group: {
        _id: '$lessonId',
        userCount: { $sum: 1 },
      },
    },
    { $sort: { userCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'lessons',
        localField: '_id',
        foreignField: '_id',
        as: 'lesson',
      },
    },
    { $unwind: '$lesson' },
    {
      $project: {
        _id: '$lesson._id',
        title: '$lesson.title',
        slug: '$lesson.slug',
        thumbnailUrl: '$lesson.thumbnailUrl',
        userCount: 1,
      },
    },
  ]);

  const popularDecksRaw = await UserCardState.aggregate([
    {
      $group: {
        _id: { deckId: '$deckId', userId: '$userId' },
      },
    },
    {
      $group: {
        _id: '$_id.deckId',
        userCount: { $sum: 1 },
      },
    },
    { $sort: { userCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'decks',
        localField: '_id',
        foreignField: '_id',
        as: 'deck',
      },
    },
    { $unwind: '$deck' },
    {
      $project: {
        _id: '$deck._id',
        title: '$deck.title',
        slug: '$deck.slug',
        coverImage: '$deck.coverImage',
        cardCount: '$deck.cardCount',
      },
    },
  ]);

  // Recent content
  const recentLessons = await Lesson.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('_id title slug status createdAt');

  const recentDecks = await Deck.find({ ownerType: 'system' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('_id title slug status createdAt');
  return {
    totalUsers,
    activeUsers,
    totalLessons,
    totalDecks,
    userRegistrationChart,
    popularLessons: popularLessonsRaw,
    popularDecks: popularDecksRaw,
    recentContent: {
      lessons: recentLessons,
      decks: recentDecks,
    },
  };
};
