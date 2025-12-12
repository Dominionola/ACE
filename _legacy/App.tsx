import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Methodology } from './components/Methodology';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { BookOpen, BrainCircuit, LineChart } from 'lucide-react';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50 text-ace-blue font-serif selection:bg-ace-blue selection:text-white overflow-x-hidden">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
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

      <Footer />

      {/* Decorative background gradients (Optimized) */}
      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0 overflow-hidden">
         <div 
           className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%]" 
           style={{ background: 'radial-gradient(circle, rgba(219, 234, 254, 0.4) 0%, rgba(219, 234, 254, 0) 70%)' }}
         />
         <div 
           className="absolute top-[20%] -right-[10%] w-[40%] h-[40%]" 
           style={{ background: 'radial-gradient(circle, rgba(254, 252, 232, 0.5) 0%, rgba(254, 252, 232, 0) 70%)' }}
         />
      </div>
    </div>
  );
};

export default App;