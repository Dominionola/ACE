"use client";

import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';
import { NavItem } from '../types';
import Link from 'next/link';

const navItems: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'Methodology', href: '#methodology' },
  { label: 'Pricing', href: '#pricing' },
];

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-cream-50/80 backdrop-blur-md border-b border-ace-blue/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-sans font-medium text-ace-blue/70 hover:text-ace-blue transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <button className="text-sm font-sans font-medium text-ace-blue hover:text-ace-blue/80 transition-colors">
              Log in
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-ace-blue text-cream-50 px-5 py-2.5 rounded-full text-sm font-sans font-medium hover:bg-ace-light transition-colors duration-300 shadow-sm hover:shadow-md">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-ace-blue"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-cream-50 border-b border-ace-blue/10 p-6 animate-fade-in-up shadow-lg">
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-lg font-serif font-medium text-ace-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <hr className="border-ace-blue/10" />
            <div className="flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full text-left font-sans font-medium text-ace-blue">
                  Log in
                </button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full bg-ace-blue text-cream-50 px-5 py-3 rounded-full text-center font-sans font-medium">
                  Get Started
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};