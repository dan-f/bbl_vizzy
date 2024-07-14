export interface ValidatedProgram {
  programText: string;
  fnText: string;
}

export function validateProgram(programText: string): ValidatedProgram {
  // TODO validate tokens
  programText = programText.trim();
  const fnText = `(t) => ${programText}`;
  eval(fnText);
  return { programText, fnText };
}
