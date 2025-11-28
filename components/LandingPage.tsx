import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, FileText, CheckCircle, BrainCircuit, FileBadge } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-white">FLUX</span>
            <span className="text-zinc-500">CAREER</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Templates</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
        
        <div className={`max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-3 mb-6 text-orange-500 font-mono text-xs tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Next Gen AI Resume Builder
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.9]">
            Advanced <br/>
            Career <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
              Systems 2.0
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12">
            Master procedural writing and ATS optimization techniques. A complete ecosystem designed to accelerate your mastery of career advancement.
          </p>

          <button 
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded text-lg font-medium transition-all hover:bg-zinc-800"
          >
            <span className="relative z-10">Start Building</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-orange-500" />
          </button>
        </div>
      </section>

      {/* Grid Section */}
      <section className="border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            
            {/* Card 1 */}
            <div className="p-12 group hover:bg-white/[0.02] transition-colors relative">
              <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-6 group-hover:border-orange-500/30 transition-colors">
                <FileText className="text-zinc-400 group-hover:text-orange-400" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Context</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Analyzes job descriptions to extract key requirements. Yours to keep and use in commercial work.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-12 group hover:bg-white/[0.02] transition-colors">
               <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-6 group-hover:border-purple-500/30 transition-colors">
                <FileBadge className="text-zinc-400 group-hover:text-purple-400" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tailored Resumes</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Rewrite your entire history to match the specific role. Download over 500GB of project files, 4K textures, HDRI maps.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-12 group hover:bg-white/[0.02] transition-colors">
               <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-6 group-hover:border-blue-500/30 transition-colors">
                <BrainCircuit className="text-zinc-400 group-hover:text-blue-400" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Interview Prep</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Experience every detail with our custom high-bitrate streaming player. Smart chapters and timestamped discussions included.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-16 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center min-h-[400px]">
             <span className="text-orange-500 font-mono text-xs mb-4">MODULE 01</span>
             <h2 className="text-4xl font-bold mb-6">Foundations of <br/> Typography</h2>
             <p className="text-zinc-500 leading-relaxed max-w-md">
               Master the basics of document geometry. Learn proper edge flow, polygon management, and how to build clean models ready for ATS systems.
             </p>
          </div>
          <div className="relative bg-zinc-900/50 min-h-[400px] overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/50 to-black"></div>
            {/* Abstract visual */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full group-hover:scale-125 transition-transform duration-700 delay-75"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-orange-500/30 rounded-full group-hover:scale-150 transition-transform duration-700 delay-150"></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 bg-black text-center text-zinc-600 text-sm">
        <p>&copy; 2025 Flux Career Systems. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;