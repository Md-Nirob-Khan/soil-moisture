import React, { useState } from 'react';
import { 
  Sprout, 
  Droplets, 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Mail,
  UserCheck,
  Check
} from 'lucide-react';
import rotaryFieldLeftBg from '../assets/images/rotary_field_left_1789945457977.jpg';
import rotaryRiserLeftBg from '../assets/images/rotary_riser_left_1789945469420.jpg';
import rotarySprinklerBg from '../assets/images/rotary_sprinkler_field_1789944723444.jpg';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

interface FieldSprinklerScene {
  id: string;
  name: string;
  tag: string;
  url: string;
}

const SPRINKLER_FIELD_SCENES: FieldSprinklerScene[] = [
  {
    id: 'rotary-field-left',
    name: 'Rotary Sprinkler (Left)',
    tag: 'Rotary Impact Arm on Left',
    url: rotaryFieldLeftBg,
  },
  {
    id: 'rotary-riser-left',
    name: 'High-Arc Rotary (Left)',
    tag: 'Rotating Mist Jet on Left',
    url: rotaryRiserLeftBg,
  },
  {
    id: 'rotary-sprinkler-field',
    name: 'Wide Field Spray',
    tag: 'Pasture Irrigation Fan',
    url: rotarySprinklerBg,
  },
];

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo.grower@agriai.io');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedScene, setSelectedScene] = useState<FieldSprinklerScene>(SPRINKLER_FIELD_SCENES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email || 'demo.grower@agriai.io');
  };

  const handleDemoSignIn = (roleEmail: string) => {
    setEmail(roleEmail);
    onLogin(roleEmail);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-x-hidden selection:bg-emerald-300 selection:text-emerald-950">
      
      {/* 1. VIBRANT NATURAL SCENERY: ROTARY FIELD SPRINKLER ON THE LEFT */}
      <div 
        key={selectedScene.id}
        className="fixed inset-0 bg-cover bg-left sm:bg-center bg-no-repeat z-0 transform scale-100 transition-all duration-1000 ease-out"
        style={{
          backgroundImage: `url('${selectedScene.url}')`
        }}
      />
      
      {/* 2. MINIMAL, NATURAL LIGHTING OVERLAY (Clear visibility for the rotary sprinkler on the left) */}
      <div className="fixed inset-0 bg-gradient-to-r from-black/40 via-black/10 to-black/35 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none z-0" />

      {/* TOP FLOATING SCENERY SELECTOR: Rotary Field Sprinkler */}
      <header className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-xs shadow-xl">
          <Droplets className="w-4 h-4 text-cyan-300" />
          <span className="font-semibold hidden sm:inline">Rotary Sprinkler View:</span>
          <div className="flex items-center gap-1 ml-1">
            {SPRINKLER_FIELD_SCENES.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedScene(scene)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  selectedScene.id === scene.id
                    ? 'bg-emerald-500 text-white font-bold shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
                title={`Switch to ${scene.name} (${scene.tag})`}
              >
                {scene.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Container Over Sprinkler & Field Scenery */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 py-6">
        
        {/* LEFT SIDE: Brand presentation with light glass so sprinkler on left remains clearly visible */}
        <div className="w-full lg:w-1/2 text-white">
          <div className="p-7 sm:p-9 rounded-3xl bg-black/25 backdrop-blur-[2px] border border-white/20 shadow-2xl space-y-6">
            
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 ring-4 ring-white/20">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold tracking-tight font-['Space_Grotesk'] text-white drop-shadow-md">
                    AgriAI
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/50 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/50 uppercase tracking-wide">
                    Smart Irrigation
                  </span>
                </div>
                <p className="text-xs text-white/90 font-medium tracking-wide drop-shadow-xs">
                  University UX with AI Research Initiative
                </p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2.5">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight font-['Space_Grotesk'] drop-shadow-lg">
                Smarter Water.<br />
                <span className="text-emerald-300 drop-shadow-lg">
                  Greener Tomorrow.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed drop-shadow-md">
                Continuous soil moisture monitoring and AI-guided watering schedules designed to preserve fresh water, enrich crop yields, and support ecological balance.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/40 text-emerald-200 flex items-center justify-center shrink-0 border border-emerald-400/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block drop-shadow-xs">AI Decisions</span>
                  <span className="text-[11px] text-emerald-200">Weather-aware scheduling</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-sky-500/40 text-sky-200 flex items-center justify-center shrink-0 border border-sky-400/40">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block drop-shadow-xs">Save 20%+ Water</span>
                  <span className="text-[11px] text-sky-200">12,450L saved this month</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-green-500/40 text-green-200 flex items-center justify-center shrink-0 border border-green-400/40">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block drop-shadow-xs">Healthier Crops</span>
                  <span className="text-[11px] text-green-200">Optimal root hydration</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-500/40 text-teal-200 flex items-center justify-center shrink-0 border border-teal-400/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block drop-shadow-xs">Sustainable Future</span>
                  <span className="text-[11px] text-teal-200">Reduced energy use</span>
                </div>
              </div>
            </div>

            {/* Natural Bottom Meta */}
            <div className="flex items-center justify-between text-xs text-white/80 pt-3 border-t border-white/20">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                IoT Telemetry v4.2 Active
              </span>
              <span>24/7 Field Monitoring</span>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Crisp White Card Floating Over the Natural Scenery */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/60">
            
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Agricultural IoT Gateway</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Space_Grotesk'] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Sign in to manage your automated irrigation network
              </p>
            </div>

            {/* Quick 1-Click Role Login Shortcuts */}
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Quick Demo Access:
                </span>
                <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Instant</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('demo.grower@agriai.io')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100/60 text-slate-800 hover:text-emerald-900 border border-emerald-200/80 text-xs font-bold shadow-2xs transition-all cursor-pointer text-left flex items-center justify-between group"
                >
                  <span>🌾 Farm Manager</span>
                  <Check className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('dr.patel@agriscience.edu')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100/60 text-slate-800 hover:text-emerald-900 border border-emerald-200/80 text-xs font-bold shadow-2xs transition-all cursor-pointer text-left flex items-center justify-between group"
                >
                  <span>🔬 Agronomist</span>
                  <Check className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all bg-white"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all bg-white"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-700">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to registered demo email.')}
                  className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                id="login-submit-btn"
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#159947] hover:from-emerald-700 hover:to-[#12883e] text-white font-bold text-sm shadow-md shadow-emerald-700/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Sign In to AgriAI</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                — or continue with —
              </span>
            </div>

            {/* Secondary SSO Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoSignIn('demo.grower@agriai.io')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-emerald-50/40 hover:border-emerald-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer bg-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('demo.grower@agriai.io')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-emerald-50/40 hover:border-emerald-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer bg-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              New to AgriAI?{' '}
              <button
                type="button"
                onClick={() => handleDemoSignIn('demo.grower@agriai.io')}
                className="font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
