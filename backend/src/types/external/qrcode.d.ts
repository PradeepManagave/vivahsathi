declare module 'qrcode' {
  interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | 'utf8' | 'svg' | 'terminal';
    width?: number;
    margin?: number;
    scale?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  function toDataURL(text: string, callback: (error: Error | null | undefined, url: string) => void): void;
  function toDataURL(text: string, options: QRCodeOptions, callback: (error: Error | null | undefined, url: string) => void): void;

  function toBuffer(text: string, options?: QRCodeOptions): Promise<Buffer>;
  function toBuffer(text: string, callback: (error: Error | null | undefined, buffer: Buffer) => void): void;
  function toBuffer(text: string, options: QRCodeOptions, callback: (error: Error | null | undefined, buffer: Buffer) => void): void;

  function toString(text: string, options?: QRCodeOptions): Promise<string>;
  function toString(text: string, callback: (error: Error | null | undefined, string: string) => void): void;
  function toString(text: string, options: QRCodeOptions, callback: (error: Error | null | undefined, string: string) => void): void;

  function toFile(path: string, text: string, options?: QRCodeOptions): Promise<void>;
  function toFile(path: string, text: string, callback: (error: Error | null | undefined) => void): void;
  function toFile(path: string, text: string, options: QRCodeOptions, callback: (error: Error | null | undefined) => void): void;

  export {
    toDataURL,
    toBuffer,
    toString,
    toFile,
    QRCodeOptions
  };

  export default {
    toDataURL,
    toBuffer,
    toString,
    toFile
  };
}
