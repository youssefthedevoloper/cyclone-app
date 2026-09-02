let enabled = true;

export function setLogging(on: boolean) {
  enabled = on;
}

function ts(): string {
  return new Date().toISOString();
}

export const logger = {
  info(msg: string, meta?: any) {
    if (!enabled) return;
    console.log(`[${ts()}] INFO  ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
  },
  warn(msg: string, meta?: any) {
    if (!enabled) return;
    console.warn(`[${ts()}] WARN  ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
  },
  error(msg: string, meta?: any) {
    if (!enabled) return;
    console.error(`[${ts()}] ERROR ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
  },
};
