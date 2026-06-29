import React from 'react';
import Link from 'next/link';
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Success Stories', href: '/success-stories' },
    { label: 'Careers', href: '/careers' },
  ],
  services: [
    { label: 'Search Profiles', href: '/search' },
    { label: 'Membership Plans', href: '/membership' },
    { label: 'Franchise Enquiry', href: '/franchise' },
    { label: 'Vendor Marketplace', href: '/marketplace' },
  ],
  support: [
    { label: 'Help & FAQ', href: '/faq' },
    { label: 'Safety Tips', href: '/safety' },
    { label: 'Report Issue', href: '/report' },
    { label: 'Customer Care', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300">
      {/* Main Footer */}
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M+</span>
              </div>
              <span className="font-headline font-bold text-2xl text-white">
                M-Plus
              </span>
            </Link>
            <p className="text-sm text-stone-400 mb-4">
              India&apos;s most trusted matrimony platform. Find your perfect life partner with confidence.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-stone-800 rounded-full hover:bg-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="border-t border-stone-800">
        <div className="container-page py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>support@mplus.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>Maharashtra, India</span>
              </div>
            </div>
            <p className="text-sm text-stone-500">
              Made with <Heart className="w-4 h-4 text-primary-400 inline" /> in India
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-stone-800">
        <div className="container-page py-4">
          <p className="text-center text-xs text-stone-500">
            &copy; {new Date().getFullYear()} M-Plus Matrimony. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
