// Polyfill Web Streams and fetch globals for Node 16 / Electron 22 on legacy operating systems (Windows 7)
if (typeof globalThis.ReadableStream === 'undefined') {
  try {
    const streamWeb = require('stream/web');
    if (streamWeb) {
      if (streamWeb.ReadableStream) globalThis.ReadableStream = streamWeb.ReadableStream;
      if (streamWeb.WritableStream) globalThis.WritableStream = streamWeb.WritableStream;
      if (streamWeb.TransformStream) globalThis.TransformStream = streamWeb.TransformStream;
      if (streamWeb.ByteLengthQueuingStrategy) globalThis.ByteLengthQueuingStrategy = streamWeb.ByteLengthQueuingStrategy;
      if (streamWeb.CountQueuingStrategy) globalThis.CountQueuingStrategy = streamWeb.CountQueuingStrategy;
    }
  } catch (_e) {}
}

export {};
