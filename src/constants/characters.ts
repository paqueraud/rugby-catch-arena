import { CharacterInfo, CharacterType } from '../types/game';
import stadiumImg from '../assets/images/rugby_stadium_arena_1791639860935.jpg';
import leopardImg from '../assets/images/mascot_leopard_1791639873564.jpg';
import serpentImg from '../assets/images/mascot_serpent_1791639896768.jpg';
import knightImg from '../assets/images/mascot_knight_1791639885427.jpg';
import catImg from '../assets/images/mascot_cat_1791639906606.jpg';
import birdImg from '../assets/images/mascot_bird_1791639917374.jpg';

export const STADIUM_IMAGE = stadiumImg;

export const CHARACTERS: Record<CharacterType, CharacterInfo> = {
  leopard: {
    id: 'leopard',
    name: 'Léopard',
    nickname: 'L’Éclair Doré',
    role: 'Ailier Foudroyant',
    description: 'Une vélocité sans égale pour bondir sur les ballons perdus.',
    color: '#F59E0B',
    accentColor: '#D97706',
    bgColor: 'from-amber-500/20 to-yellow-600/20',
    image: leopardImg,
    icon: '🐆'
  },
  serpent: {
    id: 'serpent',
    name: 'Serpent',
    nickname: 'L’Éclair Vert',
    role: 'Plaqueur Insaisissable',
    description: 'Une souplesse et une précision chirurgicale sur chaque trajectoire.',
    color: '#10B981',
    accentColor: '#059669',
    bgColor: 'from-emerald-500/20 to-teal-600/20',
    image: serpentImg,
    icon: '🐍'
  },
  chevalier: {
    id: 'chevalier',
    name: 'Chevalier',
    nickname: 'Le Roc d’Acier',
    role: 'Pilier Invincible',
    description: 'Une armure d’acier et un sens de l’honneur inébranlable.',
    color: '#3B82F6',
    accentColor: '#2563EB',
    bgColor: 'from-blue-500/20 to-indigo-600/20',
    image: knightImg,
    icon: '⚔️'
  },
  chat: {
    id: 'chat',
    name: 'Chat',
    nickname: 'Le Félin Agile',
    role: 'Demi de Mêlée Ruseur',
    description: 'Des réflexes ultra-rapides et des griffes prêtes à saisir l’ovale.',
    color: '#F97316',
    accentColor: '#EA580C',
    bgColor: 'from-orange-500/20 to-amber-600/20',
    image: catImg,
    icon: '🐱'
  },
  oiseau: {
    id: 'oiseau',
    name: 'Oiseau',
    nickname: 'Le Rapace Céleste',
    role: 'Arrière Stratège',
    description: 'Une vision panoramique d’aigle dominant tout le terrain de rugby.',
    color: '#8B5CF6',
    accentColor: '#7C3AED',
    bgColor: 'from-purple-500/20 to-violet-600/20',
    image: birdImg,
    icon: '🦅'
  }
};

export const CHARACTER_LIST: CharacterInfo[] = Object.values(CHARACTERS);
