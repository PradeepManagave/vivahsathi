'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, MessageCircle, Phone, Mail, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';


const faqs = [
  {
    question: 'How do I create an account on M-Plus Matrimony?',
    answer: 'Click on "Register" and enter your mobile number. Verify with the OTP sent to your phone, then fill in your basic details to complete registration.',
  },
  {
    question: 'How do I search for matches?',
    answer: 'Use the search filters on the dashboard or navigate to the Search page. You can filter by age, location, religion, caste, education, profession, and more.',
  },
  {
    question: 'How does the matching system work?',
    answer: 'Our system uses AI-powered compatibility algorithms based on your profile preferences, search history, and interaction patterns to suggest the most relevant matches daily.',
  },
  {
    question: 'How do I express interest in a profile?',
    answer: 'Visit the profile you\'re interested in and click the "Send Interest" button. The person will be notified, and if they accept, you can start chatting.',
  },
  {
    question: 'What membership plans are available?',
    answer: 'We offer Free, Silver, Gold, and Platinum plans. Premium plans unlock features like unlimited messaging, profile highlights, priority support, and advanced match filters.',
  },
  {
    question: 'How do I upgrade my membership?',
    answer: 'Go to the Membership page, choose your preferred plan, and complete the payment. You can pay via credit/debit card, UPI, net banking, or wallet.',
  },
  {
    question: 'Is my data safe and secure?',
    answer: 'Yes, we take data privacy seriously. Your personal information is encrypted, and we never share your contact details without your consent.',
  },
  {
    question: 'How can I delete my account?',
    answer: 'Go to Settings > Account and click "Delete Account". Your data will be permanently removed within 30 days.',
  },
  {
    question: 'How do I report a suspicious profile?',
    answer: 'Visit the profile, click the More menu (three dots), and select "Report Profile". Our team will review it within 24 hours.',
  },
  {
    question: 'Can I get a refund on my membership?',
    answer: 'Refunds are processed within 7 days of purchase if no matches were contacted. Contact our support team to initiate the process.',
  },
];

const supportCategories = [
  { icon: MessageCircle, title: 'Live Chat', description: 'Chat with our support team in real-time', action: 'Start Chat', href: '#' },
  { icon: Phone, title: 'Call Us', description: 'Speak directly with our team', action: 'Call Now', href: 'tel:+919876543210' },
  { icon: Mail, title: 'Email Us', description: 'Send us an email for detailed support', action: 'Send Email', href: 'mailto:support@mplusmatrimony.com' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground mb-6">Find answers to common questions or get in touch with our support team</p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {supportCategories.map((cat) => (
          <Card key={cat.title} className="p-6 text-center hover:shadow-md transition-shadow">
            <cat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">{cat.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href={cat.href}>{cat.action} <ExternalLink className="ml-1.5 h-3 w-3" /></Link>
            </Button>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

      {filteredFaqs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No results found. Try a different search term or <Link href="mailto:support@mplusmatrimony.com" className="text-primary underline">contact us</Link>.</p>
      ) : (
        <div className="space-y-2">
          {filteredFaqs.map((faq, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenFaq(openFaq === String(i) ? null : String(i))}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                {openFaq === String(i) ? <ChevronDown className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0" />}
              </button>
              {openFaq === String(i) && (
                <div className="px-4 pb-4 text-muted-foreground">{faq.answer}</div>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="text-center mt-12 p-8 bg-muted rounded-xl">
        <h2 className="text-xl font-bold mb-2">Still need help?</h2>
        <p className="text-muted-foreground mb-4">Our support team is available 24/7 to assist you</p>
        <div className="flex justify-center gap-4">
          <Button asChild><Link href="mailto:support@mplusmatrimony.com">Email Support</Link></Button>
          <Button variant="outline" asChild><Link href="tel:+919876543210">Call Us</Link></Button>
        </div>
      </div>
    </div>
  );
}
