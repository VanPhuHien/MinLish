import exceljs from 'exceljs';
import Deck from '../../models/deck.model.js';
import Topic from '../../models/topic.model.js';
import Card from '../../models/card.model.js';
import User from '../../models/user.model.js';
import AppError from '../../utils/AppError.js';
import { COMMON, ADMIN } from '../../constants/codes/index.js';
import {
  getFileBufferFromS3,
  extractKeyFromUrl,
} from '../file/file.service.js';

const normalizeTermKey = (term) => (term ? term.trim().toLowerCase() : '');

const runImportSimulation = ({ parsedRows, existingByTerm, mode }) => {
  const REQUIRED_COLUMNS = ['term', 'translation'];
  const summary = {
    totalRows: parsedRows.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    mode,
    requiredColumns: REQUIRED_COLUMNS,
    errors: [],
  };
  const touchedTerms = new Set();

  parsedRows.forEach(({ rowNumber, row }) => {
    const missingFields = REQUIRED_COLUMNS.filter((field) => !row[field]);
    if (missingFields.length) {
      summary.failed += 1;
      summary.errors.push({
        row: rowNumber,
        reason: `Missing required columns: ${missingFields.join(', ')}`,
      });
      return;
    }

    const termKey = normalizeTermKey(row.term);
    if (!termKey) {
      summary.failed += 1;
      summary.errors.push({
        row: rowNumber,
        reason: 'Invalid term',
      });
      return;
    }

    if (mode === 'replace') {
      summary.inserted += 1;
      return;
    }

    const existed = existingByTerm.has(termKey);
    const duplicatedInFile = touchedTerms.has(termKey);
    touchedTerms.add(termKey);

    if (mode === 'append') {
      if (existed || duplicatedInFile) {
        summary.skipped += 1;
        summary.errors.push({
          row: rowNumber,
          reason: `Term "${row.term}" already exists`,
        });
      } else {
        summary.inserted += 1;
      }
      return;
    }

    // upsert
    if (duplicatedInFile) {
      summary.skipped += 1;
      summary.errors.push({
        row: rowNumber,
        reason: `Term "${row.term}" is duplicated in file`,
      });
      return;
    }

    if (existed) {
      summary.updated += 1;
    } else {
      summary.inserted += 1;
    }
  });
  return summary;
};

const ensureAdminDeckTopicAccess = async (deckId, topicId) => {
  const deck = await Deck.findById(deckId);
  const topic = await Topic.findById(topicId);
  if (!deck) throw new AppError(ADMIN.DECK_NOT_FOUND, 404);
  if (!topic) throw new AppError(ADMIN.TOPIC_NOT_FOUND, 404);
  if (String(topic.deckId) !== String(deck._id)) {
    throw new AppError(
      COMMON.INVALID_DATA,
      400,
      [],
      'Topic is not belong to the selected deck'
    );
  }
  return { deck, topic };
};

const ensureUserDeckTopicAccess = async ({
  userId,
  deckId,
  topicId,
  writeAccess,
}) => {
  const [deck, topic] = await Promise.all([
    Deck.findOne({ _id: deckId, ownerType: 'user' }),
    Topic.findById(topicId),
  ]);

  if (!deck) throw new AppError('Deck not found', 404);
  if (!topic) throw new AppError('Topic not found', 404);

  if (String(topic.deckId) !== String(deck._id)) {
    throw new AppError('Topic is not belong to the selected deck', 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const isOwner = String(deck.ownerId) === String(user._id);

  if (writeAccess && !isOwner) {
    throw new AppError(
      "You don't have permission to import into this deck. Only the owner can import",
      403
    );
  }

  if (!writeAccess) {
    const canRead = isOwner || deck.status === 'published';
    if (!canRead) {
      throw new AppError("You don't have permission to export this deck", 403);
    }
  }

  return { user, deck, topic, isOwner };
};

export const adminExportCards = async (deckId, topicId) => {
  await ensureAdminDeckTopicAccess(deckId, topicId);
  const cards = await Card.find({ deckId, topicId }).sort({ order: 1 });
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Cards');
  worksheet.columns = [
    { header: 'term', key: 'term', width: 20 },
    { header: 'translation', key: 'translation', width: 25 },
    { header: 'pos', key: 'pos', width: 15 },
    { header: 'phonetics', key: 'phonetics', width: 25 },
    { header: 'explanation_vi', key: 'explanation_vi', width: 30 },
    { header: 'explanation_en', key: 'explanation_en', width: 30 },
    { header: 'examples_vi', key: 'examples_vi', width: 30 },
    { header: 'examples_en', key: 'examples_en', width: 30 },
    { header: 'imageUrl', key: 'imageUrl', width: 30 },
  ];
  cards.forEach((card) => {
    worksheet.addRow({
      term: card.term,
      translation: card.translation,
      pos: card.pos || '',
      phonetics: JSON.stringify(card.phonetics || []),
      explanation_vi: card.explanation?.vi || '',
      explanation_en: card.explanation?.en || '',
      examples_vi: card.examples?.vi || '',
      examples_en: card.examples?.en || '',
      imageUrl: card.imageUrl || '',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const adminImportCards = async (deckId, topicId, fileUrl, mode) => {
  const { topic } = await ensureAdminDeckTopicAccess(deckId, topicId);

  const fileKey = extractKeyFromUrl(fileUrl);
  const fileBuffer = await getFileBufferFromS3(fileKey);

  const workbook = new exceljs.Workbook();
  await workbook.xlsx.load(fileBuffer);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new AppError(COMMON.INVALID_DATA, 400, [], 'Excel file has no data');
  }

  const parsedRows = [];
  let headers = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      headers = row.values.map((v) => (v ? v.toString().trim() : ''));
    } else {
      const rowData = {};
      row.values.forEach((value, index) => {
        if (headers[index]) {
          rowData[headers[index]] = value ? value.toString().trim() : '';
        }
      });
      parsedRows.push({ rowNumber, row: rowData });
    }
  });

  const existingCards = await Card.find({ deckId, topicId });
  const existingByTerm = new Map(
    existingCards.map((c) => [normalizeTermKey(c.term), c])
  );

  const summary = runImportSimulation({ parsedRows, existingByTerm, mode });

  if (summary.failed > 0) {
    return { summary, cardsProcessed: 0 };
  }

  const bulkOps = [];
  let nextOrder = existingCards.length + 1;

  if (mode === 'replace') {
    await Card.deleteMany({ deckId, topicId });
    nextOrder = 1;
    for (const { row } of parsedRows) {
      let phonetics = [];
      try {
        if (row.phonetics) phonetics = JSON.parse(row.phonetics);
      } catch (e) {}

      bulkOps.push({
        insertOne: {
          document: {
            deckId,
            topicId,
            order: nextOrder++,
            term: row.term,
            translation: row.translation,
            pos: row.pos || '',
            phonetics,
            explanation: {
              vi: row.explanation_vi || '',
              en: row.explanation_en || '',
            },
            examples: {
              vi: row.examples_vi || '',
              en: row.examples_en || '',
            },
            imageUrl: row.imageUrl || '',
          },
        },
      });
    }
  } else {
    for (const { row } of parsedRows) {
      const termKey = normalizeTermKey(row.term);
      const existed = existingByTerm.has(termKey);

      let phonetics = [];
      try {
        if (row.phonetics) phonetics = JSON.parse(row.phonetics);
      } catch (e) {}

      const cardData = {
        term: row.term,
        translation: row.translation,
        pos: row.pos || '',
        phonetics,
        explanation: {
          vi: row.explanation_vi || '',
          en: row.explanation_en || '',
        },
        examples: {
          vi: row.examples_vi || '',
          en: row.examples_en || '',
        },
        imageUrl: row.imageUrl || '',
      };

      if (mode === 'append') {
        if (!existed) {
          bulkOps.push({
            insertOne: {
              document: {
                deckId,
                topicId,
                order: nextOrder++,
                ...cardData,
              },
            },
          });
          existingByTerm.set(termKey, true); // Mark as existed for subsequent duplicates
        }
      } else if (mode === 'upsert') {
        if (existed) {
          const existingCard = existingByTerm.get(termKey);
          if (existingCard && existingCard._id) {
            bulkOps.push({
              updateOne: {
                filter: { _id: existingCard._id },
                update: { $set: cardData },
              },
            });
          }
        } else {
          bulkOps.push({
            insertOne: {
              document: {
                deckId,
                topicId,
                order: nextOrder++,
                ...cardData,
              },
            },
          });
          existingByTerm.set(termKey, true);
        }
      }
    }
  }

  if (bulkOps.length > 0) {
    await Card.bulkWrite(bulkOps);

    // Update card counts
    const actualCardCount = await Card.countDocuments({ deckId, topicId });
    const diff = actualCardCount - existingCards.length;

    if (mode === 'replace') {
      await Topic.updateOne(
        { _id: topicId },
        { $set: { cardCount: actualCardCount } }
      );
      await Deck.updateOne({ _id: deckId }, { $inc: { cardCount: diff } });
    } else if (diff !== 0) {
      await Topic.updateOne({ _id: topicId }, { $inc: { cardCount: diff } });
      await Deck.updateOne({ _id: deckId }, { $inc: { cardCount: diff } });
    }
  }

  return { summary, cardsProcessed: bulkOps.length };
};
