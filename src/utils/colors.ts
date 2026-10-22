const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';

function color(code: string, text: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) return text;
  return `${code}${text}${RESET}`;
}

export const cyan = (t: string): string => color(CYAN, t);
export const yellow = (t: string): string => color(YELLOW, t);
export const green = (t: string): string => color(GREEN, t);
export const red = (t: string): string => color(RED, t);
export const bold = (t: string): string => color(BOLD, t);
export { RESET };
