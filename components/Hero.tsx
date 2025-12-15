import React from 'react';
import { Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full pt-32 pb-40 md:pt-48 md:pb-64 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center text-center px-6">

      {/* Background Image - Scenic Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-cream-100">
        {/* Base Image with Painting Filters */}
        <img
          src="https://images.unsplash.com/photo-1510673322137-06dfc337b51b?q=80&w=2831&auto=format&fit=crop"
          alt="Peaceful bench overlooking a misty lake"
          className="w-full h-full object-cover object-bottom opacity-50 animate-subtle-scale saturate-[0.6] contrast-[0.9] brightness-[1.1] sepia-[0.2]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 15%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)'
          }}
        />

        {/* Soft Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.35] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          filter: 'contrast(320%) brightness(100%)'
        }}></div>

        {/* Color Tints */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream-50 via-cream-50/80 to-transparent mix-blend-lighten"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50/60 via-transparent to-transparent"></div>
      </div>

      {/* Optimized Background Blobs (Using Radial Gradients instead of Filter Blur) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-80">
        {/* Blob 1: Soft Blue (Left) */}
        <div
          className="absolute top-[5%] -left-[10%] w-[45rem] h-[45rem] md:w-[60rem] md:h-[60rem] animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(191, 219, 254, 0.7) 0%, rgba(191, 219, 254, 0) 70%)' }}
        ></div>

        {/* Blob 2: Warm Amber (Right) */}
        <div
          className="absolute top-[15%] -right-[15%] w-[40rem] h-[40rem] md:w-[55rem] md:h-[55rem] animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, rgba(254, 243, 199, 0.7) 0%, rgba(254, 243, 199, 0) 70%)' }}
        ></div>

        {/* Blob 3: Subtle Purple (Center-Bottom) */}
        <div
          className="absolute -bottom-[20%] left-[10%] w-[50rem] h-[50rem] animate-blob animation-delay-4000"
          style={{ background: 'radial-gradient(circle, rgba(233, 213, 255, 0.6) 0%, rgba(233, 213, 255, 0) 70%)' }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center animate-fade-in-up">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ace-blue/10 bg-white/50 backdrop-blur-sm mb-8 hover:bg-white/80 transition-colors cursor-pointer group shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-ace-blue"></div>
          <span className="text-[10px] md:text-xs font-sans font-semibold tracking-wide text-ace-blue/80 uppercase">New AI Model v2.5</span>
          <ArrowRight className="w-3 h-3 text-ace-blue/60 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-ace-blue leading-[1.1] md:leading-[1.1] tracking-tight mb-8">
          The intelligent way to <br />
          <span className="relative inline-block px-2">
            <span className="italic relative z-10">master</span>
            {/* Yellow Marker Underline */}
            <svg className="absolute w-full h-[12px] md:h-[20px] -bottom-1 md:-bottom-3 left-0 z-0 pointer-events-none text-yellow-200/90" viewBox="0 0 100 9" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.00025 6.99997C26.5002 2.99999 70 -2.50002 98 4.49998" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span> your studies.
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-lg md:text-xl text-ace-blue/60 leading-relaxed max-w-2xl mb-10 mx-auto">
          ACE transforms your course materials into interactive study sessions.
          Upload your notes and let our AI create personalized quizzes,
          summaries, and grade-improving insights.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/signup">
            <button className="w-full sm:w-auto px-8 py-4 bg-ace-blue text-white rounded-full font-medium text-lg hover:bg-ace-light transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
              Start Studying for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-ace-blue/20 text-ace-blue rounded-full font-medium text-lg hover:bg-ace-blue/5 transition-all flex items-center justify-center gap-2 group">
            <div className="w-6 h-6 rounded-full border border-ace-blue/30 flex items-center justify-center group-hover:border-ace-blue/60 transition-colors">
              <Play className="w-3 h-3 fill-ace-blue ml-0.5" />
            </div>
            Watch Demo
          </button>
        </div>

      </div>

    </section>
  );
};