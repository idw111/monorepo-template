import { Request, Response } from 'express';

export default function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export const streamHeader = (req: Request, res: Response) => {
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  if (req.httpVersion !== '2.0') res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
};

export const streamData = (res: Response, data: Record<string, unknown>) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  res.flush();
};
