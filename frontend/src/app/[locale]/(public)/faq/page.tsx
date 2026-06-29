'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  { category: 'General', question: 'What is M-Plus Matrimony?', answer: 'M-Plus Matrimony is India\'s trusted franchise-based matrimony platform that connects families with verified, compatible matches. We operate through 150+ franchise centres across India, ensuring every profile is verified by local staff.' },
  { category: 'General', question: 'How is M-Plus different from other matrimony sites?', answer: 'Unlike anonymous online platforms, our franchise model ensures personal verification of every profile. Each centre has trained staff who understand regional customs and family values, providing a trusted matchmaking experience.' },
  { category: 'General', question: 'Which languages does the platform support?', answer: 'We currently support English, Hindi, and Marathi. We are working on adding more regional languages to serve communities across India.' },
  { category: 'Membership', question: 'What membership plans are available?', answer: 'We offer Free, Silver, Gold, and Diamond membership plans. Free members can browse profiles with limited features, while paid members get unlimited messaging, priority listing, and access to verified contact details.' },
  { category: 'Membership', question: 'Can I upgrade my membership later?', answer: 'Yes, you can upgrade your membership at any time. The upgrade cost will be prorated based on your remaining subscription period.' },
  { category: 'Membership', question: 'What is the refund policy?', answer: 'We offer a 7-day refund policy for new memberships. If you are not satisfied with our service, you can request a full refund within 7 days of purchase.' },
  { category: 'Safety', question: 'How do you verify profiles?', answer: 'All profiles go through a multi-step verification process including phone verification, email verification, and optional KYC verification through video call at our franchise centres. Staff-verified profiles receive a special badge.' },
  { category: 'Safety', question: 'Is my personal information safe?', answer: 'Yes, we use enterprise-grade security to protect your data. Personal contact details are only shared with your consent, and you can control who sees your profile information.' },
  { category: 'Safety', question: 'How do I report a suspicious profile?', answer: 'You can report any suspicious profile by clicking the "Report" button on their profile. Our team reviews all reports within 24 hours and takes appropriate action.' },
  { category: 'Franchise', question: 'How can I open a franchise centre?', answer: 'To open a franchise centre, you need to apply through our franchise portal. Requirements include a commercial space, basic computer setup, and commitment to our verification standards. Contact franchise@mplusmatrimony.com for details.' },
  { category: 'Franchise', question: 'What support do franchise centres receive?', answer: 'Franchise centres receive training, marketing materials, technical support, and access to our centralized database. We also provide ongoing guidance on operations and customer service.' },
  { category: 'Technical', question: 'How do I reset my password?', answer: 'Click on "Forgot Password" on the login page, enter your registered email or phone number, and follow the instructions to reset your password.' },
  { category: 'Technical', question: 'Can I use M-Plus on my phone?', answer: 'Yes, our platform is fully responsive and works on all devices. We also offer a mobile app for Android and iOS for a better mobile experience.' },
];

const categories = ['All', 'General', 'Membership', 'Safety', 'Franchise', 'Technical'];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(faq => 
    selectedCategory === 'All' || faq.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#570013]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-[#570013]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-600 mt-2">Find answers to common questions about M-Plus Matrimony</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#570013] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No FAQs found for this category</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-[#570013] rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-white/80 mb-6">Our support team is here to help you</p>
          <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#570013] rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
