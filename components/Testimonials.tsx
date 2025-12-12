import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Pre-Med Student",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=200",
    quote: "I used to spend hours making flashcards. ACE does it in seconds from my lecture recordings. It literally saved my GPA this semester.",
    school: "University of Washington"
  },
  {
    name: "Marcus Chen",
    role: "Law Student",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=200",
    quote: "The ability to ask my textbook questions and get citations back is a game changer. It's like having a TA in my pocket 24/7.",
    school: "Yale Law"
  },
  {
    name: "Priya Patel",
    role: "Computer Science",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    quote: "The grade prediction was scary accurate. It told me I needed to focus on Algorithms, and I'm so glad I listened.",
    school: "Georgia Tech"
  }
];

const universities = [
  "Harvard University", "Stanford", "MIT", "Oxford", "Cambridge", "UC Berkeley", "Yale", "Princeton", "Columbia", "UCLA", "University of Toronto", "NUS"
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-cream-50 overflow-hidden">
      
      {/* Marquee Section */}
      <div className="mb-20">
        <p className="text-center text-ace-blue/40 font-sans text-sm font-semibold tracking-widest uppercase mb-8">
          Trusted by students from
        </p>
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cream-50 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cream-50 to-transparent z-10"></div>
          
          <div className="flex whitespace-nowrap animate-marquee">
            {[...universities, ...universities].map((uni, i) => (
              <span key={i} className="mx-8 text-2xl font-serif text-ace-blue/30 italic">
                {uni}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-ace-blue mb-6">
            Join the <span className="italic text-ace-light">community</span>.
          </h2>
          <p className="font-sans text-lg text-ace-blue/70 max-w-2xl mx-auto">
            Studying doesn't have to be a lonely struggle. Join thousands of students who have switched to smarter learning.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-3xl border border-ace-blue/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex gap-1 text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              
              <blockquote className="font-serif text-xl text-ace-blue leading-relaxed mb-8 flex-grow">
                "{t.quote}"
              </blockquote>

              <div className="flex items-center gap-4 mt-auto">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-cream-100"
                />
                <div>
                  <div className="font-sans font-bold text-ace-blue text-sm">{t.name}</div>
                  <div className="font-sans text-xs text-ace-blue/50 uppercase tracking-wide">{t.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Image Banner */}
        <div className="mt-20 rounded-3xl overflow-hidden relative h-64 md:h-80 shadow-2xl group">
           <img 
             src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000" 
             alt="Diverse group of happy students studying together"
             className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-ace-blue/60 flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">Ready to Ace your next exam?</h3>
              <button className="bg-white text-ace-blue px-8 py-3 rounded-full font-medium hover:bg-cream-50 transition-colors shadow-lg">
                Join ACE for Free
              </button>
           </div>
        </div>

      </div>
    </section>
  );
};