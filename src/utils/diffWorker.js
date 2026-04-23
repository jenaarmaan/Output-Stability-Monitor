import { diffWords } from 'diff';

self.onmessage = function(e) {
  const { text1, text2 } = e.data;
  const diff = diffWords(text1, text2);
  self.postMessage(diff);
};
