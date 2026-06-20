import { config } from '../config/env.js';

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
