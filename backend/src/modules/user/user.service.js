import UserSegmentProgress from '../../models/userSegmentProgress.model.js';
import LessonSegment from '../../models/lessonSegment.model.js';
import Lesson from '../../models/lesson.model.js';
import UserCardState from '../../models/userCardState.model.js';
import AppError from '../../utils/AppError.js';
import { config } from '../../config/env.js';
import {
  USER_CARD_STATE,
  LESSON,
  USER_SEGMENT_PROGRESS,
} from '../../constants/codes/index.js';
import { calculateNextSRS } from '../../utils/srs.util.js';
import { generateQuizOptions } from '../deck/deck.service.js';

export const evaluatePronunciation = async (audioUrl, referenceText) => {
  try {
    if (!config.azureSpeechKey || !config.azureSpeechRegion) {
      console.warn(
        'Azure Speech API keys not configured. Returning default score 0.'
      );
      return 0;
    }

    // 1. Fetch audio từ URL
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      console.error('Failed to fetch audio from:', audioUrl);
      return 0;
    }
    const audioBuffer = await audioResponse.arrayBuffer();

    // 2. Chuẩn bị tham số đánh giá phát âm
    const assessmentParams = {
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
      Dimension: 'Comprehensive',
    };
    const pronunciationAssessmentHeader = Buffer.from(
      JSON.stringify(assessmentParams)
    ).toString('base64');

    // 3. POST request to Azure REST API
    const endpoint = `https://${config.azureSpeechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;
    const azureResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.azureSpeechKey,
        Accept: 'application/json',
        'Content-Type': 'audio/wav',
        'Pronunciation-Assessment': pronunciationAssessmentHeader,
      },
      body: audioBuffer,
    });
    if (!azureResponse.ok) {
      const errText = await azureResponse.text();
      //console.error('Azure API Error:', errText);
      return 0; // Return 0 khi fail để không crash app
    }
    const result = await azureResponse.json();

    if (result.NBest && result.NBest.length > 0) {
      const best = result.NBest[0];
      const pronScore =
        best.PronScore !== undefined
          ? best.PronScore
          : best.PronunciationAssessment
            ? best.PronunciationAssessment.PronScore
            : undefined;
      //console.log(result);

      if (pronScore !== undefined) {
        return pronScore;
      }
    }
    return 0;
  } catch (error) {
    //console.error('[AzureSpeech] Error in evaluatePronunciation:', error);
    return 0;
  }
};

export const getLessonSegmentsProgress = async (userId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError(LESSON.LESSON_NOT_FOUND, 404);
  }
  return await UserSegmentProgress.find({ userId, lessonId });
};

export const getSegmentProgress = async (userId, lessonId, segmentId) => {
  const progress = await UserSegmentProgress.findOne({
    userId,
    lessonId,
    segmentId,
  });

  if (!progress) {
    throw new AppError(USER_SEGMENT_PROGRESS.SEGMENT_PROGRESS_NOT_FOUND, 404);
  }
  return progress;
};

export const updateSegmentProgress = async (
  userId,
  lessonId,
  segmentId,
  data
) => {
  const segment = await LessonSegment.findOne({ _id: segmentId, lessonId });
  if (!segment) {
    throw new AppError(USER_SEGMENT_PROGRESS.SEGMENT_NOT_FOUND_IN_LESSON, 404);
  }

  const set = {};
  const max = {};
  if (data.dictation) {
    if (data.dictation.attemptCount !== undefined) {
      set['dictation.attemptCount'] = data.dictation.attemptCount;
    }
    if (data.dictation.hintUsedCount !== undefined) {
      set['dictation.hintUsedCount'] = data.dictation.hintUsedCount;
    }

    // Tính điểm Dictation dựa vào số lần thử và số lần dùng gợi ý
    const attempt = data.dictation.attemptCount || 1;
    const hints = data.dictation.hintUsedCount || 0;
    const score = Math.max(0, 100 - (attempt - 1) * 10 - hints * 5);
    max['dictation.bestScore'] = score;
  }

  if (data.shadowing) {
    if (data.shadowing.attemptCount !== undefined) {
      set['shadowing.attemptCount'] = data.shadowing.attemptCount;
    }
    if (data.shadowing.latestAudioUrl !== undefined) {
      set['shadowing.latestAudioUrl'] = data.shadowing.latestAudioUrl;
    }

    // Đánh giá phát âm qua Azure Speech API
    let aiScore = 0;
    if (data.shadowing.latestAudioUrl) {
      const referenceText =
        segment.transcript.normalized || segment.transcript.original;
      aiScore = await evaluatePronunciation(
        data.shadowing.latestAudioUrl,
        referenceText
      );
    }

    const attempt = data.shadowing.attemptCount || 1;
    const finalScore = Math.max(0, Math.round(aiScore) - (attempt - 1) * 10);
    //console.log(`[DEBUG] AI Score: ${aiScore}, Attempt: ${attempt}, Final Score: ${finalScore}`);
    max['shadowing.bestScore'] = finalScore;
  }
  set.updatedAt = new Date();

  const updatePayload = { $set: set };
  if (Object.keys(max).length > 0) {
    updatePayload.$max = max;
  }

  const progress = await UserSegmentProgress.findOneAndUpdate(
    { userId, lessonId, segmentId },
    updatePayload,
    { new: true, upsert: true }
  );
  return progress;
};

export const getCardStates = async (userId, queryParams) => {
  const { deckId, topicId, due, starred, hidden, page, limit } = queryParams;
  const filter = { userId };
  if (deckId) filter.deckId = deckId;
  if (topicId) filter.topicId = topicId;
  if (starred !== undefined) filter['flags.starred'] = starred;
  if (hidden !== undefined) filter['flags.hidden'] = hidden;
  if (due) {
    filter['srs.nextReviewAt'] = { $lte: new Date() };
  }
  const skip = (page - 1) * limit;
  const [data, totalItems] = await Promise.all([
    (
      await UserCardState.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('cardId')
    ).filter((state) => state.cardId != null),
    UserCardState.countDocuments(filter),
  ]);
  const items = await Promise.all(
    data.map(async (state) => {
      const stateObj = state.toObject();
      if (stateObj.cardId) {
        stateObj.cardId.quizOptions = await generateQuizOptions(
          stateObj.topicId || stateObj.cardId.topicId,
          stateObj.cardId.term,
          stateObj.cardId._id
        );
      }
      return stateObj;
    })
  );

  return {
    data: items,
    pagination: {
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    },
  };
};

export const getCardState = async (userId, cardId) => {
  const cardState = await UserCardState.findOne({ userId, cardId }).populate(
    'cardId'
  );
  if (!cardState) {
    throw new AppError(USER_CARD_STATE.CARD_STATE_NOT_FOUND, 404);
  }
  const stateObj = cardState.toObject();
  if (stateObj.cardId) {
    stateObj.cardId.quizOptions = await generateQuizOptions(
      stateObj.topicId || stateObj.cardId.topicId,
      stateObj.cardId.term,
      stateObj.cardId._id
    );
  }

  return stateObj;
};

export const upsertCardState = async (userId, cardId, data) => {
  const { deckId, topicId, srs, flags } = data;
  let cardState = await UserCardState.findOne({ userId, cardId });
  if (!cardState) {
    // Create new
    if (!deckId || !topicId) {
      throw new AppError(USER_CARD_STATE.CARD_STATE_CREATE_MISSING_DATA, 400);
    }
    cardState = new UserCardState({
      userId,
      cardId,
      deckId,
      topicId,
      flags: flags || {},
    });
  } else {
    // Update nếu tồn tại rồi
    if (deckId) cardState.deckId = deckId;
    if (topicId) cardState.topicId = topicId;
    if (flags) {
      if (flags.starred !== undefined) cardState.flags.starred = flags.starred;
      if (flags.hidden !== undefined) cardState.flags.hidden = flags.hidden;
    }
  }
  if (srs && srs.lastGrade !== undefined) {
    cardState.srs = calculateNextSRS(srs.lastGrade, cardState.srs);
  }
  await cardState.save();
  return cardState;
};
