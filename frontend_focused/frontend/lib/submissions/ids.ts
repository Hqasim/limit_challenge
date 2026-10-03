// Submission ids arrive as URL text ("/submissions/12"). These helpers decide what counts as a
// real id, so the server page can 404 junk like "/submissions/abc" before any request is made,
// and the data hook never asks the API for an id that cannot exist.

export function isValidSubmissionId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}

// "12" -> 12; "abc", "0", "007", "1.5" or an out-of-range number -> null.
export function parseSubmissionId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return isValidSubmissionId(id) ? id : null;
}
