"use client";
import { useRef } from "react";
import Link from "next/link";
import { Zap, Brain, Lock, Sparkles, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OctoDefenderLogo } from "@/components/OctoDefenderLogo";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Shield } from "@phosphor-icons/react";

export const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef(null);
  const agentsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
  const agentsInView = useInView(agentsRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({ target: heroRef });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const features = [
    {
      icon: Shield,
      title: "Multi-Agent Defense",
      description:
        "8 specialized AI agents work in parallel to analyze threats from every angle",
    },
    {
      icon: Brain,
      title: "Intelligent Analysis",
      description:
        "Machine learning algorithms detect patterns and anomalies in real-time",
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description:
        "Instant threat assessment with live progress tracking and updates",
    },
    {
      icon: Lock,
      title: "Comprehensive Coverage",
      description: "Analyze URLs, IPs, hashes, network logs, and email headers",
    },
  ];

  const agents = [
    { name: "Scout", description: "Initial reconnaissance" },
    { name: "Sentinel", description: "Perimeter defense" },
    { name: "Analyst", description: "Deep analysis" },
    { name: "Isolator", description: "Threat containment" },
    { name: "Remediator", description: "Automated response" },
    { name: "Learner", description: "ML intelligence" },
    { name: "Alerter", description: "Real-time alerts" },
    { name: "Orchestrator", description: "Decision engine" },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans">
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-screen flex items-center justify-center"
      >
        {/* Minimalistic Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e3a8a]/20 via-[#000000] to-[#000000] animate-slow-spin opacity-40"></div>
             <motion.div 
                className="absolute inset-0 opacity-20"
                style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]) }}
             >
                 <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
             </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000] to-[#000]"
          style={{ y: parallaxY, opacity }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 rounded-full"></div>
                  <OctoDefenderLogo
                    className="w-24 h-24 relative z-10"
                    showText={false}
                    animated={true}
                  />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#1e3a8a]/10 border border-[#1e3a8a]/20 backdrop-blur-sm rounded-full px-4 py-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span className="text-xs font-medium text-blue-200/80 uppercase tracking-wider">
                Advanced AI Defense
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tight max-w-5xl mx-auto leading-[1.1]"
            >
              Intelligent Security <br/>
              <span className="text-blue-500 font-light italic">Simplified.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light"
            >
              OctoDefender orchestrates 8 specialized AI agents to detect and neutralize cyber threats in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 text-base font-medium shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-105"
              >
                <Link href="/dashboard">Launch Dashboard</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full px-8 h-12 text-base font-medium"
              >
                <Link href="/about">How it works</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="py-32 border-t border-white/5 bg-black/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl text-white font-semibold mb-4 tracking-tight">
              Why OctoDefender?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Enterprise-grade security accessible to everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover:bg-white/[0.07]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl" />
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-500"
                >
                  <feature.icon className="w-6 h-6" weight="duotone" />
                </motion.div>
                <h3 className="text-xl text-white font-medium mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={agentsRef} className="py-32 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={agentsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
             >
                 <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                     The <span className="text-blue-500">Octopus</span> Architecture
                 </h2>
                 <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                     Just like an octopus uses its distributed nervous system to process information independently in each arm, OctoDefender deploys 8 autonomous agents that work in parallel.
                 </p>
                 <p className="text-gray-400 text-lg leading-relaxed">
                     This decentralized approach ensures faster threat detection and elimination compared to traditional monolithic security systems.
                 </p>
             </motion.div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agents.map((agent, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={agentsInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                        <h4 className="text-white font-medium">{agent.name}</h4>
                        <p className="text-xs text-gray-400">{agent.description}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <OctoDefenderLogo className="w-8 h-8" showText={false} animated={false} />
              <span className="text-gray-400 text-sm">&copy; 2026 OctoDefender. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/iampraiez/Octodef"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm">GitHub</span>
              </a>
              
              <a
                href="https://iampraiez.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-sm">Creator</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;