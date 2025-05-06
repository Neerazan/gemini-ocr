import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs";
import { OcrOptions } from "../types.ts";
import { getInitialTextExtractionPrompt, preprocessImage } from "../utils.ts";



// Calls Gemini with a text‐and‐image prompt
async function callGeminiOcr(imageBuffer: Buffer): Promise<string> {
  const prompt = getInitialTextExtractionPrompt('general');

  const response = await generateText({
    model: google('gemini-1.5-flash-002'),
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image',
          mimeType: 'image/png',
          image: imageBuffer
        }
      ]
    }]
  });

  if (!response.text) {
    throw new Error('No text returned from Gemini');
  }

  return response.text;
}

async function extractPlainText(
  imagePath: string,
  {
    usePreprocessing = false,
    preset = 'handwriting',
    saveIntermediateFiles = false,
    outputPath,
  }: OcrOptions
): Promise<string> {
  try {
    let imageBuffer = await fs.promises.readFile(imagePath);

    if (usePreprocessing) {
      imageBuffer = await preprocessImage(imageBuffer, preset);
    }

    const extractedText = await callGeminiOcr(imageBuffer);

    if (saveIntermediateFiles && outputPath) {
      await fs.promises.writeFile(`${outputPath}/extracted_plain_text.txt`, extractedText);
    }

    return extractedText;
  } catch (err) {
    console.error('[extractPlainText] failed:', err);
    throw err;
  }
}

export default extractPlainText;