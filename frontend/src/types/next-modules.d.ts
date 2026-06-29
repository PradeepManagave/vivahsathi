declare module 'next' {
  import type { ReactNode } from 'react';

  export type Metadata = {
    metadataBase?: URL;
    title?: string | { default: string; template: string; absolute?: string };
    description?: string;
    keywords?: string[];
    authors?: { name: string; url?: string }[];
    creator?: string;
    publisher?: string;
    robots?: string | { index?: boolean; follow?: boolean; nocache?: boolean; googleBot?: { index?: boolean; follow?: boolean; 'max-video-preview'?: number; 'max-image-preview'?: string; 'max-snippet'?: number } };
    icons?: { icon?: string | { url: string; sizes?: string; type?: string }[]; apple?: string | { url: string; sizes?: string; type?: string }[]; other?: { rel: string; url: string }[] };
    manifest?: string;
    openGraph?: { title?: string; description?: string; url?: string; siteName?: string; images?: { url: string; width: number; height: number; alt?: string }[]; locale?: string; alternateLocale?: string[]; type?: string };
    twitter?: { card?: string; site?: string; creator?: string; title?: string; description?: string; images?: string[] };
    verification?: { google?: string; yandex?: string };
    alternates?: { canonical?: string; languages?: Record<string, string> };
  };

  export type Viewport = {
    width?: string;
    initialScale?: number;
    minimumScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    themeColor?: string | { media: string; color: string }[];
    colorScheme?: 'light' | 'dark' | 'light dark';
  };

  export default function NextApp(props: { children: ReactNode }): JSX.Element;
}

declare module 'next/link' {
  import { ComponentType, ReactNode, MouseEventHandler } from 'react';

  export interface LinkProps {
    href: string | URL;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    className?: string;
    children?: ReactNode;
    onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
    onTouchStart?: MouseEventHandler<HTMLAnchorElement>;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    [key: string]: unknown;
  }

  declare const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    prefetch: (url: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
  };
  export function usePathname(): string | null;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): Record<string, string | string[]>;
  export function useSelectedLayoutSegment(): string | null;
  export function useSelectedLayoutSegments(): string[];
  export function redirect(url: string): never;
  export function permanentRedirect(url: string): never;
  export function notFound(): never;
}

declare module 'next/server' {
  export interface NextRequest extends Request {
    cookies: { get: (name: string) => { value: string } | undefined; set: (name: string, value: string, options?: object) => void; delete: (name: string) => void };
    nextUrl: { pathname: string; search: string; searchParams: URLSearchParams; origin: string; href: string };
    geo?: { city?: string; country?: string; region?: string };
    ip?: string;
  }

  export interface NextFetchEvent {
    request: Request;
    page: string;
  }

  export const NextResponse: {
    next: (init?: { request?: { headers?: Headers } }) => NextResponse;
    redirect: (url: URL | string, status?: number) => NextResponse;
    rewrite: (url: URL | string, options?: { headers?: Headers; locale?: string }) => NextResponse;
    json: (body: unknown, init?: ResponseInit) => NextResponse;
  };

  export interface NextResponse extends Response {
    cookies: { set: (name: string, value: string, options?: object) => void; delete: (name: string) => void; get: (name: string) => { value: string } | undefined };
  }
}

declare module 'next/image' {
  import { ComponentType, ImgHTMLAttributes } from 'react';

  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
    src: string | { src: string; width: number; height: number; blurDataURL?: string };
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    loader?: (resolverProps: { src: string; width: number; quality?: number }) => string;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onError?: (error: Error) => void;
    onLoadingComplete?: (img: HTMLImageElement) => void;
  }

  declare const Image: ComponentType<ImageProps>;
  export default Image;
}

declare module 'next/head' {
  import { ComponentType, ReactNode } from 'react';
  interface HeadProps { children?: ReactNode }
  declare const Head: ComponentType<HeadProps>;
  export default Head;
}

declare module 'next/document' {
  import { ComponentType, ReactNode } from 'react';
  export interface DocumentProps { children?: ReactNode }
  export class Document extends ComponentType<DocumentProps> {}
  export class Html extends ComponentType<{ lang?: string }> {}
  export class Head extends ComponentType<{}> {}
  export class Main extends ComponentType<{}> {}
  export class NextScript extends ComponentType<{}> {}
}

declare module 'next/font/google' {
  export interface GoogleFontOptions {
    subsets: string[];
    weight?: string | string[];
    style?: string | string[];
    display?: string;
    variable?: string;
    preload?: boolean;
    fallback?: string[];
    adjustFontFallback?: boolean;
  }
  export function Plus_Jakarta_Sans(options: GoogleFontOptions): { className: string; style: { fontFamily: string }; variable: string };
  export function Manrope(options: GoogleFontOptions): { className: string; style: { fontFamily: string }; variable: string };
  export function JetBrains_Mono(options: GoogleFontOptions): { className: string; style: { fontFamily: string }; variable: string };
  export function Inter(options: GoogleFontOptions): { className: string; style: { fontFamily: string }; variable: string };
}
