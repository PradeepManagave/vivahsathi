export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using the M-Plus Matrimony platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.

We reserve the right to modify these terms at any time. Your continued use of the platform following any changes constitutes acceptance of those changes.`
    },
    {
      title: '2. Eligibility',
      content: `To use our services, you must:
• Be of legal marriageable age in your jurisdiction (typically 21 years for males and 18 years for females in India)
• Have the legal capacity to enter into a binding agreement
• Not be prohibited from using our services under applicable law
• Provide accurate and complete information during registration

By creating an account, you represent and warrant that you meet these eligibility requirements.`
    },
    {
      title: '3. Account Registration',
      content: `You are responsible for:
• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Notifying us immediately of any unauthorized use
• Ensuring your profile information is accurate and up-to-date

We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`
    },
    {
      title: '4. User Conduct',
      content: `You agree not to:
• Create fake or misleading profiles
• Harass, abuse, or threaten other members
• Share inappropriate or offensive content
• Use the platform for commercial solicitation
• Attempt to access other users' private information
• Circumvent any security features of the platform
• Use automated tools to scrape or collect data
• Impersonate another person or entity

Violations may result in immediate account termination and legal action.`
    },
    {
      title: '5. Membership and Payments',
      content: `• Free membership provides limited access to platform features
• Paid memberships provide additional features as described in each plan
• All fees are non-refundable except as explicitly stated in our refund policy
• Auto-renewal subscriptions can be cancelled at any time before the renewal date
• We reserve the right to change pricing with 30 days notice
• Unpaid balances may result in service suspension`
    },
    {
      title: '6. Content and Intellectual Property',
      content: `• You retain ownership of content you upload (photos, descriptions)
• By uploading content, you grant us a license to use it for platform operations
• The platform's design, logos, and proprietary content are our intellectual property
• You may not copy, modify, or distribute our proprietary content without permission
• We may remove content that violates these terms or is reported by users`
    },
    {
      title: '7. Privacy',
      content: `Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference. By using our services, you consent to the practices described in the Privacy Policy.`
    },
    {
      title: '8. Disclaimers',
      content: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:

• THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE
• THE SERVICE WILL MEET YOUR REQUIREMENTS
• ANY PROFILES OR INFORMATION ARE ACCURATE OR COMPLETE
• MATCHES WILL RESULT IN MARRIAGE

WE DO NOT GUARANTEE COMPATIBILITY OR SUCCESS OF ANY MATCHES.`
    },
    {
      title: '9. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, M-PLUS MATRIMONY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.

OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID FOR SERVICES IN THE 12 MONTHS PRECEDING THE CLAIM.`
    },
    {
      title: '10. Dispute Resolution',
      content: `Any disputes arising from these terms or your use of the platform shall be resolved through:

1. Good faith negotiation between the parties
2. Mediation if negotiation fails
3. Binding arbitration under the Arbitration and Conciliation Act, 1996
4. Courts in Mumbai, Maharashtra shall have exclusive jurisdiction

This section does not prevent us from seeking injunctive relief in court.`
    },
    {
      title: '11. Termination',
      content: `We may terminate or suspend your account at any time, with or without cause, and with or without notice. Upon termination:

• Your right to use the platform ceases immediately
• We may delete your account data per our retention policy
• Any outstanding obligations survive termination

You may terminate your account at any time through account settings or by contacting support.`
    },
    {
      title: '12. Contact Information',
      content: `For questions about these Terms of Service, please contact:

M-Plus Matrimony Pvt. Ltd.
Email: legal@mplusmatrimony.com
Phone: +91 1800-XXX-XXXX
Address: Andheri East, Mumbai - 400069, Maharashtra, India`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: January 1, 2026</p>
          <p className="text-gray-600 mt-4">
            Please read these Terms of Service carefully before using the M-Plus Matrimony platform. 
            By accessing or using our services, you agree to be bound by these terms.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
          {sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
              <div className="text-gray-600 whitespace-pre-line">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
