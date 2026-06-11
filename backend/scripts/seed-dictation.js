import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LessonSegment from '../src/models/lessonSegment.model.js';

dotenv.config();

const LESSON_ID = new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');
const segments = [
  {
    lessonId: LESSON_ID,
    order: 1,
    startMs: 0,
    endMs: 4200,
    transcript: {
      original: 'She sells seashells by the seashore.',
      normalized: 'she sells seashells by the seashore',
    },
    translation: 'Cô ấy bán vỏ sò bên bờ biển.',
  },
  {
    lessonId: LESSON_ID,
    order: 2,
    startMs: 4200,
    endMs: 9000,
    transcript: {
      original: 'The weather is nice today.',
      normalized: 'the weather is nice today',
    },
    translation: 'Thời tiết hôm nay đẹp.',
  },
  {
    lessonId: LESSON_ID,
    order: 3,
    startMs: 9000,
    endMs: 14500,
    transcript: {
      original: 'How long have you been learning English?',
      normalized: 'how long have you been learning english',
    },
    translation: 'Bạn đã học tiếng Anh bao lâu rồi?',
  },
  {
    lessonId: LESSON_ID,
    order: 4,
    startMs: 14500,
    endMs: 19000,
    transcript: {
      original: 'I would like a cup of coffee, please.',
      normalized: 'i would like a cup of coffee please',
    },
    translation: 'Cho tôi một tách cà phê.',
  },
  {
    lessonId: LESSON_ID,
    order: 5,
    startMs: 19000,
    endMs: 24000,
    transcript: {
      original: 'Can you speak more slowly?',
      normalized: 'can you speak more slowly',
    },
    translation: 'Bạn có thể nói chậm hơn không?',
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Xóa data cũ của lesson này nếu chạy lại
  await LessonSegment.deleteMany({ lessonId: LESSON_ID });
  console.log('Cleared old segments');

  const inserted = await LessonSegment.insertMany(segments);
  console.log(`Inserted ${inserted.length} segments`);
  console.log('lessonId để test:', LESSON_ID.toString());

  inserted.forEach((s) => {
    console.log(`   seg ${s.order}: ${s._id} — "${s.transcript.original}"`);
  });

  await mongoose.disconnect();
  console.log('Done');
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
