import 'dotenv/config';
import extractPlainText from './ai/extract_plain_text.ts';
import fixOCRIssues from './ai/fix_issues.ts';
import fixMathSymbols from './ai/fix_math_symbols.ts';


const ocrOptions = {
  usePreprocessing: true,
  preset: "handwriting",
  saveIntermediateFiles: true,
  outputPath: "./ocr_output"
};

const imagePath = "/home/chlorine/Pictures/note_1.png";


async function main() {
  try {
    const rawText = await extractPlainText(imagePath, ocrOptions);
    console.log(`Raw text length: ${rawText.length} characters`);

    if (rawText.length > 0) {
      // First fix general OCR issues
      const fixedText = await fixOCRIssues(rawText, ['all']);
      console.log(`Fixed text length: ${fixedText.length} characters`);

      // Then fix mathematical symbols
      const mathFixedText = await fixMathSymbols(fixedText);
      console.log(`Math symbols fixed text length: ${mathFixedText.length} characters`);
    }
  } catch (error) {
    console.error('Error running OCR:', error);
    process.exit(1);
  }
}

main();