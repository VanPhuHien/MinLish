import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// ---- Import Models ----
import User from '../src/models/user.model.js';
import CefrLevel from '../src/models/cefrLevel.model.js';
import Tag from '../src/models/tag.model.js';
import Lesson from '../src/models/lesson.model.js';
import LessonSegment from '../src/models/lessonSegment.model.js';
import Deck from '../src/models/deck.model.js';
import Topic from '../src/models/topic.model.js';
import Card from '../src/models/card.model.js';
import UserLessonProgress from '../src/models/userLessonProgress.model.js';
import UserCardState from '../src/models/userCardState.model.js';

// Helper: random date in the past N days
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ---- 1. Clear all collections ----
  console.log('\n🗑️  Clearing old data...');
  await Promise.all([
    User.deleteMany({}),
    CefrLevel.deleteMany({}),
    Tag.deleteMany({}),
    Lesson.deleteMany({}),
    LessonSegment.deleteMany({}),
    Deck.deleteMany({}),
    Topic.deleteMany({}),
    Card.deleteMany({}),
    UserLessonProgress.deleteMany({}),
    UserCardState.deleteMany({}),
  ]);
  console.log('   Done.');

  // ---- 2. CEFR Levels ----
  console.log('\n📚 Seeding CEFR Levels...');
  const cefrData = [
    { code: 'a1', label: 'A1 - Beginner' },
    { code: 'a2', label: 'A2 - Elementary' },
    { code: 'b1', label: 'B1 - Intermediate' },
    { code: 'b2', label: 'B2 - Upper Intermediate' },
    { code: 'c1', label: 'C1 - Advanced' },
    { code: 'c2', label: 'C2 - Proficiency' },
  ];
  const cefrs = await CefrLevel.insertMany(cefrData);
  console.log(`   Inserted ${cefrs.length} CEFR levels.`);

  // ---- 3. Tags ----
  console.log('\n🏷️  Seeding Tags...');
  const tagData = [
    { code: 'daily', label: 'Daily Life' },
    { code: 'travel', label: 'Travel' },
    { code: 'business', label: 'Business' },
    { code: 'movies', label: 'Movies & TV' },
    { code: 'science', label: 'Science' },
    { code: 'ielts', label: 'IELTS' },
    { code: 'toeic', label: 'TOEIC' },
    { code: 'oxford', label: 'Oxford 3000' },
  ];
  const tags = await Tag.insertMany(tagData);
  const tagMap = Object.fromEntries(tags.map((t) => [t.code, t._id]));
  console.log(`   Inserted ${tags.length} tags.`);

  // ---- 4. Users ----
  console.log('\n👤 Seeding Users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const usersData = [
    { name: 'Admin MinLish', email: 'admin@minlish.com', role: 'admin', isVerified: true, createdAt: daysAgo(60) },
    { name: 'Nguyễn Văn A', email: 'user@minlish.com', role: 'user', isVerified: true, createdAt: daysAgo(45) },
    { name: 'Trần Thị B', email: 'tran.b@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(38) },
    { name: 'Lê Văn C', email: 'le.c@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(31) },
    { name: 'Phạm Thị D', email: 'pham.d@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(27) },
    { name: 'Hoàng Văn E', email: 'hoang.e@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(22) },
    { name: 'Ngô Thị F', email: 'ngo.f@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(20) },
    { name: 'Vũ Văn G', email: 'vu.g@gmail.com', role: 'user', isVerified: false, createdAt: daysAgo(17) },
    { name: 'Đặng Thị H', email: 'dang.h@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(15) },
    { name: 'Bùi Văn I', email: 'bui.i@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(12) },
    { name: 'Lý Thị K', email: 'ly.k@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(10) },
    { name: 'Trịnh Văn L', email: 'trinh.l@gmail.com', role: 'user', isVerified: true, isActive: false, banReason: 'Vi phạm điều khoản', createdAt: daysAgo(8) },
    { name: 'Mai Thị M', email: 'mai.m@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(6) },
    { name: 'Đinh Văn N', email: 'dinh.n@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(4) },
    { name: 'Cao Thị O', email: 'cao.o@gmail.com', role: 'user', isVerified: false, createdAt: daysAgo(2) },
    { name: 'Lưu Văn P', email: 'luu.p@gmail.com', role: 'user', isVerified: true, createdAt: daysAgo(1) },
  ];
  const users = await User.insertMany(
    usersData.map((u) => ({ passwordHash, isActive: true, avatarUrl: '', ...u }))
  );
  const normalUsers = users.filter((u) => u.role === 'user');
  console.log(`   Inserted ${users.length} users (1 admin + ${normalUsers.length} regular).`);

  // ---- 5. Lessons + Segments ----
  console.log('\n🎧 Seeding Lessons & Segments...');
  const lessonsData = [
    {
      title: 'Ordering Coffee at a Café',
      slug: 'ordering-coffee-at-a-cafe',
      description: 'Learn how to order your favorite drinks at an English café.',
      tagIds: [tagMap['daily']],
      cefrLevelIds: [cefrs[0]._id, cefrs[1]._id],
      modes: ['dictation', 'shadowing'],
      status: 'published',
      publishedAt: daysAgo(30),
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/coffee/640/360',
    },
    {
      title: 'Checking In at the Airport',
      slug: 'checking-in-at-the-airport',
      description: 'Essential phrases for navigating airport check-in procedures.',
      tagIds: [tagMap['travel']],
      cefrLevelIds: [cefrs[1]._id, cefrs[2]._id],
      modes: ['dictation', 'shadowing'],
      status: 'published',
      publishedAt: daysAgo(25),
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/airport/640/360',
    },
    {
      title: 'A Job Interview',
      slug: 'a-job-interview',
      description: 'Practice common job interview questions and answers.',
      tagIds: [tagMap['business']],
      cefrLevelIds: [cefrs[2]._id, cefrs[3]._id],
      modes: ['dictation'],
      status: 'published',
      publishedAt: daysAgo(20),
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/interview/640/360',
    },
    {
      title: 'Discussing a Movie Plot',
      slug: 'discussing-a-movie-plot',
      description: 'Talk about your favorite films in English.',
      tagIds: [tagMap['movies']],
      cefrLevelIds: [cefrs[3]._id],
      modes: ['dictation', 'shadowing'],
      status: 'published',
      publishedAt: daysAgo(14),
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/movies/640/360',
    },
    {
      title: 'IELTS Academic Reading Tips',
      slug: 'ielts-academic-reading-tips',
      description: 'Expert strategies for mastering IELTS reading section.',
      tagIds: [tagMap['ielts']],
      cefrLevelIds: [cefrs[4]._id],
      modes: ['dictation'],
      status: 'published',
      publishedAt: daysAgo(7),
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/ielts/640/360',
    },
    {
      title: 'The Science of Sleep',
      slug: 'the-science-of-sleep',
      description: 'An interesting lecture about sleep cycles and brain function.',
      tagIds: [tagMap['science']],
      cefrLevelIds: [cefrs[3]._id, cefrs[4]._id],
      modes: ['dictation', 'shadowing'],
      status: 'published',
      publishedAt: daysAgo(5),
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/sleep/640/360',
    },
    {
      title: 'Daily Small Talk',
      slug: 'daily-small-talk',
      description: 'Practice casual conversations for everyday situations.',
      tagIds: [tagMap['daily']],
      cefrLevelIds: [cefrs[0]._id],
      modes: ['shadowing'],
      status: 'draft',
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: '',
    },
  ];
  const lessons = await Lesson.insertMany(lessonsData);
  console.log(`   Inserted ${lessons.length} lessons.`);

  // Segments for each lesson
  const segmentTemplates = [
    { order: 1, startMs: 0, endMs: 4500, transcript: { original: 'Good morning! What can I get for you today?', normalized: 'good morning what can i get for you today' }, translation: 'Chào buổi sáng! Hôm nay tôi có thể giúp gì cho bạn?' },
    { order: 2, startMs: 4500, endMs: 9000, transcript: { original: 'I would like a large latte, please.', normalized: 'i would like a large latte please' }, translation: 'Cho tôi một ly latte cỡ lớn.' },
    { order: 3, startMs: 9000, endMs: 14000, transcript: { original: 'Would you like any sugar or cream with that?', normalized: 'would you like any sugar or cream with that' }, translation: 'Bạn có muốn thêm đường hoặc kem không?' },
    { order: 4, startMs: 14000, endMs: 19500, transcript: { original: 'No thank you, just black is fine.', normalized: 'no thank you just black is fine' }, translation: 'Không, cảm ơn, cà phê đen thôi.' },
    { order: 5, startMs: 19500, endMs: 25000, transcript: { original: 'That will be four dollars and fifty cents.', normalized: 'that will be four dollars and fifty cents' }, translation: 'Tổng cộng là bốn đô la năm mươi xu.' },
    { order: 6, startMs: 25000, endMs: 30000, transcript: { original: 'Here is your change. Have a great day!', normalized: 'here is your change have a great day' }, translation: 'Đây là tiền thừa của bạn. Chúc bạn một ngày tốt lành!' },
  ];

  let totalSegments = 0;
  for (const lesson of lessons) {
    const segments = segmentTemplates.map((s) => ({ ...s, lessonId: lesson._id }));
    await LessonSegment.insertMany(segments);
    totalSegments += segments.length;
  }
  console.log(`   Inserted ${totalSegments} segments across ${lessons.length} lessons.`);

  // ---- 6. Decks + Topics + Cards ----
  console.log('\n📖 Seeding Decks, Topics & Cards...');

  const decksData = [
    {
      title: 'Oxford 3000 Essential Words',
      slug: 'oxford-3000-essential-words',
      description: 'The most important 3000 words in English according to Oxford.',
      tagIds: [tagMap['oxford']],
      cefrLevelIds: [cefrs[0]._id, cefrs[1]._id, cefrs[2]._id],
      status: 'published',
      ownerType: 'system',
      publishedAt: daysAgo(60),
    },
    {
      title: 'IELTS Vocabulary Band 7+',
      slug: 'ielts-vocabulary-band-7-plus',
      description: 'High-frequency vocabulary for IELTS candidates aiming for Band 7 or above.',
      tagIds: [tagMap['ielts']],
      cefrLevelIds: [cefrs[3]._id, cefrs[4]._id],
      status: 'published',
      ownerType: 'system',
      publishedAt: daysAgo(45),
    },
    {
      title: 'Business English Essentials',
      slug: 'business-english-essentials',
      description: 'Key vocabulary and phrases for the professional workplace.',
      tagIds: [tagMap['business'], tagMap['toeic']],
      cefrLevelIds: [cefrs[2]._id, cefrs[3]._id],
      status: 'published',
      ownerType: 'system',
      publishedAt: daysAgo(30),
    },
    {
      title: 'Travel English',
      slug: 'travel-english',
      description: 'Everything you need to travel confidently in English-speaking countries.',
      tagIds: [tagMap['travel']],
      cefrLevelIds: [cefrs[1]._id, cefrs[2]._id],
      status: 'published',
      ownerType: 'system',
      publishedAt: daysAgo(20),
    },
  ];

  // Topics per deck
  const topicsPerDeck = [
    [{ name: 'Family & Relationships', slug: 'family-relationships', order: 1 }, { name: 'Food & Dining', slug: 'food-dining', order: 2 }, { name: 'Health & Body', slug: 'health-body', order: 3 }],
    [{ name: 'Academic Writing', slug: 'academic-writing', order: 1 }, { name: 'Social Issues', slug: 'social-issues', order: 2 }],
    [{ name: 'Meetings & Negotiations', slug: 'meetings-negotiations', order: 1 }, { name: 'Marketing & Sales', slug: 'marketing-sales', order: 2 }],
    [{ name: 'At the Airport', slug: 'at-the-airport', order: 1 }, { name: 'Hotel & Accommodation', slug: 'hotel-accommodation', order: 2 }],
  ];

  // Sample cards per topic
  const sampleCards = [
    { term: 'family', pos: 'noun', phonetics: [{ text: '/ˈfæm.ɪ.li/', audio: '', locale: 'en-US' }], translation: 'gia đình', explanation: { vi: 'Nhóm người có cùng huyết thống', en: 'A group of people related by blood or marriage' }, examples: { en: 'My family lives in Hanoi.', vi: 'Gia đình tôi sống ở Hà Nội.' } },
    { term: 'relationship', pos: 'noun', phonetics: [{ text: '/rɪˈleɪ.ʃən.ʃɪp/', audio: '', locale: 'en-US' }], translation: 'mối quan hệ', explanation: { vi: 'Cách hai người hoặc nhóm cảm nhận và hành xử với nhau', en: 'The way two people or groups feel and behave towards each other' }, examples: { en: 'They have a good relationship.', vi: 'Họ có mối quan hệ tốt.' } },
    { term: 'nutrition', pos: 'noun', phonetics: [{ text: '/njuːˈtrɪʃ.ən/', audio: '', locale: 'en-US' }], translation: 'dinh dưỡng', explanation: { vi: 'Quá trình cơ thể nhận và sử dụng thức ăn', en: 'The process of providing or obtaining food for health and growth' }, examples: { en: 'Good nutrition is essential for health.', vi: 'Dinh dưỡng tốt rất cần thiết cho sức khỏe.' } },
    { term: 'analyse', pos: 'verb', phonetics: [{ text: '/ˈæn.ə.laɪz/', audio: '', locale: 'en-GB' }], translation: 'phân tích', explanation: { vi: 'Xem xét chi tiết cấu trúc của cái gì đó', en: 'To examine in detail the structure of something' }, examples: { en: 'We need to analyse the data carefully.', vi: 'Chúng ta cần phân tích dữ liệu cẩn thận.' } },
    { term: 'negotiate', pos: 'verb', phonetics: [{ text: '/nɪˈɡoʊ.ʃi.eɪt/', audio: '', locale: 'en-US' }], translation: 'đàm phán', explanation: { vi: 'Thảo luận để đạt được thỏa thuận', en: 'To discuss something formally to reach an agreement' }, examples: { en: 'They negotiated a deal.', vi: 'Họ đã đàm phán một thỏa thuận.' } },
    { term: 'itinerary', pos: 'noun', phonetics: [{ text: '/aɪˈtɪn.ər.er.i/', audio: '', locale: 'en-US' }], translation: 'lịch trình', explanation: { vi: 'Kế hoạch chi tiết về hành trình', en: 'A planned route or journey' }, examples: { en: 'Our travel itinerary covers 5 cities.', vi: 'Lịch trình du lịch của chúng tôi bao gồm 5 thành phố.' } },
    { term: 'evidence', pos: 'noun', phonetics: [{ text: '/ˈev.ɪ.dəns/', audio: '', locale: 'en-US' }], translation: 'bằng chứng', explanation: { vi: 'Thông tin chỉ ra điều gì đó là đúng', en: 'Information indicating whether a belief is true' }, examples: { en: 'There is no evidence to support this claim.', vi: 'Không có bằng chứng nào hỗ trợ tuyên bố này.' } },
    { term: 'strategy', pos: 'noun', phonetics: [{ text: '/ˈstræt.ə.dʒi/', audio: '', locale: 'en-US' }], translation: 'chiến lược', explanation: { vi: 'Kế hoạch hành động được thiết kế để đạt mục tiêu', en: 'A plan of action designed to achieve a long-term goal' }, examples: { en: 'We need a new marketing strategy.', vi: 'Chúng ta cần một chiến lược marketing mới.' } },
  ];

  let totalTopics = 0;
  let totalCards = 0;
  const allCards = [];
  const allTopics = [];

  for (let di = 0; di < decksData.length; di++) {
    const deckTopics = topicsPerDeck[di];
    const totalCardsForDeck = deckTopics.length * sampleCards.length;

    const deck = await Deck.create({
      ...decksData[di],
      topicCount: deckTopics.length,
      cardCount: totalCardsForDeck,
    });

    for (const topicData of deckTopics) {
      const topic = await Topic.create({ ...topicData, deckId: deck._id, cardCount: sampleCards.length });
      allTopics.push(topic);
      totalTopics++;

      const cards = await Card.insertMany(
        sampleCards.map((c, idx) => ({ ...c, deckId: deck._id, topicId: topic._id, order: idx + 1 }))
      );
      allCards.push(...cards);
      totalCards += cards.length;
    }
  }
  console.log(`   Inserted 4 decks, ${totalTopics} topics, ${totalCards} cards.`);

  // ---- 7. User Lesson Progress ----
  console.log('\n📊 Seeding User Lesson Progress...');
  const publishedLessons = lessons.filter((l) => l.status === 'published');
  const progressRecords = [];

  for (const user of normalUsers.slice(0, 10)) {
    // Each user has progress on 2-4 random lessons
    const numLessons = randInt(2, 4);
    const userLessons = publishedLessons.slice(0, numLessons);
    for (const lesson of userLessons) {
      const pct = randInt(20, 100);
      progressRecords.push({
        userId: user._id,
        lessonId: lesson._id,
        dictation: { status: pct === 100 ? 'completed' : 'in_progress', progressPct: pct, lastSegmentOrder: Math.floor(pct / 100 * 6) },
        shadowing: { status: pct > 80 ? 'completed' : 'in_progress', progressPct: Math.max(0, pct - 20), lastSegmentOrder: Math.floor(Math.max(0, pct - 20) / 100 * 6) },
        createdAt: daysAgo(randInt(1, 30)),
      });
    }
  }
  await UserLessonProgress.insertMany(progressRecords);
  console.log(`   Inserted ${progressRecords.length} user lesson progress records.`);

  // ---- 8. User Card States (SRS) ----
  console.log('\n🃏 Seeding User Card States...');
  const cardStateRecords = [];
  const grades = [0, 1, 2, 3, 4, 5];

  for (const user of normalUsers.slice(0, 8)) {
    // Each user has learned 10-20 cards
    const numCards = randInt(10, 20);
    const userCards = allCards.slice(0, numCards);
    for (const card of userCards) {
      const grade = rand(grades);
      const interval = grade >= 3 ? randInt(1, 30) : 0;
      const topic = allTopics.find((t) => t._id.equals(card.topicId));
      cardStateRecords.push({
        userId: user._id,
        cardId: card._id,
        deckId: card.deckId,
        topicId: card.topicId,
        srs: {
          easeFactor: 2.5 + (grade - 3) * 0.1,
          interval,
          lastGrade: grade,
          nextReviewAt: interval > 0 ? new Date(Date.now() + interval * 24 * 60 * 60 * 1000) : new Date(),
        },
        flags: { starred: Math.random() > 0.8, hidden: false },
        createdAt: daysAgo(randInt(1, 30)),
      });
    }
  }
  await UserCardState.insertMany(cardStateRecords);
  console.log(`   Inserted ${cardStateRecords.length} user card state records.`);

  // ---- Done ----
  console.log('\n🎉 Seed completed successfully!');
  console.log('========================================');
  console.log(`  Users        : ${users.length} (1 admin + ${normalUsers.length} users)`);
  console.log(`  CEFR Levels  : ${cefrs.length}`);
  console.log(`  Tags         : ${tags.length}`);
  console.log(`  Lessons      : ${lessons.length} (${lessons.filter(l => l.status === 'published').length} published)`);
  console.log(`  Segments     : ${totalSegments}`);
  console.log(`  Decks        : 4`);
  console.log(`  Topics       : ${totalTopics}`);
  console.log(`  Cards        : ${totalCards}`);
  console.log(`  Lesson Progress: ${progressRecords.length}`);
  console.log(`  Card States  : ${cardStateRecords.length}`);
  console.log('========================================');
  console.log('\n🔑 Login credentials:');
  console.log('  Admin  → admin@minlish.com   / password123');
  console.log('  User   → user@minlish.com    / password123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
