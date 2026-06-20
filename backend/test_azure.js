import { config } from './src/config/env.js';
import fetch from 'node-fetch'; // if available, or just global fetch

const evaluatePronunciationDebug = async (audioUrl, referenceText) => {
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();

    const assessmentParams = {
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
      Dimension: 'Comprehensive',
    };

    const pronunciationAssessmentHeader = Buffer.from(
      JSON.stringify(assessmentParams)
    ).toString('base64');

    const endpoint = `https://${config.azureSpeechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

    const azureResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.azureSpeechKey,
        'Accept': 'application/json',
        'Content-Type': 'audio/wav',
        'Pronunciation-Assessment': pronunciationAssessmentHeader,
      },
      body: audioBuffer,
    });

    const result = await azureResponse.json();
    console.log("Azure Full Response:", JSON.stringify(result, null, 2));
    return result;
};

const run = async () => {
    console.log("Starting debug test...");
    await evaluatePronunciationDebug(
        "https://minlish-english-learning.s3.us-east-1.amazonaws.com/20260620_Hey_everyb.wav",
        "hey everybody welcome back to the show"
    );
};
run();
