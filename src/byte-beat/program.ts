export interface ValidatedProgram {
  programText: string;
}

export function validateProgram(
  programText: string,
): ValidatedProgram | undefined {
  programText = programText.trim();

  if ([...programText].some(isIllegal)) {
    return;
  }

  try {
    new Function("t", `return ${programText}`);
    return { programText };
  } catch (_) {
    return;
  }
}

function isIllegal(c: string, i: number, chars: string[]): boolean {
  if (!AllowedChars.has(c)) {
    return true;
  }

  const shiftChars = ["<", ">"];
  for (const sc of shiftChars) {
    if (c === sc && !(chars[i - 1] === sc || chars[i + 1] === sc)) {
      return true;
    }
  }

  return false;
}

const AllowedChars = new Set([
  " ",
  "+",
  "-",
  "*",
  "/",
  "(",
  ")",
  "|",
  "&",
  "<",
  ">",
  "t",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
]);
