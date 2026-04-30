import { createRequire } from 'node:module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const MAX_CHARS = 200_000;

export async function extractText({ buffer, mimetype, filename }) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  let text;

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    const result = await pdfParse(buffer);
    text = result.text;
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (mimetype === 'text/plain' || ext === 'txt' || ext === 'rtf' || ext === 'md') {
    text = buffer.toString('utf8');
  } else {
    throw new Error(`unsupported file type: ${mimetype || ext}`);
  }

  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!text) throw new Error('no text extracted from file');
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS) + '\n\n[truncated]';
  return text;
}
