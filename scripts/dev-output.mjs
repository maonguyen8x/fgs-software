export function devInfo(message) {
  process.stdout.write(`${message}\n`);
}

export function devError(message) {
  process.stderr.write(`${message}\n`);
}
