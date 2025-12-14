"use client";

import React from 'react';
import { Upload, BrainCircuit, Trophy } from 'lucide-react';
import { AnimatedSection } from './animated-section';

export const Methodology: React.FC = () => {
  return (
    <section id="methodology" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-amber-50 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-16 items-center">

          {/* Left Content */}
          <AnimatedSection className="md:w-1/2">
            <span className="text-ace-light font-sans font-semibold tracking-widest text-sm uppercase mb-3 block">
              The Science
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-ace-blue mb-6 leading-tight">
              Why simply "re-reading" <br />
              <span className="italic text-gray-400 line-through decoration-2">doesn't work.</span>
            </h2>
            <p className="font-sans text-lg text-ace-blue/70 mb-8 leading-relaxed">
              Cognitive science shows that <strong className="text-ace-blue">Active Recall</strong> and <strong className="text-ace-blue">Spaced Repetition</strong> are the most effective ways to move information into long-term memory. ACE automates this process for you.
            </p>

            <div className="space-y-8">
              <AnimatedSection delay={100} className="flex gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-ace-blue group-hover:bg-ace-blue group-hover:text-white transition-colors duration-300">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-ace-blue mb-1">1. Input Material</h3>
                  <p className="text-sm text-ace-blue/60">Upload PDFs, recorded lectures, or handwritten notes. Our vision models digitize everything.</p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={200} className="flex gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-ace-blue group-hover:bg-ace-blue group-hover:text-white transition-colors duration-300">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-ace-blue mb-1">2. AI Synthesis</h3>
                  <p className="text-sm text-ace-blue/60">ACE identifies key concepts and generates "knowledge graphs" linking related topics.</p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={300} className="flex gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-ace-blue group-hover:bg-ace-blue group-hover:text-white transition-colors duration-300">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-ace-blue mb-1">3. Adaptive Testing</h3>
                  <p className="text-sm text-ace-blue/60">Daily micro-quizzes that focus only on what you're about to forget.</p>
                </div>
              </AnimatedSection>
            </div>
          </AnimatedSection>

          {/* Right Visual - Interactive Card Stack */}
          <div className="md:w-1/2 relative h-[500px] w-full flex items-center justify-center">

            {/* Back Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[85%] h-[60%] bg-white border border-ace-blue/5 shadow-lg rounded-2xl rotate-[-6deg] opacity-60 scale-90 transition-transform duration-700 hover:rotate-[-8deg]"></div>

            {/* Middle Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[48%] w-[85%] h-[60%] bg-white border border-ace-blue/5 shadow-xl rounded-2xl rotate-[3deg] opacity-80 scale-95 transition-transform duration-700 hover:rotate-[5deg]"></div>

            {/* Front Card (Main) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] bg-white border border-ace-blue/10 shadow-2xl rounded-2xl p-6 md:p-8 animate-float">
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                  Pop Quiz
                </div>
                <span className="text-xs text-ace-blue/40">Due Today</span>
              </div>

              <h4 className="font-serif text-2xl text-ace-blue mb-4">
                Explain the concept of "Opportunity Cost" in microeconomics.
              </h4>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl border border-ace-blue/10 hover:border-ace-blue hover:bg-ace-blue/5 cursor-pointer transition-all group flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-ace-blue/30 group-hover:border-ace-blue flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-ace-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm text-ace-blue/80">The total revenue generated by a sale.</span>
                </div>
                <div className="p-4 rounded-xl border border-ace-blue/10 bg-green-50/50 border-green-200 cursor-pointer transition-all flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-green-500 bg-green-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  </div>
                  <span className="text-sm text-ace-blue/90 font-medium">The value of the next best alternative specifically foregone.</span>
                </div>
                <div className="p-4 rounded-xl border border-ace-blue/10 hover:border-ace-blue hover:bg-ace-blue/5 cursor-pointer transition-all group flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-ace-blue/30 group-hover:border-ace-blue flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-ace-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm text-ace-blue/80">The fixed cost of production.</span>
                </div>
              </div>

              <div className="w-full bg-ace-blue text-white py-3 rounded-xl font-medium text-center shadow-lg shadow-ace-blue/20 cursor-pointer hover:bg-ace-light transition-colors">
                Submit Answer
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};