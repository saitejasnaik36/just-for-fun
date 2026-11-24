import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Shield, AlertTriangle, Radio, Users, Crosshair, BarChart2,
  Clock, Volume2, VolumeX, Key, Play, Pause,
  Plus, CheckCircle, Zap, Compass, Search, Award, AlertCircle,
  MapPin, X, Sparkles, RotateCw, ExternalLink, Activity, Target,
  ChevronRight, RefreshCw, Layers, Eye, Filter
} from 'lucide-react';

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================
type SkillType = 'combat' | 'tech' | 'magic' | 'stealth' | 'flight' | 'strategy' | 'durability';

interface SkillRatings {
  combat: number;
  tech: number;
  magic: number;
  stealth: number;
  flight: number;
  strategy: number;
  durability: number;
}

type ThreatLevel = 1 | 2 | 3 | 4 | 5;
type CrisisStatus = 'Reported' | 'Assessing' | 'Responding' | 'Contained' | 'Resolved';
type CrisisCategory = 'alien invasion' | 'cyber attack' | 'natural disaster' | 'supervillain' | 'terrorism' | 'cosmic threat' | 'mystical';
type HeroStatus = 'Available' | 'Deployed' | 'Injured' | 'Recovering' | 'Off-world';
type UserRole = 'Director' | 'Operator' | 'Viewer';

interface Location {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

interface Crisis {
  id: string;
  title: string;
  type: CrisisCategory;
  location: Location;
  threatLevel: ThreatLevel;
  status: CrisisStatus;
  reportedTime: string;
  description: string;
  requiredSkills: SkillRatings;
}

interface Hero {
  id: string;
  name: string;
  alias: string;
  avatar: string;
  powers: string[];
  skills: SkillRatings;
  location: Location;
  status: HeroStatus;
  health: number; // 0 - 100
  stamina: number; // 0 - 100
  missionsCompleted: number;
}

interface Mission {
  id: string;
  crisisId: string;
  crisisTitle: string;
  heroIds: string[];
  startTime: number;
  durationMs: number;
  progress: number; // 0 to 1
  status: 'In Progress' | 'Success' | 'Failed';
  successChance: number;
  targetLocation: Location;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'DISPATCH' | 'CRISIS_NEW' | 'CRISIS_RESOLVED' | 'ESCALATION' | 'SYSTEM';
  message: string;
  level: 'info' | 'warn' | 'danger' | 'success';
}

// ============================================================================
// AVENGERS HQ COORDINATES
// ============================================================================
const HQ_LOCATION: Location = { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' };

// ============================================================================
// HIGH-FIDELITY WEB AUDIO SYNTHESIZER
// ============================================================================
class AudioSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playClick() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  playAlert() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.linearRampToValueAtTime(920, now + 0.15);
      osc.frequency.linearRampToValueAtTime(460, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.005, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  playDispatch() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.28);
      });
    } catch {}
  }

  playSuccess() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [587.33, 880.00, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.10, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }

  playDanger() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }
}

const audio = new AudioSynth();

// ============================================================================
// INITIAL SEED DATA
// ============================================================================
const INITIAL_HEROES: Hero[] = [
  {
    id: 'h1', name: 'Tony Stark', alias: 'Iron Man', avatar: '⚡',
    powers: ['Arc Reactor Suit', 'Flight', 'Repulsors', 'Nanotech'],
    skills: { combat: 85, tech: 98, magic: 10, stealth: 35, flight: 95, strategy: 92, durability: 88 },
    location: HQ_LOCATION, status: 'Available', health: 95, stamina: 92, missionsCompleted: 42
  },
  {
    id: 'h2', name: 'Steve Rogers', alias: 'Captain America', avatar: '🛡️',
    powers: ['Super Soldier Serum', 'Vibranium Shield', 'Tactical Genius'],
    skills: { combat: 95, tech: 40, magic: 5, stealth: 75, flight: 10, strategy: 98, durability: 88 },
    location: HQ_LOCATION, status: 'Available', health: 100, stamina: 96, missionsCompleted: 58
  },
  {
    id: 'h3', name: 'Thor Odinson', alias: 'Thor', avatar: '⚡',
    powers: ['God of Thunder', 'Mjolnir/Stormbreaker', 'Weather Control'],
    skills: { combat: 96, tech: 20, magic: 90, stealth: 20, flight: 92, strategy: 75, durability: 98 },
    location: { lat: 60.39, lng: 5.32, city: 'New Asgard', country: 'Norway' }, status: 'Available', health: 100, stamina: 100, missionsCompleted: 64
  },
  {
    id: 'h4', name: 'Bruce Banner', alias: 'Hulk', avatar: '🟢',
    powers: ['Gamma Strength', 'Invulnerability', 'Brilliant Scientist'],
    skills: { combat: 98, tech: 85, magic: 5, stealth: 5, flight: 10, strategy: 65, durability: 100 },
    location: HQ_LOCATION, status: 'Available', health: 92, stamina: 85, missionsCompleted: 39
  },
  {
    id: 'h5', name: 'Natasha Romanoff', alias: 'Black Widow', avatar: '🕷️',
    powers: ['Master Spy', 'Martial Arts', 'Espionage', "Widow's Bite"],
    skills: { combat: 92, tech: 70, magic: 5, stealth: 98, flight: 15, strategy: 88, durability: 60 },
    location: { lat: 55.75, lng: 37.61, city: 'Moscow', country: 'Russia' }, status: 'Available', health: 88, stamina: 92, missionsCompleted: 51
  },
  {
    id: 'h6', name: 'Clint Barton', alias: 'Hawkeye', avatar: '🏹',
    powers: ['Master Marksman', 'Trick Arrows', 'Tactical Combat'],
    skills: { combat: 88, tech: 55, magic: 5, stealth: 90, flight: 10, strategy: 82, durability: 60 },
    location: HQ_LOCATION, status: 'Available', health: 85, stamina: 80, missionsCompleted: 45
  },
  {
    id: 'h7', name: 'Peter Parker', alias: 'Spider-Man', avatar: '🕸️',
    powers: ['Spider-Sense', 'Wall-Crawling', 'Web-Shooters', 'Agility'],
    skills: { combat: 85, tech: 88, magic: 10, stealth: 80, flight: 40, strategy: 80, durability: 75 },
    location: HQ_LOCATION, status: 'Available', health: 94, stamina: 95, missionsCompleted: 28
  },
  {
    id: 'h8', name: 'Stephen Strange', alias: 'Doctor Strange', avatar: '🔮',
    powers: ['Master of Mystic Arts', 'Time Manipulation', 'Portals'],
    skills: { combat: 75, tech: 40, magic: 100, stealth: 60, flight: 85, strategy: 92, durability: 70 },
    location: { lat: 40.73, lng: -73.99, city: 'Sanctum Sanctorum', country: 'USA' }, status: 'Available', health: 96, stamina: 90, missionsCompleted: 33
  },
  {
    id: 'h9', name: "T'Challa", alias: 'Black Panther', avatar: '🐾',
    powers: ['Vibranium Habit', 'Enhanced Reflexes', 'Heart-Shaped Herb'],
    skills: { combat: 94, tech: 90, magic: 45, stealth: 92, flight: 20, strategy: 95, durability: 85 },
    location: { lat: 0.5, lng: 30.5, city: 'Birnin Zana', country: 'Wakanda' }, status: 'Available', health: 98, stamina: 96, missionsCompleted: 37
  },
  {
    id: 'h10', name: 'Carol Danvers', alias: 'Captain Marvel', avatar: '🌟',
    powers: ['Cosmic Energy', 'Binary Mode', 'Superluminal Flight'],
    skills: { combat: 94, tech: 50, magic: 40, stealth: 40, flight: 100, strategy: 85, durability: 96 },
    location: { lat: 0, lng: 0, city: 'Deep Space', country: 'Sector 001' }, status: 'Available', health: 100, stamina: 100, missionsCompleted: 50
  },
  {
    id: 'h11', name: 'Scott Lang', alias: 'Ant-Man', avatar: '🐜',
    powers: ['Pym Particles', 'Size Manipulation', 'Insect Communication'],
    skills: { combat: 70, tech: 80, magic: 5, stealth: 95, flight: 30, strategy: 70, durability: 65 },
    location: { lat: 37.77, lng: -122.41, city: 'San Francisco', country: 'USA' }, status: 'Available', health: 90, stamina: 85, missionsCompleted: 22
  },
  {
    id: 'h12', name: 'Wanda Maximoff', alias: 'Scarlet Witch', avatar: '✨',
    powers: ['Chaos Magic', 'Reality Warp', 'Telekinesis', 'Mind Control'],
    skills: { combat: 85, tech: 20, magic: 98, stealth: 50, flight: 80, strategy: 75, durability: 75 },
    location: HQ_LOCATION, status: 'Available', health: 88, stamina: 82, missionsCompleted: 30
  },
  {
    id: 'h13', name: 'Vision', alias: 'Vision', avatar: '💎',
    powers: ['Mind Stone Energy', 'Density Control', 'Synthezoid Intellect'],
    skills: { combat: 86, tech: 95, magic: 60, stealth: 70, flight: 90, strategy: 88, durability: 92 },
    location: HQ_LOCATION, status: 'Available', health: 94, stamina: 95, missionsCompleted: 26
  },
  {
    id: 'h14', name: 'Sam Wilson', alias: 'Falcon', avatar: '🦅',
    powers: ['EXO-7 Wings', 'EXO Recon Drones', 'Aerial Tactics'],
    skills: { combat: 80, tech: 60, magic: 5, stealth: 75, flight: 92, strategy: 80, durability: 65 },
    location: HQ_LOCATION, status: 'Available', health: 91, stamina: 88, missionsCompleted: 31
  },
  {
    id: 'h15', name: 'James Rhodes', alias: 'War Machine', avatar: '🚀',
    powers: ['Heavy Weapons Armor', 'Tactical Missile Barrage', 'Flight'],
    skills: { combat: 88, tech: 90, magic: 5, stealth: 30, flight: 90, strategy: 84, durability: 90 },
    location: HQ_LOCATION, status: 'Available', health: 89, stamina: 86, missionsCompleted: 36
  }
];

const INITIAL_CRISES: Crisis[] = [
  {
    id: 'c1', title: 'Chitauri Fleet Incursion', type: 'alien invasion',
    location: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
    threatLevel: 5, status: 'Reported', reportedTime: '02 MIN AGO',
    description: 'Armored leviathans exiting spatial wormhole over Manhattan skyline.',
    requiredSkills: { combat: 90, tech: 70, magic: 40, stealth: 20, flight: 85, strategy: 85, durability: 90 }
  },
  {
    id: 'c2', title: 'Ultron Cyber Core Breach', type: 'cyber attack',
    location: { lat: 37.5665, lng: 126.9780, city: 'Seoul', country: 'South Korea' },
    threatLevel: 4, status: 'Assessing', reportedTime: '07 MIN AGO',
    description: 'Rogue AI node infiltrating city mainframe and taking control of defense drones.',
    requiredSkills: { combat: 60, tech: 95, magic: 10, stealth: 50, flight: 40, strategy: 88, durability: 60 }
  },
  {
    id: 'c3', title: 'Dark Dimension Temporal Rift', type: 'mystical',
    location: { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'China' },
    threatLevel: 5, status: 'Reported', reportedTime: '12 MIN AGO',
    description: 'Dormammu planar bleed distortion warping city space-time geometry.',
    requiredSkills: { combat: 50, tech: 20, magic: 98, stealth: 30, flight: 60, strategy: 80, durability: 70 }
  },
  {
    id: 'c4', title: 'HYDRA Remnant Siege', type: 'terrorism',
    location: { lat: 44.5, lng: 20.5, city: 'Sokovia', country: 'Eastern Europe' },
    threatLevel: 3, status: 'Assessing', reportedTime: '18 MIN AGO',
    description: 'Heavily armed cellular battalion seizing missile silo installation.',
    requiredSkills: { combat: 85, tech: 65, magic: 0, stealth: 80, flight: 30, strategy: 90, durability: 70 }
  },
  {
    id: 'c5', title: 'Wakandan Perimeter Anomaly', type: 'supervillain',
    location: { lat: 0.5, lng: 30.5, city: 'Birnin Zana', country: 'Wakanda' },
    threatLevel: 3, status: 'Reported', reportedTime: '25 MIN AGO',
    description: 'Cloaked merc unit attempting breach of Vibranium mining network.',
    requiredSkills: { combat: 80, tech: 85, magic: 20, stealth: 90, flight: 20, strategy: 85, durability: 65 }
  },
  {
    id: 'c6', title: 'Kree Dreadnought Orbital Lock', type: 'cosmic threat',
    location: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
    threatLevel: 4, status: 'Reported', reportedTime: '31 MIN AGO',
    description: 'Hostile Kree battle-cruiser charging thermal beam cannon in upper atmosphere.',
    requiredSkills: { combat: 85, tech: 80, magic: 30, stealth: 20, flight: 95, strategy: 75, durability: 85 }
  },
  {
    id: 'c7', title: 'AIM Mutagenic Bio-Lab Leak', type: 'supervillain',
    location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
    threatLevel: 3, status: 'Assessing', reportedTime: '40 MIN AGO',
    description: 'Gen-2 Extremis formula aerosolizing inside downtown lab structure.',
    requiredSkills: { combat: 60, tech: 90, magic: 10, stealth: 60, flight: 30, strategy: 75, durability: 70 }
  },
  {
    id: 'c8', title: 'Maggia Syndicate Heist Raid', type: 'terrorism',
    location: { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' },
    threatLevel: 2, status: 'Reported', reportedTime: '48 MIN AGO',
    description: 'Armed raid stealing Chitauri energy cell prototypes from tech exhibit.',
    requiredSkills: { combat: 75, tech: 60, magic: 0, stealth: 85, flight: 10, strategy: 70, durability: 50 }
  },
  {
    id: 'c9', title: 'Frost Giant Thermal Drop', type: 'mystical',
    location: { lat: 59.9139, lng: 10.7522, city: 'Oslo', country: 'Norway' },
    threatLevel: 4, status: 'Assessing', reportedTime: '55 MIN AGO',
    description: 'Casket of Ancient Winters power surge freezing fjord harbor.',
    requiredSkills: { combat: 88, tech: 20, magic: 90, stealth: 20, flight: 50, strategy: 70, durability: 90 }
  },
  {
    id: 'c10', title: 'Sovereign Drone Hive Assault', type: 'cosmic threat',
    location: { lat: 30.0444, lng: 31.2357, city: 'Cairo', country: 'Egypt' },
    threatLevel: 3, status: 'Reported', reportedTime: '01 HR AGO',
    description: 'Gold-alloy autonomous drone swarm attacking telecommunications hub.',
    requiredSkills: { combat: 75, tech: 85, magic: 10, stealth: 40, flight: 88, strategy: 75, durability: 75 }
  }
];

const PRESET_TEAMS = [
  { name: 'Original Six', heroIds: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
  { name: 'Space Response', heroIds: ['h1', 'h3', 'h10', 'h13'] },
  { name: 'Stealth Ops', heroIds: ['h2', 'h5', 'h6', 'h7', 'h9', 'h11'] },
  { name: 'Cosmic Vanguard', heroIds: ['h3', 'h8', 'h10', 'h12'] },
  { name: 'Mystic Guard', heroIds: ['h8', 'h12', 'h3', 'h13'] }
];

// Helper to compute geographic spherical distance
function getGeoDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Hero Card Metadata profiles
interface HeroCardMeta {
  powerLevel: number;
  tier: 'OMEGA' | 'LEGENDARY' | 'EPIC' | 'ELITE';
  tierColor: string;
  gradient: string;
  accentHex: string;
  cardNumber: string;
  factoid: string;
}

const HERO_CARD_PROFILES: Record<string, {
  gradient: string;
  accentHex: string;
  cardNumber: string;
  factoid: string;
  powerBonus: number;
}> = {
  h1: {
    gradient: 'from-amber-600/30 via-red-900/50 to-neutral-950',
    accentHex: '#FF6A1A',
    cardNumber: 'S2-01',
    factoid: 'Mark LXXXV nanotech armor channels cosmic-grade energy and adapts instantaneously in combat.',
    powerBonus: 7
  },
  h2: {
    gradient: 'from-blue-600/30 via-indigo-900/50 to-neutral-950',
    accentHex: '#38BDF8',
    cardNumber: 'S2-02',
    factoid: 'Wields an indestructible Vibranium shield and leads the Avengers with unmatched battlefield strategy.',
    powerBonus: 4
  },
  h3: {
    gradient: 'from-cyan-500/30 via-blue-900/50 to-neutral-950',
    accentHex: '#00F0FF',
    cardNumber: 'S2-03',
    factoid: 'Asgardian God of Thunder capable of summoning the Bifrost with the enchanted axe Stormbreaker.',
    powerBonus: 11
  },
  h4: {
    gradient: 'from-emerald-600/30 via-green-950/60 to-neutral-950',
    accentHex: '#10B981',
    cardNumber: 'S2-04',
    factoid: 'Gamma-powered colossus whose physical strength scales upward without known upper limit.',
    powerBonus: 10
  },
  h5: {
    gradient: 'from-rose-600/30 via-neutral-900 to-neutral-950',
    accentHex: '#F43F5E',
    cardNumber: 'S2-05',
    factoid: 'Former Red Room operative and S.H.I.E.L.D. master spy with elite covert infiltration clearance.',
    powerBonus: 2
  },
  h6: {
    gradient: 'from-purple-600/30 via-indigo-950/60 to-neutral-950',
    accentHex: '#A855F7',
    cardNumber: 'S2-06',
    factoid: 'Never misses a shot—equips custom S.H.I.E.L.D. tactical trick arrows for any combat scenario.',
    powerBonus: 1
  },
  h7: {
    gradient: 'from-red-600/30 via-blue-950/60 to-neutral-950',
    accentHex: '#EF4444',
    cardNumber: 'S2-07',
    factoid: 'Precognitive Spider-Sense combined with genius-level web-fluid chemistry and superhuman agility.',
    powerBonus: 4
  },
  h8: {
    gradient: 'from-violet-600/30 via-fuchsia-950/60 to-neutral-950',
    accentHex: '#C084FC',
    cardNumber: 'S2-08',
    factoid: 'Guardian of the Sanctum Sanctorum, defending Earth from interdimensional and mystical threats.',
    powerBonus: 10
  },
  h9: {
    gradient: 'from-purple-500/30 via-neutral-900 to-neutral-950',
    accentHex: '#8B5CF6',
    cardNumber: 'S2-09',
    factoid: 'King of Wakanda clad in kinetic-absorbing Vibranium weave enhanced by the Heart-Shaped Herb.',
    powerBonus: 6
  },
  h10: {
    gradient: 'from-amber-500/30 via-rose-950/60 to-neutral-950',
    accentHex: '#FBBF24',
    cardNumber: 'S2-10',
    factoid: 'Imbued with Tesseract energy—capable of Binary cosmic blasts and faster-than-light flight.',
    powerBonus: 13
  },
  h11: {
    gradient: 'from-red-500/30 via-zinc-900 to-neutral-950',
    accentHex: '#F87171',
    cardNumber: 'S2-11',
    factoid: 'Harnesses Pym Particles to shrink to subatomic Quantum Realm scale or grow to Giant-Man size.',
    powerBonus: 2
  },
  h12: {
    gradient: 'from-rose-600/30 via-red-950/60 to-neutral-950',
    accentHex: '#FB7185',
    cardNumber: 'S2-12',
    factoid: 'Nexus Being wielding Chaos Magic capable of spontaneous reality manipulation and telekinesis.',
    powerBonus: 12
  },
  h13: {
    gradient: 'from-teal-500/30 via-emerald-950/60 to-neutral-950',
    accentHex: '#2DD4BF',
    cardNumber: 'S2-13',
    factoid: 'Vibranium synthezoid powered by solar energy and capable of molecular density phasing.',
    powerBonus: 8
  },
  h14: {
    gradient: 'from-sky-600/30 via-neutral-900 to-neutral-950',
    accentHex: '#38BDF8',
    cardNumber: 'S2-14',
    factoid: 'EXO-7 Falcon wing harness paired with Redwing recon drone for precision aerial superiority.',
    powerBonus: 2
  },
  h15: {
    gradient: 'from-slate-500/30 via-zinc-900 to-neutral-950',
    accentHex: '#94A3B8',
    cardNumber: 'S2-15',
    factoid: 'Heavy-ordnance Stark tactical armor outfitted with shoulder-mounted minigun and micro-missiles.',
    powerBonus: 5
  }
};

function getHeroCardMeta(hero: Hero): HeroCardMeta {
  const profile = HERO_CARD_PROFILES[hero.id] || {
    gradient: 'from-zinc-800/40 via-neutral-900 to-neutral-950',
    accentHex: '#FF6A1A',
    cardNumber: 'S2-00',
    factoid: 'Verified S.H.I.E.L.D. Avenger operative cleared for global tactical response.',
    powerBonus: 0
  };

  const vals = Object.values(hero.skills).sort((a, b) => b - a);
  const top4Avg = vals.slice(0, 4).reduce((s, v) => s + v, 0) / 4;
  const allAvg = vals.reduce((s, v) => s + v, 0) / vals.length;
  const powerLevel = Math.min(99, Math.round(top4Avg * 0.62 + allAvg * 0.38 + profile.powerBonus));

  const tier: HeroCardMeta['tier'] =
    powerLevel >= 94 ? 'OMEGA' :
    powerLevel >= 88 ? 'LEGENDARY' :
    powerLevel >= 80 ? 'EPIC' : 'ELITE';

  const tierColor =
    tier === 'OMEGA' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
    tier === 'LEGENDARY' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
    tier === 'EPIC' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' :
    'bg-sky-500/20 text-sky-300 border-sky-500/50';

  return {
    powerLevel,
    tier,
    tierColor,
    gradient: profile.gradient,
    accentHex: profile.accentHex,
    cardNumber: profile.cardNumber,
    factoid: profile.factoid
  };
}

// ============================================================================
// MAIN S.H.I.E.L.D. COMMAND TERMINAL
// ============================================================================
export default function App() {
  const [role, setRole] = useState<UserRole>('Director');
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'AVENGERS' | 'BUILDER' | 'ANALYTICS'>('COMMAND');
  const [muted, setMuted] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [utcTime, setUtcTime] = useState<string>('');

  const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
  const [crises, setCrises] = useState<Crisis[]>(INITIAL_CRISES);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [auditLogs, setAuditLogs] = useState<LogEntry[]>([
    { id: 'log-1', timestamp: new Date().toISOString().substring(11, 19), type: 'SYSTEM', message: 'S.H.I.E.L.D. Global Command Terminal online. Orbital Defense Grid synced.', level: 'info' }
  ]);

  // Selections & focus
  const [selectedCrisisId, setSelectedCrisisId] = useState<string>('c1');
  const [strikeTeamIds, setStrikeTeamIds] = useState<string[]>(['h1', 'h2', 'h3']);
  const [focusedLocation, setFocusedLocation] = useState<Location | null>(null);
  const [heroSearch, setHeroSearch] = useState<string>('');
  const [heroFilterSkill, setHeroFilterSkill] = useState<string>('ALL');
  const [heroFilterStatus, setHeroFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warn' | 'danger' } | null>(null);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warn' | 'danger' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  // Form state for creating crises
  const [newCrisisForm, setNewCrisisForm] = useState<{
    title: string;
    type: CrisisCategory;
    city: string;
    country: string;
    lat: number;
    lng: number;
    threatLevel: ThreatLevel;
    description: string;
  }>({
    title: '',
    type: 'alien invasion',
    city: '',
    country: '',
    lat: 0,
    lng: 0,
    threatLevel: 3,
    description: ''
  });

  // Sync audio mute
  useEffect(() => {
    audio.muted = muted;
  }, [muted]);

  // Real-time UTC clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Threat Level
  const globalThreatLevel = useMemo(() => {
    const active = crises.filter(c => c.status !== 'Resolved' && c.status !== 'Contained');
    if (active.length === 0) return 1.0;
    const sum = active.reduce((acc, curr) => acc + curr.threatLevel, 0);
    return Math.min(5.0, Number((sum / active.length).toFixed(1)));
  }, [crises]);

  const selectedCrisis = useMemo(() => {
    return crises.find(c => c.id === selectedCrisisId) || crises[0];
  }, [crises, selectedCrisisId]);

  const addLog = useCallback((type: LogEntry['type'], message: string, level: LogEntry['level']) => {
    const newEntry: LogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().substring(11, 19),
      type, message, level
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  }, []);

  // Simulation mode timer
  useEffect(() => {
    if (!simulationActive) return;
    const interval = setInterval(() => {
      const randomCities = [
        { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.40 },
        { city: 'Sydney', country: 'Australia', lat: -33.86, lng: 151.20 },
        { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.90, lng: -43.17 },
        { city: 'Mumbai', country: 'India', lat: 19.07, lng: 72.87 },
        { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38 },
        { city: 'Kyoto', country: 'Japan', lat: 35.01, lng: 135.76 }
      ];
      const randLoc = randomCities[Math.floor(Math.random() * randomCities.length)];
      const randTypes: CrisisCategory[] = ['alien invasion', 'cyber attack', 'supervillain', 'mystical', 'cosmic threat'];
      const randType = randTypes[Math.floor(Math.random() * randTypes.length)];
      const threatLvl = (Math.floor(Math.random() * 4) + 2) as ThreatLevel;

      const newC: Crisis = {
        id: 'c-sim-' + Date.now().toString().slice(-4),
        title: `Simulated ${randType.toUpperCase()} Flare`,
        type: randType,
        location: randLoc,
        threatLevel: threatLvl,
        status: 'Reported',
        reportedTime: 'JUST NOW',
        description: `Automated S.H.I.E.L.D. orbital sensors detect high-energy signature in ${randLoc.city}.`,
        requiredSkills: {
          combat: Math.floor(Math.random() * 40) + 50,
          tech: Math.floor(Math.random() * 40) + 50,
          magic: randType === 'mystical' ? 90 : 20,
          stealth: Math.floor(Math.random() * 40) + 30,
          flight: Math.floor(Math.random() * 40) + 50,
          strategy: 80,
          durability: 70
        }
      };

      setCrises(prev => [newC, ...prev]);
      audio.playAlert();
      addLog('CRISIS_NEW', `NEW THREAT DETECTED: Level ${threatLvl} ${newC.title} in ${randLoc.city}`, 'danger');
      showToast(`Tactical Alert: Threat Level ${threatLvl} in ${randLoc.city}`, 'warn');
    }, 40000);

    return () => clearInterval(interval);
  }, [simulationActive, addLog, showToast]);

  // Mission engine
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      setMissions(prevMissions => {
        return prevMissions.map(m => {
          if (m.status !== 'In Progress') return m;
          const elapsed = now - m.startTime;
          const progress = Math.min(1, elapsed / m.durationMs);

          if (progress >= 1) {
            const isSuccess = Math.random() * 100 <= m.successChance;
            const outcomeStatus = isSuccess ? 'Success' : 'Failed';

            setTimeout(() => {
              if (isSuccess) {
                setCrises(prevC => prevC.map(c => c.id === m.crisisId ? { ...c, status: 'Contained' } : c));
                audio.playSuccess();
                addLog('CRISIS_RESOLVED', `MISSION SUCCESS: ${m.crisisTitle} has been CONTAINED!`, 'success');
                showToast(`Mission Accomplished: ${m.crisisTitle} Contained!`, 'success');
              } else {
                setCrises(prevC => prevC.map(c => c.id === m.crisisId ? { ...c, threatLevel: Math.min(5, c.threatLevel + 1) as ThreatLevel, status: 'Assessing' } : c));
                audio.playDanger();
                addLog('ESCALATION', `MISSION FAILED: Threat in ${m.crisisTitle} ESCALATED!`, 'danger');
                showToast(`Mission Failed: Threat Escalated in ${m.crisisTitle}`, 'danger');
              }

              setHeroes(prevH => prevH.map(h => {
                if (m.heroIds.includes(h.id)) {
                  return {
                    ...h,
                    status: 'Available',
                    stamina: Math.max(20, h.stamina - (isSuccess ? 15 : 35)),
                    health: isSuccess ? h.health : Math.max(30, h.health - 25),
                    missionsCompleted: h.missionsCompleted + 1
                  };
                }
                return h;
              }));
            }, 0);

            return { ...m, progress: 1, status: outcomeStatus };
          }

          return { ...m, progress };
        });
      });
    }, 200);

    return () => clearInterval(ticker);
  }, [addLog, showToast]);

  // Dispatch Mission
  const handleDispatch = (crisisId: string, teamIds: string[]) => {
    if (role === 'Viewer') return;
    if (teamIds.length === 0) {
      showToast('No heroes assigned to strike team!', 'warn');
      return;
    }

    const targetCrisis = crises.find(c => c.id === crisisId);
    if (!targetCrisis) return;

    const team = heroes.filter(h => teamIds.includes(h.id));
    if (team.some(h => h.status !== 'Available')) {
      showToast('Some operatives are currently deployed or unavailable!', 'warn');
      return;
    }

    const coverage = calculateCoverage(team, targetCrisis.requiredSkills);
    const synergy = calculateSynergy(team);
    const successChance = Math.min(98, Math.max(15, Math.round(coverage * 0.7 + synergy * 0.3)));

    const newMission: Mission = {
      id: 'MSN-' + Math.floor(Math.random() * 9000 + 1000),
      crisisId,
      crisisTitle: targetCrisis.title,
      heroIds: teamIds,
      startTime: Date.now(),
      durationMs: 14000,
      progress: 0,
      status: 'In Progress',
      successChance,
      targetLocation: targetCrisis.location
    };

    setCrises(prev => prev.map(c => c.id === crisisId ? { ...c, status: 'Responding' } : c));
    setHeroes(prev => prev.map(h => teamIds.includes(h.id) ? { ...h, status: 'Deployed' } : h));
    setMissions(prev => [newMission, ...prev]);

    audio.playDispatch();
    addLog('DISPATCH', `AVENGERS ASSEMBLED: Dispatched to ${targetCrisis.title} (${targetCrisis.location.city}). Success Est: ${successChance}%`, 'info');
    showToast(`Avengers Dispatched to ${targetCrisis.location.city}! Estimated Success: ${successChance}%`, 'info');

    setFocusedLocation(targetCrisis.location);
    setActiveTab('COMMAND');
  };

  // Auto-Assemble Algorithm
  const handleAutoAssemble = (crisis: Crisis) => {
    audio.playClick();
    const availableHeroes = heroes.filter(h => h.status === 'Available');
    if (availableHeroes.length === 0) {
      showToast('No operatives currently available!', 'warn');
      return;
    }

    const req = crisis.requiredSkills;
    const scored = availableHeroes.map(h => {
      const matchScore = Object.keys(req).reduce((acc, key) => {
        const k = key as SkillType;
        return acc + (h.skills[k] * (req[k] / 100));
      }, 0);

      const dist = getGeoDistance(h.location, crisis.location);
      const proxScore = Math.max(0, 100 - (dist / 100));
      const staminaMultiplier = h.stamina / 100;

      return {
        hero: h,
        totalScore: (matchScore * 0.8 + proxScore * 0.2) * staminaMultiplier
      };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    const bestIds = scored.slice(0, 5).map(s => s.hero.id);
    setStrikeTeamIds(bestIds);
    showToast(`Assembled optimal ${bestIds.length}-operative strike team!`, 'success');
  };

  // Escalate
  const handleEscalate = (crisisId: string) => {
    if (role !== 'Director') return;
    audio.playAlert();
    setCrises(prev => prev.map(c => {
      if (c.id === crisisId) {
        const nextLvl = Math.min(5, c.threatLevel + 1) as ThreatLevel;
        addLog('ESCALATION', `DIRECTOR OVERRIDE: Escalated ${c.title} to Level ${nextLvl}`, 'warn');
        showToast(`Threat Escalated to Level ${nextLvl}`, 'warn');
        return { ...c, threatLevel: nextLvl };
      }
      return c;
    }));
  };

  // Resolve
  const handleResolve = (crisisId: string) => {
    if (role !== 'Director') return;
    audio.playSuccess();
    setCrises(prev => prev.map(c => {
      if (c.id === crisisId) {
        addLog('CRISIS_RESOLVED', `DIRECTOR OVERRIDE: Resolved ${c.title}`, 'success');
        showToast(`Crisis Resolved by Director Directive`, 'success');
        return { ...c, status: 'Resolved' };
      }
      return c;
    }));
  };

  // Create Crisis
  const handleCreateCrisis = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'Director') return;
    const created: Crisis = {
      id: 'c-manual-' + Date.now(),
      title: newCrisisForm.title || 'Unknown Threat',
      type: newCrisisForm.type,
      location: {
        lat: Number(newCrisisForm.lat),
        lng: Number(newCrisisForm.lng),
        city: newCrisisForm.city || 'Unassigned',
        country: newCrisisForm.country || 'Global'
      },
      threatLevel: newCrisisForm.threatLevel,
      status: 'Reported',
      reportedTime: 'JUST NOW',
      description: newCrisisForm.description || 'Manual entry via S.H.I.E.L.D. Director clearance.',
      requiredSkills: { combat: 75, tech: 70, magic: 40, stealth: 50, flight: 60, strategy: 75, durability: 70 }
    };

    setCrises(prev => [created, ...prev]);
    setSelectedCrisisId(created.id);
    setShowCreateModal(false);
    audio.playAlert();
    addLog('CRISIS_NEW', `DIRECTOR CREATED THREAT: Level ${created.threatLevel} ${created.title}`, 'danger');
    showToast(`New Threat Beacon Transmitted: ${created.title}`, 'info');
  };

  // Filtered Heroes
  const filteredHeroes = useMemo(() => {
    return heroes.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(heroSearch.toLowerCase()) ||
                            h.alias.toLowerCase().includes(heroSearch.toLowerCase()) ||
                            h.powers.some(p => p.toLowerCase().includes(heroSearch.toLowerCase()));

      const matchesStatus = heroFilterStatus === 'ALL' || h.status === heroFilterStatus;

      let matchesSkill = true;
      if (heroFilterSkill !== 'ALL') {
        const sk = heroFilterSkill.toLowerCase() as SkillType;
        matchesSkill = h.skills[sk] >= 75;
      }

      return matchesSearch && matchesStatus && matchesSkill;
    });
  }, [heroes, heroSearch, heroFilterStatus, heroFilterSkill]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070A10] text-[#E2E8F0] font-mono-tech overflow-hidden select-none relative bg-tactical-grid">
      {/* =========================================================================
          TOP COMMAND HEADER
      ========================================================================= */}
      <header className="h-16 border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur-md flex items-stretch justify-between z-40 relative px-2 sm:px-4">
        {/* BRAND & CALLSIGN */}
        <div className="flex items-center space-x-3 pr-4 border-r border-white/10 min-w-[220px]">
          <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#FF6A1A] to-[#E55A10] chamfer-sm shadow-[0_0_15px_rgba(255,106,26,0.5)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display-tech font-black tracking-widest text-lg text-white leading-none">
                S.H.I.E.L.D.
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FF6A1A]/20 text-[#FF6A1A] border border-[#FF6A1A]/40 tracking-wider uppercase chamfer-sm">
                COMMAND
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 tracking-tight truncate max-w-[200px]">
              Strategic Defense Operations Grid
            </p>
          </div>
        </div>

        {/* CENTER NAVIGATION BUTTONS */}
        <nav className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 border-r border-white/10 text-xs font-semibold">
          {[
            { id: 'COMMAND', label: 'Command Center', icon: Compass },
            { id: 'AVENGERS', label: 'Avengers Cards', icon: Award },
            { id: 'BUILDER', label: 'Team Builder', icon: Users },
            { id: 'ANALYTICS', label: 'Telemetry & Logs', icon: BarChart2 }
          ].map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { audio.playClick(); setActiveTab(item.id as any); }}
                className={`px-3 py-2 transition-all flex items-center space-x-2 chamfer-sm relative ${
                  isActive
                    ? 'text-white font-bold bg-[#FF6A1A] shadow-[0_0_14px_rgba(255,106,26,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* METRICS STRIP */}
        <div className="hidden xl:flex items-center space-x-5 px-4 border-r border-white/10 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
            <span className="text-zinc-400 uppercase font-semibold">DEFCON:</span>
            <span className="font-bold text-white px-2 py-0.5 bg-red-950/60 border border-red-500/40 rounded">
              LVL {globalThreatLevel} / 5.0
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-mono">{utcTime || '12:00:00 UTC'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-[#FF6A1A]" />
            <span className="font-bold text-[#FF6A1A]">
              {crises.filter(c => c.status !== 'Resolved' && c.status !== 'Contained').length} ACTIVE BEACONS
            </span>
          </div>
        </div>

        {/* ROLE, SIMULATION & AUDIO TOGGLES */}
        <div className="flex items-center space-x-2 pl-2">
          {/* ROLE SELECTOR */}
          <div className="flex items-center space-x-1.5 bg-[#0F172A] border border-white/15 px-2.5 py-1.5 chamfer-sm">
            <Key className="w-3.5 h-3.5 text-[#FF6A1A]" />
            <select
              value={role}
              onChange={(e) => { audio.playClick(); setRole(e.target.value as UserRole); }}
              className="bg-transparent text-[11px] font-bold text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="Director" className="bg-[#0F172A] text-white">Director (Full Access)</option>
              <option value="Operator" className="bg-[#0F172A] text-white">Operator (Dispatch)</option>
              <option value="Viewer" className="bg-[#0F172A] text-white">Viewer (Read-Only)</option>
            </select>
          </div>

          {/* SIMULATION TOGGLE */}
          <button
            onClick={() => { audio.playClick(); setSimulationActive(!simulationActive); }}
            title="Toggle Automated Crisis Simulation Mode"
            className={`chamfer-btn px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              simulationActive
                ? 'bg-gradient-to-r from-[#FF6A1A] to-[#EA580C] text-white shadow-[0_0_12px_rgba(255,106,26,0.4)]'
                : 'bg-zinc-800 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            {simulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{simulationActive ? 'SIM LIVE' : 'SIM OFF'}</span>
          </button>

          {/* AUDIO MUTE TOGGLE */}
          <button
            onClick={() => { setMuted(!muted); }}
            className={`p-2 border chamfer-sm transition-colors ${
              muted
                ? 'bg-zinc-800/80 border-white/15 text-zinc-500'
                : 'bg-[#0F172A] border-cyan-500/40 text-cyan-400 hover:border-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
            }`}
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN WORKSPACE WITH SIDE RAIL & VIEWS
      ========================================================================= */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* LEFT COMPACT RAIL */}
        <div className="hidden lg:flex w-12 border-r border-white/10 bg-[#090D16] flex-col items-center justify-between py-4 z-30 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
            <Crosshair className="w-4 h-4 text-[#FF6A1A]" />
          </div>
          <div className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-bold [writing-mode:vertical-rl] rotate-180">
            S.H.I.E.L.D. // ORBITAL DEFENSE
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
        </div>

        {/* ACTIVE TAB VIEWPORT */}
        <div className="flex-1 overflow-hidden relative flex">
          {activeTab === 'COMMAND' && (
            <CommandCenterTab
              role={role}
              crises={crises}
              heroes={heroes}
              missions={missions}
              selectedCrisisId={selectedCrisisId}
              onSelectCrisis={(id) => {
                setSelectedCrisisId(id);
                const found = crises.find(c => c.id === id);
                if (found) setFocusedLocation(found.location);
              }}
              focusedLocation={focusedLocation}
              heroSearch={heroSearch}
              setHeroSearch={setHeroSearch}
              heroFilterSkill={heroFilterSkill}
              setHeroFilterSkill={setHeroFilterSkill}
              heroFilterStatus={heroFilterStatus}
              setHeroFilterStatus={setHeroFilterStatus}
              filteredHeroes={filteredHeroes}
              onOpenBuilder={(cId) => {
                setSelectedCrisisId(cId);
                setActiveTab('BUILDER');
              }}
              onEscalate={handleEscalate}
              onResolve={handleResolve}
              onOpenCreateModal={() => setShowCreateModal(true)}
            />
          )}

          {activeTab === 'AVENGERS' && (
            <AvengersShowcaseTab
              role={role}
              heroes={heroes}
              strikeTeamIds={strikeTeamIds}
              onToggleStrikeTeam={(heroId) => {
                if (role === 'Viewer') return;
                audio.playClick();
                setStrikeTeamIds(prev => {
                  if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
                  if (prev.length >= 6) {
                    showToast('Strike team capacity reached (Max 6 Operatives)', 'warn');
                    return prev;
                  }
                  showToast('Operative drafted to strike squad', 'info');
                  return [...prev, heroId];
                });
              }}
              onOpenTeamBuilder={() => {
                audio.playClick();
                setActiveTab('BUILDER');
              }}
            />
          )}

          {activeTab === 'BUILDER' && (
            <TeamBuilderTab
              role={role}
              crises={crises}
              heroes={heroes}
              selectedCrisis={selectedCrisis}
              onSelectCrisisId={setSelectedCrisisId}
              strikeTeamIds={strikeTeamIds}
              setStrikeTeamIds={setStrikeTeamIds}
              onAutoAssemble={() => handleAutoAssemble(selectedCrisis)}
              onDispatch={() => handleDispatch(selectedCrisis.id, strikeTeamIds)}
              onNotify={showToast}
            />
          )}

          {activeTab === 'ANALYTICS' && (
            <AnalyticsTab
              crises={crises}
              heroes={heroes}
              missions={missions}
              auditLogs={auditLogs}
            />
          )}
        </div>
      </div>

      {/* =========================================================================
          HUD TOAST NOTIFICATION
      ========================================================================= */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 border text-xs font-bold shadow-2xl flex items-center space-x-3 chamfer-sm animate-bounce ${
          toastMessage.type === 'danger'
            ? 'bg-red-950/90 border-red-500 text-red-200'
            : toastMessage.type === 'warn'
            ? 'bg-amber-950/90 border-amber-500 text-amber-200'
            : toastMessage.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            : 'bg-[#0E1526]/95 border-[#FF6A1A] text-white'
        }`}>
          <AlertTriangle className="w-4 h-4 text-[#FF6A1A] flex-shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* =========================================================================
          DIRECTOR CRISIS CREATION MODAL
      ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#0E1526] border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] chamfer-card relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-[#FF6A1A]" />
                <h3 className="font-display-tech text-sm font-bold text-white uppercase tracking-wider">
                  S.H.I.E.L.D. Threat Broadcast
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrisis} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold uppercase mb-1">Threat Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Leviathan Swarm Incursion"
                  value={newCrisisForm.title}
                  onChange={e => setNewCrisisForm({ ...newCrisisForm, title: e.target.value })}
                  className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">Category</label>
                  <select
                    value={newCrisisForm.type}
                    onChange={e => setNewCrisisForm({ ...newCrisisForm, type: e.target.value as CrisisCategory })}
                    className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1A]"
                  >
                    <option value="alien invasion">Alien Invasion</option>
                    <option value="cyber attack">Cyber Attack</option>
                    <option value="natural disaster">Natural Disaster</option>
                    <option value="supervillain">Supervillain</option>
                    <option value="terrorism">Terrorism</option>
                    <option value="cosmic threat">Cosmic Threat</option>
                    <option value="mystical">Mystical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">Threat Level (1-5)</label>
                  <select
                    value={newCrisisForm.threatLevel}
                    onChange={e => setNewCrisisForm({ ...newCrisisForm, threatLevel: Number(e.target.value) as ThreatLevel })}
                    className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1A]"
                  >
                    <option value={1}>1 - Low Tactical</option>
                    <option value={2}>2 - Moderate</option>
                    <option value={3}>3 - High Threat</option>
                    <option value={4}>4 - Severe (Avenger Level)</option>
                    <option value={5}>5 - Catastrophic / Cosmic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">City</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Geneva"
                    value={newCrisisForm.city}
                    onChange={e => setNewCrisisForm({ ...newCrisisForm, city: e.target.value })}
                    className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A1A]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">Country</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Switzerland"
                    value={newCrisisForm.country}
                    onChange={e => setNewCrisisForm({ ...newCrisisForm, country: e.target.value })}
                    className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">Latitude</label>
                  <input
                    required
                    type="number" step="any"
                    placeholder="46.20"
                    value={newCrisisForm.lat}
                    onChange={e => setNewCrisisForm({ ...newCrisisForm, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1A]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold uppercase mb-1">Longitude</label>
                  <input
                    required
                    type="number" step="any"
                    placeholder="6.14"
                    value={newCrisisForm.lng}
                    onChange={e => setNewCrisisForm({ ...newCrisisForm, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold uppercase mb-1">Tactical Briefing</label>
                <textarea
                  rows={3}
                  placeholder="Intelligence briefing and target parameters..."
                  value={newCrisisForm.description}
                  onChange={e => setNewCrisisForm({ ...newCrisisForm, description: e.target.value })}
                  className="w-full bg-[#080C14] border border-white/15 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A1A] resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold chamfer-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="chamfer-btn px-5 py-2 bg-[#FF6A1A] hover:bg-[#E55A10] font-bold text-white uppercase tracking-wider"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 1. COMMAND CENTER TAB (CRISIS FEED + 3D ORBITAL GLOBE + TIMELINE + ROSTER)
// ============================================================================
interface CommandCenterTabProps {
  role: UserRole;
  crises: Crisis[];
  heroes: Hero[];
  missions: Mission[];
  selectedCrisisId: string;
  onSelectCrisis: (id: string) => void;
  focusedLocation: Location | null;
  heroSearch: string;
  setHeroSearch: React.Dispatch<React.SetStateAction<string>>;
  heroFilterSkill: string;
  setHeroFilterSkill: React.Dispatch<React.SetStateAction<string>>;
  heroFilterStatus: string;
  setHeroFilterStatus: React.Dispatch<React.SetStateAction<string>>;
  filteredHeroes: Hero[];
  onOpenBuilder: (cId: string) => void;
  onEscalate: (crisisId: string) => void;
  onResolve: (crisisId: string) => void;
  onOpenCreateModal: () => void;
}

function CommandCenterTab({
  role, crises, heroes, missions, selectedCrisisId, onSelectCrisis,
  focusedLocation, heroSearch, setHeroSearch, heroFilterSkill,
  setHeroFilterSkill, heroFilterStatus, setHeroFilterStatus,
  filteredHeroes, onOpenBuilder, onEscalate, onResolve, onOpenCreateModal
}: CommandCenterTabProps) {
  const [threatFilter, setThreatFilter] = useState<'ALL' | 'ACTIVE' | 'CONTAINED'>('ALL');

  const sortedCrises = useMemo(() => {
    return [...crises]
      .filter(c => {
        if (threatFilter === 'ACTIVE') return c.status !== 'Resolved' && c.status !== 'Contained';
        if (threatFilter === 'CONTAINED') return c.status === 'Resolved' || c.status === 'Contained';
        return true;
      })
      .sort((a, b) => {
        const aDone = a.status === 'Resolved' || a.status === 'Contained' ? 1 : 0;
        const bDone = b.status === 'Resolved' || b.status === 'Contained' ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;
        return b.threatLevel - a.threatLevel;
      });
  }, [crises, threatFilter]);

  const activeMissions = useMemo(
    () => missions.filter(m => m.status === 'In Progress'),
    [missions]
  );

  return (
    <div className="relative w-full h-full flex flex-col lg:flex-row overflow-hidden bg-[#070A10]">
      {/* =====================================================================
          LEFT COLUMN: TACTICAL CRISIS FEED
      ===================================================================== */}
      <aside className="w-full lg:w-80 h-72 lg:h-full flex flex-col bg-[#0A0E17]/95 border-b lg:border-b-0 lg:border-r border-white/10 flex-shrink-0 z-20">
        <div className="p-3.5 border-b border-white/10 bg-[#0E1524] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6A1A] animate-pulse" />
            <h2 className="font-display-tech text-xs font-bold uppercase tracking-wider text-white">
              Tactical Crisis Feed
            </h2>
          </div>
          {role === 'Director' && (
            <button
              onClick={() => { audio.playClick(); onOpenCreateModal(); }}
              className="chamfer-sm flex items-center space-x-1 px-2.5 py-1 bg-[#FF6A1A] hover:bg-[#E55A10] text-white text-[10px] font-bold uppercase transition-all shadow-[0_0_8px_rgba(255,106,26,0.3)]"
            >
              <Plus className="w-3 h-3" />
              <span>NEW</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="px-3 py-2 border-b border-white/5 flex items-center space-x-1 text-[10px] bg-[#070A12]">
          {(['ALL', 'ACTIVE', 'CONTAINED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setThreatFilter(tab)}
              className={`flex-1 py-1 text-center font-bold uppercase chamfer-sm transition-colors ${
                threatFilter === tab
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {sortedCrises.map(crisis => {
            const isSelected = crisis.id === selectedCrisisId;
            const isResolved = crisis.status === 'Resolved' || crisis.status === 'Contained';
            const badgeColor =
              crisis.threatLevel >= 5
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                : crisis.threatLevel === 4
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : crisis.threatLevel === 3
                ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

            return (
              <div
                key={crisis.id}
                onClick={() => { audio.playClick(); onSelectCrisis(crisis.id); }}
                className={`p-3 border transition-all cursor-pointer relative chamfer-sm ${
                  isSelected
                    ? 'bg-[#111A2E] border-[#FF6A1A] shadow-[0_0_15px_rgba(255,106,26,0.25)]'
                    : 'bg-[#0D1322]/80 border-white/10 hover:border-white/25 hover:bg-[#0F182B]'
                } ${isResolved ? 'opacity-50' : ''}`}
              >
                {isSelected && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF6A1A] rounded-full" />}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded ${badgeColor}`}>
                    DEFCON {crisis.threatLevel}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono pr-2">{crisis.reportedTime}</span>
                </div>

                <h3 className="text-xs font-bold text-white leading-snug">{crisis.title}</h3>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                  <span className="flex items-center space-x-1 truncate max-w-[170px]">
                    <MapPin className="w-3 h-3 text-[#38BDF8] flex-shrink-0" />
                    <span className="truncate">{crisis.location.city}, {crisis.location.country}</span>
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    crisis.status === 'Responding'
                      ? 'bg-[#FF6A1A]/20 text-[#FF6A1A]'
                      : isResolved
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {crisis.status}
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2.5">
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{crisis.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {!isResolved && role !== 'Viewer' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            audio.playClick();
                            onOpenBuilder(crisis.id);
                          }}
                          className="chamfer-sm flex-1 px-3 py-1.5 bg-[#FF6A1A] hover:bg-[#E55A10] text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(255,106,26,0.3)]"
                        >
                          Assemble Squad
                        </button>
                      )}
                      {!isResolved && role === 'Director' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEscalate(crisis.id);
                            }}
                            className="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-[10px] font-bold uppercase chamfer-sm"
                          >
                            Escalate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onResolve(crisis.id);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold uppercase chamfer-sm"
                          >
                            Contain
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* =====================================================================
          CENTER: 3D EARTH GLOBE VIEWPORT & ACTIVE MISSIONS
      ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Banner Strip */}
        <div className="px-4 py-2 border-b border-white/10 bg-[#0B101C] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="font-display-tech font-bold text-white uppercase tracking-wider text-[11px]">
              S.H.I.E.L.D. ORBITAL SATELLITE TELEMETRY
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-[10px] text-zinc-400 font-mono">
            <span>GRID: LAT/LNG WGS-84</span>
            <span className="text-[#38BDF8]">SYS.ONLINE</span>
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="flex-1 relative bg-[#03060C] overflow-hidden">
          <EarthGlobeCanvas
            crises={crises}
            selectedCrisisId={selectedCrisisId}
            onSelectCrisis={onSelectCrisis}
            focusedLocation={focusedLocation}
            activeMissions={activeMissions}
          />
        </div>

        {/* Active Missions Timeline Deck */}
        <div className="border-t border-white/10 bg-[#0A0E17] flex flex-col">
          <div className="px-4 py-2 border-b border-white/5 bg-[#0D1424] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-[#FF6A1A] rounded-full" />
              <span className="font-bold uppercase tracking-wider text-white text-[11px]">
                Active In-Flight Missions ({activeMissions.length})
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 hidden md:inline font-mono">
              Orbital projection active • Drag to rotate globe • Scroll to zoom
            </span>
          </div>

          {missions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-zinc-500 bg-[#070A10] font-mono">
              No strike squads currently deployed. Select an active threat beacon to launch a mission.
            </div>
          ) : (
            <div className="flex overflow-x-auto divide-x divide-white/10 custom-scrollbar bg-[#080C14]">
              {missions.slice(0, 6).map(mission => {
                const assignedHeroes = heroes.filter(h => mission.heroIds.includes(h.id));
                const pct = Math.round(mission.progress * 100);
                return (
                  <div
                    key={mission.id}
                    className="min-w-[240px] max-w-[280px] p-3 flex-shrink-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-bold text-white truncate max-w-[160px]">{mission.crisisTitle}</span>
                      <span className={`font-bold ml-2 uppercase text-[10px] px-1.5 py-0.5 rounded ${
                        mission.status === 'Success'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : mission.status === 'Failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-[#FF6A1A]/20 text-[#FF6A1A]'
                      }`}>
                        {mission.status === 'In Progress' ? `${pct}%` : mission.status}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          mission.status === 'Success'
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                            : mission.status === 'Failed'
                            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                            : 'bg-gradient-to-r from-[#FF6A1A] to-[#F59E0B] shadow-[0_0_8px_rgba(255,106,26,0.5)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="truncate">
                        {assignedHeroes.map(h => h.avatar).join(' ')} ({assignedHeroes.length} Ops)
                      </span>
                      <span className="font-mono text-cyan-300">EST: {mission.successChance}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          RIGHT COLUMN: HERO STATUS ROSTER
      ===================================================================== */}
      <aside className="hidden xl:flex w-80 h-full flex-col bg-[#0A0E17]/95 border-l border-white/10 flex-shrink-0 z-20">
        <div className="p-3.5 border-b border-white/10 bg-[#0E1524] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <h2 className="font-display-tech text-xs font-bold uppercase tracking-wider text-white">
                Operatives Roster
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded chamfer-sm">
              {heroes.filter(h => h.status === 'Available').length}/{heroes.length} READY
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by alias or power..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="w-full bg-[#070A12] border border-white/15 pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A1A] chamfer-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={heroFilterStatus}
              onChange={(e) => setHeroFilterStatus(e.target.value)}
              className="bg-[#070A12] border border-white/15 px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-[#FF6A1A]"
            >
              <option value="ALL">All Status</option>
              <option value="Available">Available</option>
              <option value="Deployed">Deployed</option>
              <option value="Injured">Injured</option>
            </select>
            <select
              value={heroFilterSkill}
              onChange={(e) => setHeroFilterSkill(e.target.value)}
              className="bg-[#070A12] border border-white/15 px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-[#FF6A1A]"
            >
              <option value="ALL">All Specializations</option>
              <option value="combat">Combat Specialists</option>
              <option value="tech">Tech / AI</option>
              <option value="magic">Mystic Arts</option>
              <option value="stealth">Covert Ops</option>
              <option value="flight">Supersonic Flight</option>
              <option value="strategy">Battle Command</option>
            </select>
          </div>
        </div>

        {/* Hero list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filteredHeroes.map(hero => {
            const cardMeta = getHeroCardMeta(hero);
            return (
              <div
                key={hero.id}
                className="p-2.5 bg-[#0D1322] border border-white/10 hover:border-white/25 transition-all chamfer-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xl">{hero.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white truncate">{hero.alias}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#FF6A1A]/20 text-[#FF6A1A] border border-[#FF6A1A]/30 rounded">
                          PWR {cardMeta.powerLevel}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{hero.location.city}</div>
                    </div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded flex-shrink-0 ${
                    hero.status === 'Available'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : hero.status === 'Deployed'
                      ? 'bg-[#FF6A1A]/15 text-[#FF6A1A] border border-[#FF6A1A]/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}>
                    {hero.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-0.5">
                      <span>HEALTH</span>
                      <span className="text-white font-mono">{hero.health}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${hero.health}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-0.5">
                      <span>STAMINA</span>
                      <span className="text-white font-mono">{hero.stamina}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6A1A]" style={{ width: `${hero.stamina}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// HIGH-PERFORMANCE 60-FPS 3D ORTHOGRAPHIC EARTH GLOBE
// ============================================================================
interface EarthGlobeCanvasProps {
  crises: Crisis[];
  selectedCrisisId: string;
  onSelectCrisis: (id: string) => void;
  focusedLocation: Location | null;
  activeMissions: Mission[];
}

const CONTINENTS_DATA: [number, number][][] = [
  // North America
  [
    [71, -156], [70, -140], [69, -125], [68, -110], [64, -95], [60, -94], [55, -82],
    [60, -78], [62, -66], [53, -55], [47, -53], [45, -62], [43, -66], [41, -70],
    [39, -74], [35, -75], [30, -81], [25, -80], [26, -82], [30, -85], [29, -90],
    [29, -95], [26, -97], [21, -97], [18, -94], [21, -87], [16, -88], [14, -83],
    [10, -83], [8, -78], [8, -82], [11, -86], [14, -92], [17, -101], [20, -105],
    [24, -107], [28, -111], [31, -114], [23, -110], [28, -114], [32, -117],
    [35, -121], [40, -124], [46, -124], [49, -125], [55, -131], [59, -139],
    [61, -150], [56, -160], [60, -166], [65, -168], [68, -165]
  ],
  // Greenland
  [
    [83, -34], [81, -17], [75, -18], [69, -22], [65, -36], [60, -44],
    [64, -52], [70, -54], [76, -68], [80, -64], [82, -48]
  ],
  // South America
  [
    [11, -75], [12, -71], [10, -62], [6, -54], [2, -50], [0, -49], [-3, -41],
    [-6, -35], [-10, -36], [-15, -39], [-20, -40], [-23, -43], [-28, -48],
    [-34, -53], [-38, -57], [-42, -64], [-47, -66], [-52, -68], [-55, -67],
    [-54, -72], [-48, -75], [-40, -74], [-32, -72], [-22, -70], [-18, -71],
    [-12, -77], [-5, -81], [0, -80], [5, -77], [9, -77]
  ],
  // Europe
  [
    [36, -9], [39, -9], [43, -9], [43, -2], [47, -4], [49, -2], [51, 2],
    [53, 5], [55, 8], [57, 10], [54, 14], [55, 20], [59, 24], [60, 29],
    [65, 25], [63, 21], [59, 18], [56, 15], [59, 10], [58, 6], [62, 5],
    [66, 12], [70, 20], [71, 28], [69, 34], [66, 40], [60, 44], [52, 44],
    [47, 40], [45, 34], [46, 30], [42, 28], [40, 26], [38, 24], [37, 22],
    [40, 20], [44, 15], [45, 13], [42, 14], [38, 16], [38, 13], [42, 11],
    [44, 8], [43, 4], [40, 0], [36, -5]
  ],
  // Africa
  [
    [35, -6], [37, 3], [37, 10], [33, 11], [32, 15], [31, 20], [32, 25],
    [31, 32], [27, 34], [22, 37], [15, 41], [12, 44], [11, 51], [6, 49],
    [2, 45], [-4, 40], [-10, 40], [-16, 40], [-22, 35], [-26, 33], [-31, 30],
    [-34, 25], [-34, 18], [-28, 16], [-22, 14], [-15, 12], [-8, 13], [-2, 9],
    [4, 9], [6, 3], [5, -4], [5, -8], [10, -15], [15, -17], [21, -17],
    [27, -13], [32, -9]
  ],
  // Asia
  [
    [42, 28], [45, 38], [47, 40], [52, 44], [60, 44], [66, 45], [69, 60],
    [72, 72], [75, 90], [77, 105], [73, 125], [70, 142], [69, 162], [66, 178],
    [60, 166], [55, 162], [51, 156], [58, 148], [54, 140], [48, 140], [43, 134],
    [40, 129], [35, 129], [35, 126], [39, 125], [40, 121], [37, 122], [34, 120],
    [30, 122], [24, 118], [21, 110], [16, 108], [10, 106], [13, 101], [7, 100],
    [2, 103], [7, 98], [16, 97], [22, 91], [21, 87], [15, 80], [8, 77],
    [15, 74], [22, 69], [25, 66], [25, 57], [29, 49], [25, 52], [22, 59],
    [16, 53], [13, 45], [18, 41], [27, 36], [31, 34], [36, 36], [37, 27], [41, 29]
  ],
  // Australia
  [
    [-12, 131], [-12, 136], [-15, 136], [-15, 141], [-11, 142], [-16, 146],
    [-22, 150], [-28, 154], [-34, 151], [-38, 148], [-38, 141], [-35, 136],
    [-32, 132], [-32, 125], [-35, 118], [-34, 115], [-26, 113], [-21, 115],
    [-17, 122], [-14, 126]
  ],
  // Antarctica
  [
    [-70, -180], [-73, -150], [-74, -120], [-73, -90], [-64, -58], [-71, -40],
    [-71, -15], [-69, 15], [-68, 45], [-67, 75], [-66, 110], [-68, 140],
    [-72, 168], [-78, 175], [-77, 180], [-90, 180], [-90, -180]
  ]
];

function EarthGlobeCanvas({
  crises, selectedCrisisId, onSelectCrisis, focusedLocation, activeMissions
}: EarthGlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const yawRef = useRef<number>(0.65);
  const pitchRef = useRef<number>(0.24);
  const zoomRef = useRef<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const autoRotateRef = useRef<boolean>(true);
  const [showHudGrid, setShowHudGrid] = useState<boolean>(true);
  const showHudGridRef = useRef<boolean>(true);

  const starsRef = useRef(
    Array.from({ length: 180 }, (_, i) => {
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const r1 = seed - Math.floor(seed);
      const seed2 = Math.sin(i * 78.233) * 24634.6345;
      const r2 = seed2 - Math.floor(seed2);
      const seed3 = Math.sin(i * 45.164) * 91823.1234;
      const r3 = seed3 - Math.floor(seed3);
      return {
        x: r1,
        y: r2,
        size: r3 > 0.85 ? 1.5 : 0.8,
        alpha: 0.3 + r3 * 0.7
      };
    })
  );

  const propsRef = useRef({ crises, selectedCrisisId, activeMissions, onSelectCrisis });
  useEffect(() => {
    propsRef.current = { crises, selectedCrisisId, activeMissions, onSelectCrisis };
  }, [crises, selectedCrisisId, activeMissions, onSelectCrisis]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    showHudGridRef.current = showHudGrid;
  }, [showHudGrid]);

  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const projectedCrisesRef = useRef<{ id: string; x: number; y: number }[]>([]);

  // Focus location smoothly
  useEffect(() => {
    if (focusedLocation) {
      const targetYaw = focusedLocation.lng * (Math.PI / 180);
      const targetPitch = -focusedLocation.lat * (Math.PI / 180);

      let step = 0;
      const startYaw = yawRef.current;
      const startPitch = pitchRef.current;

      const anim = setInterval(() => {
        step += 0.06;
        if (step >= 1) {
          yawRef.current = targetYaw;
          pitchRef.current = targetPitch;
          clearInterval(anim);
        } else {
          yawRef.current = startYaw + (targetYaw - startYaw) * step;
          pitchRef.current = startPitch + (targetPitch - startPitch) * step;
        }
      }, 16);
      return () => clearInterval(anim);
    }
  }, [focusedLocation]);

  // Main 60-FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 800;
      const height = canvas.height = canvas.parentElement?.clientHeight || 600;
      const radius = Math.min(width, height) * 0.38 * zoomRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      const now = Date.now();

      if (autoRotateRef.current && !isDraggingRef.current) {
        yawRef.current += 0.0016;
      }

      const currentYaw = yawRef.current;
      const currentPitch = pitchRef.current;
      const cosP = Math.cos(currentPitch);
      const sinP = Math.sin(currentPitch);
      const {
        crises: currentCrises,
        selectedCrisisId: currentSelectedId,
        activeMissions: currentMissions
      } = propsRef.current;

      // Space background with deep nebula
      ctx.fillStyle = '#03060C';
      ctx.fillRect(0, 0, width, height);

      // Starfield
      starsRef.current.forEach(star => {
        const sx = ((star.x * width - currentYaw * 20) % width + width) % width;
        const sy = star.y * height;
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Atmosphere Outer Halo
      const outerHalo = ctx.createRadialGradient(
        centerX, centerY, radius * 0.95,
        centerX, centerY, radius * 1.18
      );
      outerHalo.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      outerHalo.addColorStop(0.4, 'rgba(0, 240, 255, 0.18)');
      outerHalo.addColorStop(0.8, 'rgba(14, 165, 233, 0.05)');
      outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerHalo;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Earth Globe Sphere (Deep Ocean Base)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const oceanGrad = ctx.createRadialGradient(
        centerX - radius * 0.35, centerY - radius * 0.35, radius * 0.1,
        centerX, centerY, radius
      );
      oceanGrad.addColorStop(0, '#0B2247');
      oceanGrad.addColorStop(0.4, '#081730');
      oceanGrad.addColorStop(0.8, '#040C1A');
      oceanGrad.addColorStop(1, '#02050B');
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // 3D Spherical Coordinate Projector
      const project3D = (lat: number, lng: number, altFactor = 1.0) => {
        const phi = lat * (Math.PI / 180);
        const theta = lng * (Math.PI / 180);

        const r = radius * altFactor;
        const x3d = r * Math.cos(phi) * Math.sin(theta - currentYaw);
        const y3d = -r * Math.sin(phi);
        const z3d = r * Math.cos(phi) * Math.cos(theta - currentYaw);

        const yRot = y3d * cosP - z3d * sinP;
        const zRot = y3d * sinP + z3d * cosP;

        return {
          x: centerX + x3d,
          y: centerY + yRot,
          z: zRot,
          visible: zRot > 0
        };
      };

      // Draw Continents (Vector Polygon Geometry)
      ctx.fillStyle = '#10B981';
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 1;

      CONTINENTS_DATA.forEach(poly => {
        ctx.beginPath();
        let started = false;
        poly.forEach(([lat, lng]) => {
          const pt = project3D(lat, lng);
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else { ctx.lineTo(pt.x, pt.y); }
          }
        });
        if (started) {
          ctx.closePath();
          ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
          ctx.stroke();
        }
      });

      // HUD Coordinate Grid Lines
      if (showHudGridRef.current) {
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';

        for (let lat = -60; lat <= 60; lat += 30) {
          ctx.beginPath();
          let started = false;
          for (let lng = -180; lng <= 180; lng += 8) {
            const pt = project3D(lat, lng);
            if (pt.visible) {
              if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
              else { ctx.lineTo(pt.x, pt.y); }
            } else {
              started = false;
            }
          }
          ctx.stroke();
        }

        for (let lng = -180; lng < 180; lng += 30) {
          ctx.beginPath();
          let started = false;
          for (let lat = -90; lat <= 90; lat += 8) {
            const pt = project3D(lat, lng);
            if (pt.visible) {
              if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
              else { ctx.lineTo(pt.x, pt.y); }
            } else {
              started = false;
            }
          }
          ctx.stroke();
        }
      }

      // Atmosphere Rim Lighting (Specular Curve)
      const rimGrad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.8,
        centerX, centerY, radius
      );
      rimGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      rimGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.12)');
      rimGrad.addColorStop(1, 'rgba(0, 240, 255, 0.45)');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      ctx.restore(); // remove sphere clip

      // Globe Outer Reticle Ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // S.H.I.E.L.D. Headquarters Marker
      const hqPt = project3D(HQ_LOCATION.lat, HQ_LOCATION.lng, 1.01);
      if (hqPt.visible) {
        ctx.fillStyle = '#FF6A1A';
        ctx.beginPath();
        ctx.arc(hqPt.x, hqPt.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(hqPt.x, hqPt.y, 8.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('S.H.I.E.L.D. HQ (NYC)', hqPt.x + 12, hqPt.y + 3);
      }

      // Mission Flight Arcs (Ballistic Photons)
      currentMissions.forEach(mission => {
        const startPt = hqPt;
        const endPt = project3D(mission.targetLocation.lat, mission.targetLocation.lng, 1.01);

        if (startPt.visible || endPt.visible) {
          const steps = 30;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 106, 26, 0.85)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);

          let started = false;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = HQ_LOCATION.lat + (mission.targetLocation.lat - HQ_LOCATION.lat) * t;
            const lng = HQ_LOCATION.lng + (mission.targetLocation.lng - HQ_LOCATION.lng) * t;
            const archAlt = 1.01 + Math.sin(t * Math.PI) * 0.22;

            const arcPt = project3D(lat, lng, archAlt);
            if (arcPt.z > -radius * 0.15) {
              if (!started) { ctx.moveTo(arcPt.x, arcPt.y); started = true; }
              else { ctx.lineTo(arcPt.x, arcPt.y); }
            }
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated Traveling Photon
          const pulseLat = HQ_LOCATION.lat + (mission.targetLocation.lat - HQ_LOCATION.lat) * mission.progress;
          const pulseLng = HQ_LOCATION.lng + (mission.targetLocation.lng - HQ_LOCATION.lng) * mission.progress;
          const pulseAlt = 1.01 + Math.sin(mission.progress * Math.PI) * 0.22;
          const pulsePt = project3D(pulseLat, pulseLng, pulseAlt);

          if (pulsePt.visible) {
            ctx.save();
            ctx.shadowColor = '#FF6A1A';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(pulsePt.x, pulsePt.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });

      // Crisis Threat Beacons
      const clickableCrises: { id: string; x: number; y: number }[] = [];
      currentCrises.forEach(crisis => {
        if (crisis.status === 'Resolved') return;
        const pt = project3D(crisis.location.lat, crisis.location.lng, 1.015);
        if (!pt.visible) return;

        clickableCrises.push({ id: crisis.id, x: pt.x, y: pt.y });

        const isSelected = crisis.id === currentSelectedId;
        const threatColor = crisis.threatLevel >= 4 ? '#EF4444' : crisis.threatLevel === 3 ? '#FF6A1A' : '#38BDF8';

        const pulse = (now % 1400) / 1400;
        const pulseRadius = 6 + pulse * 14;

        ctx.strokeStyle = threatColor;
        ctx.globalAlpha = 1 - pulse * 0.8;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = threatColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.fillStyle = 'rgba(10, 14, 23, 0.9)';
          const label = `LVL ${crisis.threatLevel}: ${crisis.title}`;
          ctx.font = 'bold 10px monospace';
          const textW = ctx.measureText(label).width;
          ctx.fillRect(pt.x + 10, pt.y - 10, textW + 14, 20);
          ctx.strokeStyle = threatColor;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(pt.x + 10, pt.y - 10, textW + 14, 20);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(label, pt.x + 16, pt.y + 4);
        }
      });
      projectedCrisesRef.current = clickableCrises;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    dragDistanceRef.current += Math.hypot(dx, dy);

    yawRef.current -= dx * 0.005;
    pitchRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitchRef.current + dy * 0.005));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingRef.current && dragDistanceRef.current < 5 && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const hit = projectedCrisesRef.current.find(c => Math.hypot(c.x - clickX, c.y - clickY) < 16);
      if (hit) {
        audio.playClick();
        propsRef.current.onSelectCrisis(hit.id);
      }
    }
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    zoomRef.current = Math.max(0.65, Math.min(2.0, zoomRef.current - e.deltaY * 0.001));
  };

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { isDraggingRef.current = false; }}
        onWheel={handleWheel}
        className="w-full h-full block"
      />

      {/* GLOBE HUD CONTROLS */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-1.5 bg-[#0C1220]/90 backdrop-blur-md border border-cyan-500/30 p-2 text-xs shadow-2xl chamfer-sm">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 border text-[10px] font-bold uppercase transition-all chamfer-sm ${
            autoRotate
              ? 'bg-[#FF6A1A] border-[#FF6A1A] text-white shadow-[0_0_8px_rgba(255,106,26,0.5)]'
              : 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          {autoRotate ? 'ORBIT: AUTO' : 'ORBIT: MANUAL'}
        </button>
        <button
          onClick={() => setShowHudGrid(!showHudGrid)}
          className={`px-3 py-1 border text-[10px] font-bold uppercase transition-all chamfer-sm ${
            showHudGrid
              ? 'bg-[#00F0FF]/20 border-cyan-400 text-cyan-300'
              : 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          {showHudGrid ? 'GRID: ON' : 'GRID: OFF'}
        </button>
        <div className="flex space-x-1 pt-0.5">
          <button
            onClick={() => { zoomRef.current = Math.min(2.0, zoomRef.current + 0.2); }}
            className="flex-1 bg-zinc-800/80 border border-white/10 text-white font-bold py-1 hover:border-[#FF6A1A] chamfer-sm"
          >
            +
          </button>
          <button
            onClick={() => { zoomRef.current = Math.max(0.65, zoomRef.current - 0.2); }}
            className="flex-1 bg-zinc-800/80 border border-white/10 text-white font-bold py-1 hover:border-[#FF6A1A] chamfer-sm"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. TEAM BUILDER TAB (RADAR CHART + SYNERGY + AUTO ASSEMBLE)
// ============================================================================
interface TeamBuilderTabProps {
  role: UserRole;
  crises: Crisis[];
  heroes: Hero[];
  selectedCrisis: Crisis;
  onSelectCrisisId: (id: string) => void;
  strikeTeamIds: string[];
  setStrikeTeamIds: React.Dispatch<React.SetStateAction<string[]>>;
  onAutoAssemble: () => void;
  onDispatch: () => void;
  onNotify: (msg: string, type?: 'info' | 'success' | 'warn' | 'danger') => void;
}

function calculateSynergy(team: Hero[]): number {
  if (team.length === 0) return 0;
  if (team.length === 1) return 60;
  const keys: SkillType[] = ['combat', 'tech', 'magic', 'stealth', 'flight', 'strategy', 'durability'];
  let totalScore = 0;
  keys.forEach(k => {
    const maxVal = Math.max(...team.map(h => h.skills[k]));
    const avgVal = team.reduce((sum, h) => sum + h.skills[k], 0) / team.length;
    totalScore += maxVal * 0.7 + avgVal * 0.3;
  });

  const baseSynergy = (totalScore / (keys.length * 100)) * 100;
  const sizeBonus = team.length >= 3 && team.length <= 5 ? 10 : 0;
  return Math.min(100, Math.round(baseSynergy + sizeBonus));
}

function calculateCoverage(team: Hero[], required: SkillRatings): number {
  if (team.length === 0) return 0;
  const keys: SkillType[] = ['combat', 'tech', 'magic', 'stealth', 'flight', 'strategy', 'durability'];
  let metCount = 0;
  keys.forEach(k => {
    const teamMax = Math.max(...team.map(h => h.skills[k]));
    const req = required[k];
    if (req === 0) metCount += 1;
    else metCount += Math.min(1, teamMax / req);
  });
  return Math.min(100, Math.round((metCount / keys.length) * 100));
}

function TeamBuilderTab({
  role, crises, heroes, selectedCrisis, onSelectCrisisId,
  strikeTeamIds, setStrikeTeamIds, onAutoAssemble, onDispatch, onNotify
}: TeamBuilderTabProps) {
  const selectedTeam = useMemo(() => heroes.filter(h => strikeTeamIds.includes(h.id)), [heroes, strikeTeamIds]);

  const synergyScore = useMemo(() => calculateSynergy(selectedTeam), [selectedTeam]);
  const coverageScore = useMemo(() => calculateCoverage(selectedTeam, selectedCrisis.requiredSkills), [selectedTeam, selectedCrisis]);

  const gapWarnings = useMemo(() => {
    const warnings: string[] = [];
    const req = selectedCrisis.requiredSkills;

    if (req.magic >= 60 && !selectedTeam.some(h => h.skills.magic >= 70)) {
      warnings.push('CRITICAL: No High-Magic Operative assigned for a Mystical Threat!');
    }
    if (req.flight >= 70 && !selectedTeam.some(h => h.skills.flight >= 80)) {
      warnings.push('WARNING: Aerial/Cosmic threat requires supersonic flight capability.');
    }
    if (req.tech >= 80 && !selectedTeam.some(h => h.skills.tech >= 85)) {
      warnings.push('WARNING: Inadequate Cyber/Tech specialist for target breach.');
    }
    if (selectedTeam.length < 2) {
      warnings.push('WARNING: Strike squad understaffed (< 2 operatives).');
    }
    return warnings;
  }, [selectedTeam, selectedCrisis]);

  const toggleHeroSelection = (hId: string) => {
    if (role === 'Viewer') return;
    audio.playClick();
    if (strikeTeamIds.includes(hId)) {
      setStrikeTeamIds(strikeTeamIds.filter(id => id !== hId));
    } else {
      if (strikeTeamIds.length >= 6) {
        onNotify('Maximum squad capacity is 6 operatives', 'warn');
        return;
      }
      setStrikeTeamIds([...strikeTeamIds, hId]);
    }
  };

  const applyPreset = (presetHeroIds: string[]) => {
    audio.playClick();
    setStrikeTeamIds(presetHeroIds);
    onNotify('Preset squad tactics loaded into dispatch matrix', 'info');
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#070A10] overflow-y-auto custom-scrollbar divide-y lg:divide-y-0 lg:divide-x divide-white/10">
      {/* =====================================================================
          LEFT: TARGET CRISIS & OPERATIVE SELECTION POOL
      ===================================================================== */}
      <div className="w-full lg:w-1/3 flex flex-col divide-y divide-white/10 bg-[#0A0E17]/95">
        <div className="p-5 bg-[#0E1524]">
          <label className="block font-display-tech text-xs text-white uppercase tracking-wider font-bold mb-2">
            Target Tactical Crisis
          </label>
          <select
            value={selectedCrisis.id}
            onChange={e => onSelectCrisisId(e.target.value)}
            className="w-full bg-[#080C14] border border-cyan-500/30 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A1A] font-bold chamfer-sm"
          >
            {crises.filter(c => c.status !== 'Resolved').map(c => (
              <option key={c.id} value={c.id}>
                LVL {c.threatLevel} | {c.title} ({c.location.city})
              </option>
            ))}
          </select>

          <div className="mt-3 p-3 bg-[#080C14] border border-white/10 text-xs chamfer-sm">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase mb-1">
              <span className="text-zinc-400">CATEGORY: {selectedCrisis.type}</span>
              <span className="text-[#FF6A1A]">DEFCON {selectedCrisis.threatLevel}</span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed font-sans">{selectedCrisis.description}</p>
          </div>
        </div>

        {/* Preset Tactics */}
        <div className="p-5 bg-[#0A0E17]">
          <span className="block text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-2.5">
            Tactical Preset Formations
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_TEAMS.map(pt => (
              <button
                key={pt.name}
                onClick={() => applyPreset(pt.heroIds)}
                className="px-3 py-2 bg-[#0F1626] border border-white/10 hover:border-[#FF6A1A] hover:bg-[#162138] text-xs font-bold text-white text-left truncate transition-all chamfer-sm"
              >
                {pt.name}
              </button>
            ))}
          </div>
        </div>

        {/* Operative Selector */}
        <div className="flex-1 p-5 flex flex-col bg-[#0E1524]">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <span className="font-display-tech text-xs font-bold text-white uppercase tracking-wider">
              Available Operatives ({heroes.filter(h => h.status === 'Available').length})
            </span>
            <button
              onClick={onAutoAssemble}
              className="chamfer-sm px-3 py-1 bg-gradient-to-r from-[#FF6A1A] to-[#E55A10] hover:from-[#E55A10] hover:to-[#C2410C] text-white text-[10px] font-bold uppercase flex items-center space-x-1 transition-all shadow-[0_0_10px_rgba(255,106,26,0.35)]"
            >
              <Zap className="w-3 h-3" />
              <span>AI AUTO-ASSEMBLE</span>
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar pr-1">
            {heroes.map(hero => {
              const isSelected = strikeTeamIds.includes(hero.id);
              const isAvailable = hero.status === 'Available';

              return (
                <div
                  key={hero.id}
                  onClick={() => isAvailable && toggleHeroSelection(hero.id)}
                  className={`p-2.5 border flex items-center justify-between transition-all cursor-pointer chamfer-sm ${
                    !isAvailable
                      ? 'opacity-35 bg-zinc-900 border-white/5 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#152038] border-[#FF6A1A] shadow-[0_0_12px_rgba(255,106,26,0.25)]'
                      : 'bg-[#0D1322] border-white/10 hover:border-white/25 hover:bg-[#10182B]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">{hero.avatar}</span>
                    <div>
                      <div className="font-bold text-xs text-white">{hero.alias}</div>
                      <div className="text-[10px] text-zinc-400">{hero.powers.slice(0, 2).join(', ')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded ${
                      hero.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#FF6A1A]/20 text-[#FF6A1A]'
                    }`}>
                      {hero.status}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      disabled={!isAvailable}
                      className="accent-[#FF6A1A] w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          RIGHT: RADAR CHART + SYNERGY METRICS + DISPATCH ACTION
      ===================================================================== */}
      <div className="flex-1 flex flex-col divide-y divide-white/10 bg-[#070A10]">
        <div className="p-6 bg-[#0B0F1A] flex flex-col md:flex-row items-center justify-around relative">
          {/* Radar Chart */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h4 className="font-display-tech text-xs font-bold text-white uppercase tracking-widest mb-3">
              Tactical Capability Radar
            </h4>
            <RadarChartSvg team={selectedTeam} required={selectedCrisis.requiredSkills} />
          </div>

          {/* Metrics & Gap Analysis */}
          <div className="w-full md:w-1/2 flex flex-col space-y-4 p-4 border-t md:border-t-0 md:border-l border-white/10">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-400 uppercase font-bold">Team Synergy Optimization</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{synergyScore}% MATCH</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                  style={{ width: `${synergyScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-400 uppercase font-bold">Crisis Skill Coverage</span>
                <span className="text-sm font-black text-[#FF6A1A] font-mono">{coverageScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6A1A] to-[#F59E0B] transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(255,106,26,0.4)]"
                  style={{ width: `${coverageScore}%` }}
                />
              </div>
            </div>

            {/* Gap Analysis Warning Box */}
            <div className="bg-[#080C14] border border-white/10 p-3.5 space-y-2 text-xs chamfer-sm">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block font-mono">
                Tactical Gap Analysis
              </span>
              {gapWarnings.length === 0 ? (
                <p className="text-emerald-400 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Strike squad skills fully counter this threat vector.</span>
                </p>
              ) : (
                gapWarnings.map((warn, i) => (
                  <p key={i} className="text-red-400 text-xs font-medium flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF6A1A] flex-shrink-0" />
                    <span>{warn}</span>
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Strike Team Operatives Box */}
        <div className="flex-1 p-6 bg-[#080C14] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-4">
              <span className="font-display-tech text-xs font-bold text-white uppercase tracking-widest">
                Configured Strike Team ({selectedTeam.length} / 6 Operatives)
              </span>
              <button
                onClick={() => setStrikeTeamIds([])}
                className="text-xs font-bold text-zinc-400 hover:text-[#FF6A1A] uppercase transition-colors"
              >
                Clear Squad
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedTeam.map(hero => (
                <div key={hero.id} className="bg-[#0E1524] border border-white/10 p-3 flex items-center justify-between chamfer-sm">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{hero.avatar}</span>
                    <div>
                      <div className="font-bold text-xs text-white">{hero.alias}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">STM: {hero.stamina}%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleHeroSelection(hero.id)}
                    className="text-zinc-500 hover:text-[#FF6A1A] p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-zinc-400 font-mono">
              TARGET: <strong className="text-white">{selectedCrisis.title} ({selectedCrisis.location.city})</strong>
            </div>

            <button
              disabled={role === 'Viewer' || selectedTeam.length === 0}
              onClick={() => { audio.playDispatch(); onDispatch(); }}
              className={`chamfer-btn px-7 py-3 font-bold text-xs tracking-widest uppercase flex items-center space-x-2 transition-all ${
                role === 'Viewer' || selectedTeam.length === 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF6A1A] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white shadow-[0_0_20px_rgba(255,106,26,0.5)]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>AVENGERS ASSEMBLE &amp; DISPATCH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarChartSvg({ team, required }: { team: Hero[]; required: SkillRatings }) {
  const keys: SkillType[] = ['combat', 'tech', 'magic', 'stealth', 'flight', 'strategy', 'durability'];
  const numAxes = keys.length;
  const size = 260;
  const center = size / 2;
  const radius = size * 0.38;

  const teamSkills = keys.map(k => Math.max(0, ...team.map(h => h.skills[k]), 0));
  const reqSkills = keys.map(k => required[k]);

  const getCoordinates = (val: number, i: number) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const reqPoints = reqSkills.map((v, i) => getCoordinates(v, i)).map(p => `${p.x},${p.y}`).join(' ');
  const teamPoints = teamSkills.map((v, i) => getCoordinates(v, i)).map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
        <circle
          key={idx}
          cx={center}
          cy={center}
          r={radius * level}
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines and labels */}
      {keys.map((k, i) => {
        const pt = getCoordinates(100, i);
        const lblPt = getCoordinates(120, i);
        return (
          <g key={k}>
            <line x1={center} y1={center} x2={pt.x} y2={pt.y} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <text
              x={lblPt.x}
              y={lblPt.y}
              fill="#94A3B8"
              fontSize="9"
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              className="uppercase"
            >
              {k}
            </text>
          </g>
        );
      })}

      {/* Required polygon */}
      <polygon
        points={reqPoints}
        fill="rgba(239, 68, 68, 0.15)"
        stroke="#EF4444"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />

      {/* Team polygon */}
      <polygon
        points={teamPoints}
        fill="rgba(255, 106, 26, 0.35)"
        stroke="#FF6A1A"
        strokeWidth="2.2"
      />
    </svg>
  );
}

// ============================================================================
// 3. ANALYTICS & AUDIT LOG TAB
// ============================================================================
interface AnalyticsTabProps {
  crises: Crisis[];
  heroes: Hero[];
  missions: Mission[];
  auditLogs: LogEntry[];
}

function AnalyticsTab({ crises, heroes, missions, auditLogs }: AnalyticsTabProps) {
  const crisesByType = useMemo(() => {
    const counts: Record<string, number> = {};
    crises.forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return Object.entries(counts);
  }, [crises]);

  const successRate = useMemo(() => {
    const completed = missions.filter(m => m.status !== 'In Progress');
    if (completed.length === 0) return 100;
    const succ = completed.filter(m => m.status === 'Success').length;
    return Math.round((succ / completed.length) * 100);
  }, [missions]);

  return (
    <div className="w-full h-full bg-[#070A10] overflow-y-auto custom-scrollbar divide-y divide-white/10">
      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-[#0B0F1A]">
        <div className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest font-mono">Total Threats Tracked</span>
            <div className="font-display-tech text-3xl font-black text-white mt-1">{crises.length}</div>
          </div>
          <AlertCircle className="w-8 h-8 text-[#FF6A1A]" />
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest font-mono">Mission Success Rate</span>
            <div className="font-display-tech text-3xl font-black text-emerald-400 mt-1">{successRate}%</div>
          </div>
          <Award className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest font-mono">Avg Deployment Latency</span>
            <div className="font-display-tech text-3xl font-black text-[#38BDF8] mt-1">14.0s</div>
          </div>
          <Clock className="w-8 h-8 text-[#38BDF8]" />
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest font-mono">Active Hero Deployment</span>
            <div className="font-display-tech text-3xl font-black text-[#F59E0B] mt-1">
              {Math.round((heroes.filter(h => h.status === 'Deployed').length / heroes.length) * 100)}%
            </div>
          </div>
          <Users className="w-8 h-8 text-[#F59E0B]" />
        </div>
      </div>

      {/* Charts & Combat Deployment Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 bg-[#080C14]">
        <div className="p-6">
          <h3 className="font-display-tech text-xs font-bold text-white uppercase tracking-widest mb-4">
            Incident Breakdown by Category
          </h3>
          <div className="space-y-3">
            {crisesByType.map(([type, count]) => (
              <div key={type} className="text-xs">
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span className="uppercase font-semibold">{type}</span>
                  <span className="text-white font-bold font-mono">{count}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6A1A] to-[#F59E0B] rounded-full"
                    style={{ width: `${(count / crises.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-display-tech text-xs font-bold text-white uppercase tracking-widest mb-4">
            Operative Mission Deployments
          </h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1 text-xs">
            {heroes.slice(0, 8).map(h => (
              <div key={h.id} className="flex items-center justify-between p-2.5 bg-[#0E1524] border border-white/10 chamfer-sm">
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">{h.avatar}</span>
                  <span className="font-bold text-white">{h.alias}</span>
                </div>
                <span className="text-emerald-400 font-bold font-mono">{h.missionsCompleted} Missions</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs Telemetry Table */}
      <div className="p-6 bg-[#0A0E17]">
        <h3 className="font-display-tech text-xs font-bold text-white uppercase tracking-widest mb-3">
          S.H.I.E.L.D. System Audit Telemetry Log
        </h3>
        <div className="overflow-x-auto border border-white/10 chamfer-sm">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#0E1524] text-zinc-400 uppercase text-[10px]">
                <th className="p-3">Time</th>
                <th className="p-3">Type</th>
                <th className="p-3">Message Event</th>
                <th className="p-3">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map(log => {
                const levelColors = {
                  info: 'text-zinc-200',
                  warn: 'text-amber-400 font-semibold',
                  danger: 'text-red-400 font-bold',
                  success: 'text-emerald-400 font-bold'
                };
                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-zinc-400 text-[11px]">{log.timestamp}</td>
                    <td className="p-3 font-bold text-[10px] text-white">{log.type}</td>
                    <td className={`p-3 ${levelColors[log.level]}`}>{log.message}</td>
                    <td className="p-3 text-cyan-400 text-[10px] font-bold">VERIFIED</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. AVENGERS COLLECTIBLE DOSSIER CARDS (SERIES 2 FLIP CARDS)
// ============================================================================
interface AvengersShowcaseTabProps {
  role: UserRole;
  heroes: Hero[];
  strikeTeamIds: string[];
  onToggleStrikeTeam: (heroId: string) => void;
  onOpenTeamBuilder: () => void;
}

function AvengersShowcaseTab({
  role, heroes, strikeTeamIds, onToggleStrikeTeam, onOpenTeamBuilder
}: AvengersShowcaseTabProps) {
  const [search, setSearch] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'POWER' | 'MISSIONS' | 'NAME'>('POWER');
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    audio.playClick();
    setFlippedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const enrichedHeroes = useMemo(() => {
    return heroes
      .map(hero => ({ hero, meta: getHeroCardMeta(hero) }))
      .filter(({ hero, meta }) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          hero.alias.toLowerCase().includes(q) ||
          hero.name.toLowerCase().includes(q) ||
          hero.powers.some(p => p.toLowerCase().includes(q));
        const matchesTier = tierFilter === 'ALL' || meta.tier === tierFilter;
        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'POWER') return b.meta.powerLevel - a.meta.powerLevel;
        if (sortBy === 'MISSIONS') return b.hero.missionsCompleted - a.hero.missionsCompleted;
        return a.hero.alias.localeCompare(b.hero.alias);
      });
  }, [heroes, search, tierFilter, sortBy]);

  const topHero = useMemo(() => {
    return heroes
      .map(h => ({ hero: h, meta: getHeroCardMeta(h) }))
      .sort((a, b) => b.meta.powerLevel - a.meta.powerLevel)[0];
  }, [heroes]);

  const avgPower = useMemo(() => {
    const sum = heroes.reduce((acc, h) => acc + getHeroCardMeta(h).powerLevel, 0);
    return Math.round(sum / heroes.length);
  }, [heroes]);

  return (
    <div className="w-full h-full bg-[#070A10] overflow-y-auto custom-scrollbar">
      {/* Dossier Header */}
      <div className="bg-[#0B0F1A] border-b border-white/10 p-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-[#FF6A1A] text-white text-[10px] font-bold uppercase tracking-widest chamfer-sm">
                S.H.I.E.L.D. SERIES 2 DOSSIER
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {heroes.length} Active Avenger Cards • Avg Power Index: <strong className="text-white">{avgPower}</strong>
              </span>
            </div>
            <h2 className="font-display-tech text-2xl lg:text-3xl font-black tracking-wider text-white uppercase">
              Avengers Collectible Dossier Cards
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Click any card to flip between front showcase and classified combat stats.
              {topHero && (
                <span className="ml-2 text-[#FF6A1A] font-bold">
                  Apex Operative: {topHero.hero.alias} ({topHero.meta.powerLevel} PWR)
                </span>
              )}
            </p>
          </div>

          {/* Card Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search hero or power..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#080C14] border border-white/15 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A1A] w-48 chamfer-sm"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-[#080C14] border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A1A] chamfer-sm"
            >
              <option value="ALL">All Tiers</option>
              <option value="OMEGA">Omega Tier (94+)</option>
              <option value="LEGENDARY">Legendary (88-93)</option>
              <option value="EPIC">Epic (80-87)</option>
              <option value="ELITE">Elite (&lt;80)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#080C14] border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A1A] chamfer-sm"
            >
              <option value="POWER">Sort: Power Index</option>
              <option value="MISSIONS">Sort: Completed Missions</option>
              <option value="NAME">Sort: Alias (A-Z)</option>
            </select>

            <button
              onClick={onOpenTeamBuilder}
              className="chamfer-btn px-4 py-2 bg-[#FF6A1A] hover:bg-[#E55A10] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(255,106,26,0.35)]"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Strike Squad ({strikeTeamIds.length}/6)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {enrichedHeroes.map(({ hero, meta }) => (
          <AvengerCard
            key={hero.id}
            hero={hero}
            meta={meta}
            role={role}
            isFlipped={!!flippedIds[hero.id]}
            isInStrikeTeam={strikeTeamIds.includes(hero.id)}
            onFlip={() => toggleFlip(hero.id)}
            onToggleStrikeTeam={() => onToggleStrikeTeam(hero.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface AvengerCardProps {
  hero: Hero;
  meta: HeroCardMeta;
  role: UserRole;
  isFlipped: boolean;
  isInStrikeTeam: boolean;
  onFlip: () => void;
  onToggleStrikeTeam: () => void;
}

function AvengerCard({
  hero, meta, role, isFlipped, isInStrikeTeam, onFlip, onToggleStrikeTeam
}: AvengerCardProps) {
  const skillEntries: { label: string; value: number }[] = [
    { label: 'Combat', value: hero.skills.combat },
    { label: 'Tech', value: hero.skills.tech },
    { label: 'Magic', value: hero.skills.magic },
    { label: 'Stealth', value: hero.skills.stealth },
    { label: 'Flight', value: hero.skills.flight },
    { label: 'Strategy', value: hero.skills.strategy },
    { label: 'Durability', value: hero.skills.durability }
  ];

  return (
    <div
      onClick={onFlip}
      className="group relative h-[420px] cursor-pointer transition-transform duration-300 hover:-translate-y-2"
      style={{ perspective: '1200px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* ================= CARD FRONT ================= */}
        <div
          className="absolute inset-0 overflow-hidden border bg-[#0A0E17] shadow-2xl flex flex-col justify-between p-4 chamfer-card"
          style={{
            backfaceVisibility: 'hidden',
            borderColor: isInStrikeTeam ? '#FF6A1A' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: isInStrikeTeam ? '0 0 20px rgba(255, 106, 26, 0.35)' : undefined
          }}
        >
          {/* Card Ambient Glow Gradient */}
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-50`} />

          {/* Top Card Bar */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 border border-white/20 chamfer-sm">
                  {meta.cardNumber}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wider rounded chamfer-sm ${meta.tierColor}`}>
                  {meta.tier}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] pt-0.5">
                <span className={`w-2 h-2 rounded-full ${hero.status === 'Available' ? 'bg-emerald-400' : 'bg-[#FF6A1A]'}`} />
                <span className="text-zinc-300 font-semibold">{hero.status}</span>
              </div>
            </div>

            {/* Power Index Hexagon/Badge */}
            <div
              className="flex flex-col items-center justify-center w-14 h-14 bg-black/80 border-2 rounded chamfer-sm"
              style={{ borderColor: meta.accentHex }}
            >
              <span className="text-[8px] font-bold tracking-widest uppercase text-zinc-400 leading-none">
                POWER
              </span>
              <span className="font-display-tech text-xl font-black text-white leading-tight">
                {meta.powerLevel}
              </span>
            </div>
          </div>

          {/* Center Avatar Aura */}
          <div className="relative z-10 flex flex-col items-center justify-center my-2">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-black/60 border-2 group-hover:scale-110 transition-transform duration-300 shadow-2xl"
              style={{
                borderColor: meta.accentHex,
                boxShadow: `0 0 28px ${meta.accentHex}44`
              }}
            >
              {hero.avatar}
            </div>
          </div>

          {/* Bottom Info & Stats Bar */}
          <div className="relative z-10 space-y-2.5">
            <div>
              <h3 className="font-display-tech text-base font-black uppercase tracking-wider text-white leading-tight">
                {hero.alias}
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">{hero.name}</p>
            </div>

            {/* Power Level Progress */}
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-zinc-300 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#FF6A1A]" />
                  <span>Power Index</span>
                </span>
                <span className="text-white font-mono">{meta.powerLevel} / 100</span>
              </div>
              <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${meta.powerLevel}%`,
                    background: `linear-gradient(90deg, #FF6A1A, ${meta.accentHex})`
                  }}
                />
              </div>
            </div>

            {/* Hero Power Tags */}
            <div className="flex flex-wrap gap-1">
              {hero.powers.slice(0, 3).map((power) => (
                <span
                  key={power}
                  className="text-[9px] font-semibold px-1.5 py-0.5 bg-black/70 border border-white/10 text-zinc-300 rounded truncate max-w-[110px]"
                >
                  {power}
                </span>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2">
              <span className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <RotateCw className="w-3 h-3" />
                <span>Flip for Intel</span>
              </span>
              {role !== 'Viewer' && hero.status === 'Available' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStrikeTeam();
                  }}
                  className={`chamfer-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isInStrikeTeam
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                      : 'bg-[#FF6A1A] hover:bg-[#E55A10] text-white shadow-[0_0_8px_rgba(255,106,26,0.3)]'
                  }`}
                >
                  {isInStrikeTeam ? 'Drafted ✓' : '+ Draft Squad'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= CARD BACK (SERIES 2 DOSSIER INTEL) ================= */}
        <div
          className="absolute inset-0 overflow-hidden border-2 bg-[#0E1524] text-white shadow-2xl flex flex-col justify-between p-4 chamfer-card"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: meta.accentHex
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{hero.avatar}</span>
              <div>
                <h4 className="font-display-tech text-xs font-black uppercase text-white">{hero.alias}</h4>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {meta.cardNumber} • {hero.location.city}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] uppercase text-zinc-400 font-bold font-mono">POWER</div>
              <div className="font-display-tech text-sm font-black text-[#FF6A1A]">
                {meta.powerLevel} PWR
              </div>
            </div>
          </div>

          {/* 7 Stats Meters */}
          <div className="space-y-1.5 my-2">
            {skillEntries.map(stat => (
              <div key={stat.label} className="text-[10px]">
                <div className="flex justify-between text-zinc-300 mb-0.5">
                  <span className="uppercase font-bold">{stat.label}</span>
                  <span className="font-bold text-white font-mono">{stat.value}</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stat.value}%`,
                      backgroundColor: stat.value >= 90 ? '#FF6A1A' : '#38BDF8'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* S.H.I.E.L.D. Factoid */}
          <div className="bg-black/60 border border-white/10 p-2.5 text-[10px] text-zinc-300 leading-relaxed rounded chamfer-sm">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-[#FF6A1A] mb-0.5 font-mono">
              Classified Dossier Factoid
            </span>
            {meta.factoid}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Missions: <strong className="text-emerald-400 font-mono">{hero.missionsCompleted}</strong></span>
            <span className="flex items-center space-x-1 text-white font-semibold">
              <RotateCw className="w-3 h-3" />
              <span>Flip Front</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
