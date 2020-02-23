import { Express } from 'express-serve-static-core';
import http from 'http';

export function startExpress(app: Express): Promise<http.Server | undefined> {
  return new Promise((resolve, reject) => {
    app.on('error', e => reject(e));
    const listener = app.listen(1337, () => resolve(listener));
  });
}
