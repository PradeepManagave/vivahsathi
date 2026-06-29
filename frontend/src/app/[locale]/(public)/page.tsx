'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Search, Shield, Users, Star, ArrowRight, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

const featuredProfiles = [
  { id: '1', name: 'Priya Sharma', age: 26, location: 'Mumbai', photo: '', profession: 'Software Engineer' },
  { id: '2', name: 'Rahul Patil', age: 29, location: 'Pune', photo: '', profession: 'Doctor' },
  { id: '3', name: 'Sneha Deshmukh', age: 24, location: 'Nagpur', photo: '', profession: 'Teacher' },
  { id: '4', name: 'Amit Kulkarni', age: 31, location: 'Nashik', photo: '', profession: 'Business' },
];

const successStories = [
  { name: 'Raj & Priya', year: '2024', quote: 'Found our perfect match on M-Plus!' },
  { name: 'Amit & Sneha', year: '2023', quote: 'The verification gave us confidence.' },
  { name: 'Vikram & Anita', year: '2023', quote: 'Franchise centre helped us connect.' },
];

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Header variant="public" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary to-primary-800 text-white">
        <div className="container-page py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6">
              Find Your Perfect
              <span className="block text-secondary-200">Life Partner</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              India&apos;s most trusted matrimony platform with verified profiles, secure matchmaking, and dedicated franchise centres.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Register Free
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Search Profiles
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary-200" />
                <span>10L+ Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary-200" />
                <span>500+ Franchise Centres</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary-200" />
                <span>50K+ Success Stories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">How It Works</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Find your match in just 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Search & Discover',
                desc: 'Browse through verified profiles using advanced filters to find compatible matches.',
              },
              {
                icon: Heart,
                title: 'Connect & Chat',
                desc: 'Send interests, chat securely, and schedule video calls to get to know each other.',
              },
              {
                icon: Shield,
                title: 'Verify & Meet',
                desc: 'Visit franchise centres for KYC verification and meet in a safe, trusted environment.',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">STEP {index + 1}</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="py-16 bg-surface">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Featured Profiles</h2>
              <p className="text-stone-500">Discover verified members near you</p>
            </div>
            <Link href="/search">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProfiles.map((profile) => (
              <Card key={profile.id} variant="hover" className="p-4 text-center">
                <Avatar name={profile.name} size="xl" className="mx-auto mb-3" />
                <h3 className="font-semibold text-stone-900">{profile.name}, {profile.age}</h3>
                <p className="text-sm text-stone-500">{profile.profession}</p>
                <p className="text-xs text-stone-400 mt-1">{profile.location}</p>
                <Link href="/register">
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    View Profile
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Success Stories</h2>
            <p className="text-stone-500">Real couples who found love on M-Plus</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 italic mb-4">&quot;{story.quote}&quot;</p>
                <div className="font-semibold text-stone-900">{story.name}</div>
                <div className="text-sm text-stone-400">Married in {story.year}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Match?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join millions of Indians who trust M-Plus for their matrimony journey. Register today for free!
          </p>
          <Link href="/register">
            <Button variant="gold" size="lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-surface">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Get in Touch</h2>
            <p className="text-stone-500">We&apos;re here to help you find your perfect match</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-stone-900">Call Us</h3>
              <p className="text-sm text-stone-500">+91 1800-XXX-XXXX</p>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-stone-900">Email Us</h3>
              <p className="text-sm text-stone-500">support@mplus.com</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-stone-900">Visit Us</h3>
              <p className="text-sm text-stone-500">Maharashtra, India</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
