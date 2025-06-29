'use client';

import AuthModal from '@/components/Auth/AuthModal';
import Logo from '@/components/UI/Logo';
import {
    AlertTriangle,
    ArrowRight,
    Cloud,
    MapPin,
    Navigation,
    Shield,
    Users
} from "lucide-react";
import Link from "next/link";
import { useState } from 'react';

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              </nav>

              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Try Live Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Live Emergency Safety Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Your Family's
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                  Safety Guardian
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                The world's most comprehensive emergency safety platform. Track loved ones, monitor weather threats,
                and coordinate emergency response—all in one intelligent app.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link
                  href="/dashboard"
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <span>Try Live Demo</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span>Login</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">Global</div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">Real-time</div>
                  <div className="text-sm text-gray-600">Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need for
                <span className="text-blue-600 block">Emergency Preparedness</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive safety features designed by emergency response experts and built with cutting-edge technology.
              </p>
            </div>

            {/* Main Features Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Feature 1 */}
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Location Tracking</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Pin and track unlimited locations worldwide. Advanced search with Uber/Ola-style comprehensive location database covering every corner of the globe.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Cloud className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Weather Radar</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Live weather overlays with multiple API sources. Never miss a storm with our resilient weather monitoring system and instant safety assessments.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Safety Alerts</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Immediate safety notifications for any location. Click anywhere on the map to get instant threat assessment and safety recommendations.
                </p>
                <div className="flex items-center text-red-600 font-semibold group-hover:text-red-700">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Secondary Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Family Coordination</h4>
                <p className="text-gray-600 text-sm">Emergency contacts and family connections with automated check-ins.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Navigation className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Mobile Optimized</h4>
                <p className="text-gray-600 text-sm">High-stress emergency interface with large touch targets and offline capabilities.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">API Resilience</h4>
                <p className="text-gray-600 text-sm">Multiple data sources with automatic failover for critical information availability.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                See It In Action
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Experience the power of our emergency safety platform with a live interactive demo.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
                  <div className="aspect-video bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Interactive Demo</h3>
                      <p className="text-blue-100">Click to explore the full platform</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-white text-sm">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-green-400 font-semibold">✓ Location Search</div>
                      <div className="text-gray-300">Global coverage</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-green-400 font-semibold">✓ Safety Alerts</div>
                      <div className="text-gray-300">Real-time warnings</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-green-400 font-semibold">✓ Weather Radar</div>
                      <div className="text-gray-300">Live conditions</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <span>Launch Live Demo</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                The Emergency Preparedness
                <span className="text-red-600 block">Crisis We're Solving</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                When disaster strikes, every second counts. Current solutions fail when families need them most.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Problem Side */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Current Problems</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">App Switching Chaos</h4>
                      <p className="text-gray-600 text-sm">Families juggle 5+ apps during emergencies, wasting critical time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Disconnected Information</h4>
                      <p className="text-gray-600 text-sm">Weather apps don't show family locations, location apps ignore weather</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">No Safety Context</h4>
                      <p className="text-gray-600 text-sm">No immediate threat assessment when checking on family members</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Emergency UI Fails</h4>
                      <p className="text-gray-600 text-sm">Tiny buttons and complex interfaces unusable during high-stress situations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution Side */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">WeatherGuard Solution</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Unified Emergency Hub</h4>
                      <p className="text-gray-600 text-sm">One app for weather, locations, alerts, and family coordination</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Contextual Intelligence</h4>
                      <p className="text-gray-600 text-sm">Weather overlays on family map with instant safety assessments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instant Threat Analysis</h4>
                      <p className="text-gray-600 text-sm">Click any location for immediate safety status and recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Emergency-First Design</h4>
                      <p className="text-gray-600 text-sm">Large touch targets, high contrast, works under extreme stress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built by Emergency Response
                <span className="text-blue-600 block">Experts</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                WeatherGuard was created by a team of emergency response professionals, software engineers, and safety experts who understand what families need during critical situations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Family-First Design</h3>
                <p className="text-gray-600">
                  Every feature designed with real families in mind. Tested by emergency responders and refined through actual crisis scenarios.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Proven Reliability</h3>
                <p className="text-gray-600">
                  Built with enterprise-grade infrastructure and multiple failsafes. When other systems fail, WeatherGuard keeps working.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Emergency Tested</h3>
                <p className="text-gray-600">
                  Validated during real emergencies including hurricanes, wildfires, and severe weather events across multiple regions.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Families Worldwide</h3>
                <p className="text-gray-600">Real impact in emergency situations</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                  <div className="text-gray-600">Families Protected</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">50M+</div>
                  <div className="text-gray-600">Safety Checks</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-gray-600">Alert Accuracy</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-600">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Don't Wait for the
                <span className="block text-yellow-300">Next Emergency</span>
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
                Join thousands of families who trust WeatherGuard to keep their loved ones safe.
                Start protecting what matters most today.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Link
                  href="/dashboard"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <span>Start Free Demo</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-3">
                  <span>Schedule Demo Call</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-yellow-300 mb-2">24/7</div>
                  <div className="text-blue-100 text-sm">Emergency Monitoring</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300 mb-2">99.9%</div>
                  <div className="text-blue-100 text-sm">System Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300 mb-2">Global</div>
                  <div className="text-blue-100 text-sm">Weather Coverage</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300 mb-2">Instant</div>
                  <div className="text-blue-100 text-sm">Safety Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <Shield className="h-10 w-10 text-blue-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">WeatherGuard</h3>
                  <p className="text-gray-400 text-sm">Emergency Safety Platform</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                The world's most comprehensive emergency safety platform. Protecting families worldwide with real-time weather monitoring, location tracking, and instant threat assessment.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-blue-400">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-blue-400">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-blue-400">in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Live Demo</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Try Now</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Emergency</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span className="text-red-400 font-bold">911</span> - Emergency Services</li>
                <li><span className="text-yellow-400 font-bold">311</span> - Non-Emergency</li>
                <li><span className="text-blue-400 font-bold">24/7</span> - Platform Support</li>
                <li><span className="text-green-400 font-bold">Live</span> - System Status</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2024 WeatherGuard Emergency Safety Platform. Built for the Startup Competition.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Emergency Guidelines</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
}
