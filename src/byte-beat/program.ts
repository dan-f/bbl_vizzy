export interface ValidatedProgram {
  programText: string;
}

export function validateProgram(programText: string): ValidatedProgram {
  // TODO validate tokens
  programText = programText.trim();
  new Function("t", `return ${programText}`);
  return { programText };
}
