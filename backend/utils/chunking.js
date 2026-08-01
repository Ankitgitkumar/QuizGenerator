// Utility to chunk text into smaller pieces for embedding
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;
    if (end > text.length) {
      end = text.length;
    }

    // Find a good breaking point (sentence end)
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + chunkSize / 2) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
      // If we've reached the end of the text, stop to avoid pushing the same final
      // chunk repeatedly when the text is shorter than `chunkSize`.
      if (end === text.length) break;

      start = end - overlap;
      if (start < 0) start = 0;
      // Safety: if start does not advance forward, break to avoid infinite loop
      if (start >= end) break;
  }

  return chunks;
};