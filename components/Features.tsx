"use client";

import React from 'react';
import { Sparkles, Brain, Clock, Zap, TrendingUp, Search } from 'lucide-react';
import { AnimatedSection } from './animated-section';

export const Features: React.FC = () => {
  return (
    <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">

      {/* Section Header */}
      <AnimatedSection className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
        <span className="text-ace-blue/60 font-sans font-medium tracking-widest text-sm uppercase mb-3 block">
          Designed for Excellence
        </span>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ace-blue mb-6">
          Everything you need to <br className="hidden md:block" />
          <span className="italic text-ace-light">outperform</span> your potential.
        </h2>
        <p className="font-sans text-lg text-ace-blue/70 leading-relaxed">
          Forget rote memorization. ACE uses adaptive AI to help you understand deeper,
          retain longer, and study smarter—not harder.
        </p>
      </AnimatedSection>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">

        {/* Card 1: Main Feature (Large) */}
        <AnimatedSection delay={100} className="group relative md:col-span-2 rounded-3xl overflow-hidden bg-white border border-ace-blue/10 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cream-50 to-white z-0"></div>
          <div className="relative z-10 p-8 md:p-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full text-ace-blue">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-ace-blue">Instant Concept Clarity</h3>
            </div>
            <p className="font-sans text-ace-blue/70 text-lg max-w-md mb-8">
              Upload any lecture slide, textbook page, or handwritten note.
              ACE breaks down complex topics into simple, bite-sized explanations instantly.
            </p>

            {/* Visual: Image with UI Overlay */}
            <div className="relative mt-auto rounded-xl overflow-hidden shadow-2xl border border-ace-blue/5 group-hover:scale-[1.02] transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200"
                alt="Student studying with tablet"
                className="w-full h-64 object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ace-blue/90 via-ace-blue/20 to-transparent flex items-end p-6">
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg w-full max-w-sm border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="min-w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Zap size={16} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ace-blue/50 uppercase tracking-wide mb-1">AI Insight</p>
                      <p className="text-sm font-medium text-ace-blue leading-snug">"The key difference between mitosis and meiosis lies in the genetic diversity of the daughter cells..."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Card 2: Vertical Card (Mobile responsive) */}
        <AnimatedSection delay={200} className="group relative rounded-3xl overflow-hidden bg-ace-blue text-cream-50 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 p-32 bg-ace-light/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <div className="p-2 bg-white/10 w-fit rounded-full text-cream-50 mb-4 backdrop-blur-sm">
                <Brain size={20} />
              </div>
              <h3 className="font-serif text-2xl mb-3">Active Recall Engine</h3>
              <p className="font-sans text-cream-50/70 leading-relaxed">
                Stop passively reading. ACE generates dynamic quizzes that adapt to your weak spots in real-time.
              </p>
            </div>

            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 group-hover:-translate-y-2 transition-transform duration-500">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Quiz Progress</span>
                <span className="text-xs font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded">Top 5%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 mb-4">
                <div className="bg-green-400 h-2 rounded-full w-[85%]"></div>
              </div>
              <p className="text-sm font-serif italic">"What is the primary function of the mitochondria?"</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Card 3: Grade Prediction */}
        <AnimatedSection delay={300} className="group relative rounded-3xl overflow-hidden bg-white border border-ace-blue/10 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-full text-purple-700">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-serif text-xl text-ace-blue">Grade Forecasting</h3>
            </div>
            <p className="font-sans text-sm text-ace-blue/60 mb-6">
              Predict your exam scores based on study habits.
            </p>

            <div className="flex-grow flex items-end justify-center px-2">
              {/* Simulated Graph */}
              <div className="flex items-end gap-2 h-32 w-full pb-4 border-b border-ace-blue/10">
                <div className="w-1/5 bg-ace-blue/10 h-[40%] rounded-t-md group-hover:h-[45%] transition-all duration-700"></div>
                <div className="w-1/5 bg-ace-blue/20 h-[55%] rounded-t-md group-hover:h-[60%] transition-all duration-700 delay-75"></div>
                <div className="w-1/5 bg-ace-blue/40 h-[45%] rounded-t-md group-hover:h-[50%] transition-all duration-700 delay-100"></div>
                <div className="w-1/5 bg-ace-blue/60 h-[70%] rounded-t-md group-hover:h-[80%] transition-all duration-700 delay-150"></div>
                <div className="w-1/5 bg-ace-blue h-[85%] rounded-t-md relative group-hover:h-[95%] transition-all duration-700 delay-200">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ace-blue text-white text-[10px] py-1 px-2 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    A+
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Card 4: Study Planner */}
        <AnimatedSection delay={400} className="group relative rounded-3xl overflow-hidden bg-cream-100 border border-ace-blue/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-full text-orange-700">
                <Clock size={20} />
              </div>
              <h3 className="font-serif text-xl text-ace-blue">Smart Scheduler</h3>
            </div>
            <p className="font-sans text-sm text-ace-blue/60 mb-6">
              Auto-generates study plans around your life.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-ace-blue/5">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-ace-blue/40 uppercase">10:00 AM</p>
                  <p className="text-sm font-medium text-ace-blue">Biochemistry Review</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-ace-blue/5 opacity-60">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-ace-blue/40 uppercase">02:00 PM</p>
                  <p className="text-sm font-medium text-ace-blue">Calculus Quiz</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Card 5: Large Image / Context */}
        <AnimatedSection delay={500} className="group relative md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-3 rounded-3xl overflow-hidden bg-white border border-ace-blue/10 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500 min-h-[300px]">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
            alt="Group study session"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ace-blue/90 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <div className="flex items-center gap-2 mb-2 text-cream-200">
              <Search size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Semantic Search</span>
            </div>
            <h3 className="font-serif text-2xl text-white mb-2">Find answers instantly.</h3>
            <p className="font-sans text-sm text-white/80">
              Don't ctrl+f through 500 pages. Just ask ACE.
            </p>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
};