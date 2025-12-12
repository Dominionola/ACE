import React from 'react';
import { Logo } from './Logo';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ace-blue text-cream-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <Logo className="text-cream-50 mb-6" />
            <p className="text-cream-50/60 text-sm leading-relaxed">
              Empowering the next generation of scholars with intelligent, adaptive learning technology.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-cream-50/60">
              <li><a href="#" className="hover:text-cream-50 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">For Universities</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-cream-50/60">
              <li><a href="#" className="hover:text-cream-50 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-cream-50/60">
              <li><a href="#" className="hover:text-cream-50 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cream-50 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-cream-50/40 text-sm">© 2024 ACE Learning Inc. All rights reserved.</p>
          
          <div className="flex gap-6">
            <a href="#" className="text-cream-50/60 hover:text-cream-50 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-cream-50/60 hover:text-cream-50 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-cream-50/60 hover:text-cream-50 transition-colors"><Linkedin size={20} /></a>
            <a href="#" className="text-cream-50/60 hover:text-cream-50 transition-colors"><Github size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};