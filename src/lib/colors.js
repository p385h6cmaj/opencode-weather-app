const RESET   = '\x1b[0m';
const CYAN    = '\x1b[36m';
const YELLOW  = '\x1b[33m';
const GREEN   = '\x1b[32m';
const RED     = '\x1b[31m';
const BOLD    = '\x1b[1m';

function color(code, text) {
  if (!process.stdout.isTTY || process.env.NO_COLOR) return text;
  return `${code}${text}${RESET}`;
}

module.exports = {
  cyan:    (t) => color(CYAN, t),
  yellow:  (t) => color(YELLOW, t),
  green:   (t) => color(GREEN, t),
  red:     (t) => color(RED, t),
  bold:    (t) => color(BOLD, t),
  reset:   RESET,
};
