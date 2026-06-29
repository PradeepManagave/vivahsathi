export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information that you provide directly to us, including:
• Personal information (name, email, phone number, date of birth)
• Profile information (photos, family details, education, occupation)
• Preferences (partner preferences, community, location)
• Communication data (messages, interests, chat logs)
• Payment information (processed securely through third-party gateways)
• Device and usage data (IP address, browser type, pages visited)`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:
• Create and manage your matrimony profile
• Match you with compatible profiles based on your preferences
• Facilitate communication between members
• Process payments and manage subscriptions
• Verify profiles and maintain platform safety
• Improve our services and user experience
• Send important notifications and updates
• Comply with legal obligations`
    },
    {
      title: '3. Information Sharing',
      content: `We do not sell your personal information. We may share your information with:
• Other members (only information you choose to make visible)
• Franchise centre staff (for verification and support purposes)
• Payment processors (to complete transactions securely)
• Law enforcement (when required by law or to protect rights)
• Service providers (who assist in operating our platform)

All third-party partners are bound by confidentiality agreements and data protection standards.`
    },
    {
      title: '4. Data Security',
      content: `We implement enterprise-grade security measures to protect your information:
• Encryption of data in transit (TLS/SSL) and at rest (AES-256)
• Regular security audits and penetration testing
• Access controls and authentication protocols
• Secure data centers with physical security measures
• Employee training on data protection best practices

While we strive to protect your information, no method of transmission over the Internet is 100% secure.`
    },
    {
      title: '5. Your Rights and Choices',
      content: `You have the right to:
• Access and download your personal data
• Correct inaccurate or incomplete information
• Delete your account and associated data
• Opt out of marketing communications
• Control who can view your profile
• Request a copy of your data in a portable format

To exercise these rights, contact us at privacy@mplusmatrimony.com`
    },
    {
      title: '6. Data Retention',
      content: `We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for:
• Legal compliance (up to 7 years)
• Fraud prevention and security
• Dispute resolution
• Aggregated analytics (anonymized)`
    },
    {
      title: '7. Children\'s Privacy',
      content: `Our services are intended for individuals who are of legal marriageable age in their jurisdiction. We do not knowingly collect information from minors. If we learn we have collected information from a minor, we will delete it promptly.`
    },
    {
      title: '8. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Your continued use of our services after changes constitutes acceptance of the updated policy.`
    },
    {
      title: '9. Contact Us',
      content: `If you have questions about this Privacy Policy or our data practices, please contact:

M-Plus Matrimony Pvt. Ltd.
Email: privacy@mplusmatrimony.com
Phone: +91 1800-XXX-XXXX
Address: Andheri East, Mumbai - 400069, Maharashtra, India`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: January 1, 2026</p>
          <p className="text-gray-600 mt-4">
            M-Plus Matrimony (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
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
