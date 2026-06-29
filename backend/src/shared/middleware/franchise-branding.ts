import { Request, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import logger from '../../config/logger';

export interface FranchiseBranding {
  id: string;
  name: string;
  code: string;
  subdomain: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      franchise?: FranchiseBranding;
    }
  }
}

const SUBDOMAIN_REGEX = /^([a-z0-9-]+)\./;

export function extractSubdomain(hostname: string): string | null {
  const match = hostname.match(SUBDOMAIN_REGEX);
  return match ? match[1] : null;
}

export async function franchiseBrandingMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const hostname = req.hostname;
    const subdomain = extractSubdomain(hostname);

    if (!subdomain || subdomain === 'www' || subdomain === 'app' || subdomain === 'api' || subdomain === 'staging' || subdomain === 'dev') {
      return next();
    }

    const franchise = await db('franchises')
      .select(
        'id', 'name', 'code',
        db.raw("subdomain || '.' || ? as subdomain", [hostname.replace(/^[a-z0-9-]+\./, '')]),
        'primary_color as primaryColor',
        'secondary_color as secondaryColor',
        'logo_url as logoUrl',
        'favicon_url as faviconUrl',
        'tagline',
        'contact_email as contactEmail',
        'contact_phone as contactPhone',
        'address',
        'status'
      )
      .where('subdomain', subdomain)
      .where('status', 'active')
      .first();

    if (franchise) {
      req.franchise = {
        ...franchise,
        isActive: franchise.status === 'active',
      };
      logger.debug(`Franchise branding applied: ${subdomain}`);
    }

    next();
  } catch (error) {
    logger.error('Franchise branding middleware error', { error });
    next();
  }
}

export function injectFranchiseData(req: Request, res: Response, next: NextFunction): void {
  if (req.franchise) {
    res.setHeader('X-Franchise-Id', req.franchise.id);
    res.setHeader('X-Franchise-Name', req.franchise.name);
  }
  next();
}
