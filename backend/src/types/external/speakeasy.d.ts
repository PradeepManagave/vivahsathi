declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    length?: number;
    algorithm?: string;
  }

  interface GeneratedSecret {
    base32: string;
    hex: string;
    ascii: string;
    otpauth_url?: string;
    google_auth_qr?: string;
  }

  interface VerifyOptions {
    secret: string;
    token: string;
    encoding?: string;
    algorithm?: string;
    window?: number;
    time?: number;
    step?: number;
  }

  interface TotpOptions {
    secret: string;
    encoding?: string;
    algorithm?: string;
    digits?: number;
    period?: number;
    time?: number;
    step?: number;
    window?: number;
  }

  function generateSecret(options?: GenerateSecretOptions): GeneratedSecret;
  function generateSecretASCII(length?: number, symbols?: boolean): string;
  function totp(options: TotpOptions): string;
  function verify(options: VerifyOptions): boolean;
  function verifyDelta(options: VerifyOptions): { delta: number } | null;
  function hotp(options: { secret: string; counter: number; encoding?: string; algorithm?: string; digits?: number }): string;
  function hotpverify(options: { secret: string; token: string; counter: number; encoding?: string; algorithm?: string; window?: number }): boolean | null;

  export {
    generateSecret,
    generateSecretASCII,
    totp,
    verify,
    verifyDelta,
    hotp,
    hotpverify,
    GeneratedSecret,
    GenerateSecretOptions,
    VerifyOptions,
    TotpOptions
  };

  export default {
    generateSecret,
    generateSecretASCII,
    totp,
    verify,
    verifyDelta,
    hotp,
    hotpverify
  };
}
