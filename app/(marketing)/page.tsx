import React from 'react';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Methodology } from '@/components/Methodology';
import { Testimonials } from '@/components/Testimonials';
import { Pricing } from '@/components/Pricing';
import { BookOpen, BrainCircuit, LineChart } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative z-10">
      <Hero />

      {/* Subtle decorative section - serves as transition to features */}
      <div className="relative z-20 -mt-24 pb-0 px-6 max-w-7xl mx-auto animate-fade-in-up delay-200">
        <div className="bg-white/60 backdrop-blur-md border border-ace-blue/5 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start space-y-3 group cursor-default">
              <div className="p-3 rounded-full bg-ace-blue/5 text-ace-blue group-hover:bg-ace-blue group-hover:text-white transition-colors duration-300">
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium">Smart Summaries</h3>
              <p className="text-ace-blue/70 font-sans text-sm leading-relaxed">
                Upload your dense notes and get concise, digestible summaries instantly.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-3 group cursor-default">
              <div className="p-3 rounded-full bg-ace-blue/5 text-ace-blue group-hover:bg-ace-blue group-hover:text-white transition-colors duration-300">
                <BrainCircuit size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium">Active Recall AI</h3>
              <p className="text-ace-blue/70 font-sans text-sm leading-relaxed">
                Personalized quizzes generated from your syllabus to reinforce memory.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-3 group cursor-default">
              <div className="p-3 rounded-full bg-ace-blue/5 text-ace-blue group-hover:bg-ace-blue group-hover:text-white transition-colors duration-300">
                <LineChart size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium">Grade Prediction</h3>
              <p className="text-ace-blue/70 font-sans text-sm leading-relaxed">
                Track your progress and predict exam outcomes with data-driven insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div id="features" className="relative z-20">
        <Features />
      </div>

      <Methodology />

      <Testimonials />

      <Pricing />

    </main>
  );
}
