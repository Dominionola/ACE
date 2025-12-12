import React from 'react';
import { Check } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-ace-light font-sans font-semibold tracking-widest text-sm uppercase mb-3 block">
            Flexible Plans
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-ace-blue mb-6">
            Invest in your <span className="italic">future</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          
          {/* Free Tier */}
          <div className="p-8 rounded-3xl border border-ace-blue/10 bg-white hover:border-ace-blue/30 transition-colors relative group">
            <h3 className="font-serif text-2xl text-ace-blue mb-2">Scholar</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-ace-blue">$0</span>
              <span className="text-ace-blue/50 text-sm">/month</span>
            </div>
            <p className="text-sm text-ace-blue/60 mb-8 min-h-[40px]">Perfect for trying out the power of AI study tools.</p>
            <button className="w-full py-3 rounded-xl border border-ace-blue/20 text-ace-blue font-medium hover:bg-ace-blue/5 transition-colors mb-8">
              Get Started
            </button>
            <ul className="space-y-4 text-sm text-ace-blue/80">
              <li className="flex gap-3 items-center"><Check size={16} className="text-green-500" /> 5 AI Summaries / mo</li>
              <li className="flex gap-3 items-center"><Check size={16} className="text-green-500" /> Basic Quizzes</li>
              <li className="flex gap-3 items-center"><Check size={16} className="text-green-500" /> 1 Course Folder</li>
            </ul>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-8 rounded-3xl bg-ace-blue text-white shadow-xl relative scale-105 z-10">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-300 to-yellow-500 text-ace-blue text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="font-serif text-2xl mb-2">Dean's List</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">$12</span>
              <span className="text-white/60 text-sm">/month</span>
            </div>
            <p className="text-sm text-white/70 mb-8 min-h-[40px]">Unlimited power for serious students aiming for the top.</p>
            <button className="w-full py-3 rounded-xl bg-white text-ace-blue font-bold hover:bg-cream-50 transition-colors mb-8 shadow-lg">
              Start 7-Day Free Trial
            </button>
            <ul className="space-y-4 text-sm text-white/90">
              <li className="flex gap-3 items-center"><div className="bg-white/20 p-0.5 rounded-full"><Check size={12} /></div> Unlimited AI Summaries</li>
              <li className="flex gap-3 items-center"><div className="bg-white/20 p-0.5 rounded-full"><Check size={12} /></div> Unlimited Practice Exams</li>
              <li className="flex gap-3 items-center"><div className="bg-white/20 p-0.5 rounded-full"><Check size={12} /></div> Grade Prediction Engine</li>
              <li className="flex gap-3 items-center"><div className="bg-white/20 p-0.5 rounded-full"><Check size={12} /></div> Lecture Audio Transcription</li>
            </ul>
          </div>

          {/* Team Tier */}
          <div className="p-8 rounded-3xl border border-ace-blue/10 bg-white hover:border-ace-blue/30 transition-colors relative group">
            <h3 className="font-serif text-2xl text-ace-blue mb-2">Study Group</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-ace-blue">$8</span>
              <span className="text-ace-blue/50 text-sm">/user/mo</span>
            </div>
            <p className="text-sm text-ace-blue/60 mb-8 min-h-[40px]">Collaborative features for study groups (min 3).</p>
            <button className="w-full py-3 rounded-xl border border-ace-blue/20 text-ace-blue font-medium hover:bg-ace-blue/5 transition-colors mb-8">
              Create Group
            </button>
            <ul className="space-y-4 text-sm text-ace-blue/80">
              <li className="flex gap-3 items-center"><Check size={16} className="text-green-500" /> Everything in Dean's List</li>
              <li className="flex gap-3 items-center"><Check size={16} className="text-green-500" /> Shared Note Folders</li>
              <li className="flex gap-3 items-center"><Check size={16} className="text-green-500" /> Competitive Leaderboards</li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};