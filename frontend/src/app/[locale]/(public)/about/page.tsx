import Link from 'next/link';
import { Heart, Users, Shield, Award, Phone, Mail, MapPin } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Happy Couples', value: '50,000+' },
    { label: 'Active Members', value: '2,00,000+' },
    { label: 'Franchise Centres', value: '150+' },
    { label: 'Years of Trust', value: '10+' }
  ];

  const values = [
    { icon: <Heart className="w-8 h-8" />, title: 'Trust & Safety', description: 'Verified profiles and secure matchmaking' },
    { icon: <Users className="w-8 h-8" />, title: 'Community First', description: 'Built for Indian families and communities' },
    { icon: <Shield className="w-8 h-8" />, title: 'Privacy Protected', description: 'Your data is safe with enterprise security' },
    { icon: <Award className="w-8 h-8" />, title: 'Quality Matches', description: 'AI-powered compatibility scoring' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#570013] to-[#3a000d] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About M-Plus Matrimony</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            India&apos;s trusted franchise-based matrimony platform connecting families with verified, compatible matches since 2016.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[#570013]">{stat.value}</p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            M-Plus Matrimony was founded with a simple vision: to bring the trust and personal touch of traditional matchmaking into the digital age. 
            Unlike anonymous online platforms, our franchise model ensures every profile is verified by local centre staff who understand regional customs and family values.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            With over 150 franchise centres across India, we combine technology with human expertise to help families find the perfect match for their loved ones. 
            Our platform supports Marathi, Hindi, and English, making it accessible to communities across the country.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-[#570013]/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#570013]">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
              <Phone className="w-8 h-8 text-[#570013] mb-3" />
              <p className="font-medium text-gray-900">Phone</p>
              <p className="text-gray-600">+91 1800-XXX-XXXX</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
              <Mail className="w-8 h-8 text-[#570013] mb-3" />
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-gray-600">support@mplusmatrimony.com</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
              <MapPin className="w-8 h-8 text-[#570013] mb-3" />
              <p className="font-medium text-gray-900">Head Office</p>
              <p className="text-gray-600">Mumbai, Maharashtra</p>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
