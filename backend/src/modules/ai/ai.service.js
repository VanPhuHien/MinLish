import { GoogleGenerativeAI } from '@google/generative-ai';
import Card from '../../models/card.model.js';
import Lesson from '../../models/lesson.model.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: { responseMimeType: 'application/json' },
});

export const responseQuestionService = async (question, mode) => {
  if (mode === 'network') {
    return await responseQuestionNetworkService(question);
  } else {
    const keywordData = await extractKeywordsService(question);
    const keywords = keywordData.keywords || [];

    if (keywords.length === 0) {
      return {
        isValidQuestion: false,
        answer:
          'Không tìm thấy từ khóa hợp lệ trong câu hỏi để tra cứu hệ thống.',
      };
    }

    const foundItems = await queryMinLishDataForAI(keywords);
    if (foundItems.length !== 0) {
      return await responseQuestionMinLishService(question, foundItems);
    } else {
      return {
        isValidQuestion: true,
        answer:
          'Hệ thống MinLish hiện tại chưa có dữ liệu nào khớp với câu hỏi của bạn. Hãy thử chuyển sang chế độ tìm kiếm trên mạng!',
      };
    }
  }
};

export const extractKeywordsService = async (question) => {
  const prompt = `Trích xuất các từ khóa quan trọng nhất từ câu hỏi sau để dùng cho việc tìm kiếm bài học/từ vựng tiếng Anh trong Database: "${question}"
  Yêu cầu:
  - Ưu tiên giữ lại các từ / cụm từ tiếng Anh, hoặc chủ đề ngữ pháp cốt lõi.
  - Lược bỏ các từ để hỏi thông thường (ví dụ: "làm sao", "như thế nào", "cách để", "giúp tôi", "là gì").
  - Trả về kết quả bắt buộc dưới định dạng JSON bao gồm trường:
  + "keywords": một mảng các chuỗi (array of strings) chứa các từ khóa. (Nếu không có từ khóa nào hợp lý, trả về mảng rỗng []).`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const queryMinLishDataForAI = async (keywords) => {
  keywords = [...new Set(keywords)];
  let contextData = [];
  for (const keyword of keywords) {
    const searchRegex = new RegExp(keyword, 'i');

    const mainCard = await Card.findOne({
      $or: [
        { term: searchRegex },
        { translation: searchRegex },
        // Tìm theo cả từ tiếng anh hoặc nghĩa tiếng việt
      ],
    })
      .populate('deckId')
      .populate('topicId')
      .lean(); // Để trả về plain JS Object, nhẹ hơn và dễ stringify cho AI

    if (!mainCard) continue;
    // Lấy ra từ vựng gốc xác định được để đi tìm Lesson
    const termToSearch = mainCard.term;

    // Lấy 10 ngẫu nhiên cards liên quan cùng topic
    const relatedTopicCards = await Card.aggregate([
      {
        $match: {
          topicId: mainCard.topicId._id,
          _id: { $ne: mainCard._id },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    // Lấy 10 ngẫu nhiên cards liên quan cùng deck
    const relatedDeckCards = await Card.aggregate([
      {
        $match: {
          deckId: mainCard.deckId._id,
          _id: { $ne: mainCard._id },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    // Lấy 10 lesson chứa term ngẫu nhiên
    const relatedLessons = await Lesson.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: termToSearch, $options: 'i' } },
            { description: { $regex: termToSearch, $options: 'i' } },
          ],
        },
      },
      { $sample: { size: 10 } },
    ]);

    contextData.push(`
    [TỪ VỰNG CHÍNH]
    Từ vựng: ${mainCard.term} (${mainCard.pos})
    Phát âm: ${JSON.stringify(mainCard.phonetics)}
    Nghĩa tiếng Việt: ${mainCard.translation}
    Giải thích: ${JSON.stringify(mainCard.explanation)}
    Ví dụ: ${JSON.stringify(mainCard.examples)}
    Thuộc Topic: ${mainCard.topicId.name || 'Không rõ'}
    Thuộc Deck: ${mainCard.deckId.name || 'Không rõ'}

    [10 TỪ VỰNG LIÊN QUAN CÙNG TOPIC]
    ${relatedTopicCards.map((c) => `- ${c.term} (${c.pos}): ${c.translation}`).join('\n')}

    [10 TỪ VỰNG LIÊN QUAN CÙNG DECK]
    ${relatedDeckCards.map((c) => `- ${c.term} (${c.pos}): ${c.translation}`).join('\n')}

    [CÁC BÀI HỌC CÓ CHỨA TỪ NÀY]
    ${relatedLessons.map((l) => `- Bài học: "${l.title}" | Mô tả: "${l.description}"`).join('\n')}
  `);
  }
  return contextData;
};

export const responseQuestionNetworkService = async (question) => {
  // AI trả lời tự do
  const prompt = `Trả lời câu hỏi "${question}" bằng tiếng Việt.
  Vui lòng trả về kết quả dưới định dạng JSON bao gồm các trường:
  - isValidQuestion: true hoặc false
  - answer: câu trả lời
  (Nếu câu hỏi ngoài phạm vi học tiếng Anh thì trả về isValidQuestion là false và answer là "Câu hỏi không hợp lệ")`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const responseQuestionMinLishService = async (question, contextData) => {
  const prompt = `Dựa vào dữ liệu từ hệ thống MinLish sau đây:
  ---
  ${contextData}
  ---
  Hãy trả lời câu hỏi "${question}" bằng tiếng Việt.
  Vui lòng trả về kết quả dưới định dạng JSON bao gồm các trường:
  - isValidQuestion: true hoặc false
  - answer: câu trả lời
  (Nếu câu hỏi ngoài phạm vi học tiếng Anh hoặc dữ liệu không liên quan thì trả về isValidQuestion là false và answer là "Câu hỏi không hợp lệ")`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
