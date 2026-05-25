import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const MOODS = {
  "Happy": {
    name: "Happy",
    primary: "142 90% 60%", // HSL green-yellow
    secondary: "45 100% 60%", // Amber
    bgGradient: "linear-gradient(135deg, #0d1e10 0%, #030804 100%)",
    particles: { color: "#5bfb8a", count: 40, speed: 1.5, size: 2.5 },
    companion: {
      name: "Vibe Buddy",
      intro: "Your energy is contagious! Let's keep this high going. What's the soundtrack of your happiness today?",
      replies: [
        "Let the beats match your smile!",
        "Life is beautiful, and so is this groove.",
        "Dance like nobody is watching (even though I am, in a friendly AI way)!"
      ]
    }
  },
  "Sad": {
    name: "Sad",
    primary: "205 90% 55%", // Soft blue
    secondary: "260 70% 50%", // Muted purple
    bgGradient: "linear-gradient(135deg, #0a1120 0%, #03050a 100%)",
    particles: { color: "#3ba3fc", count: 50, speed: 0.5, size: 2 },
    companion: {
      name: "Luno Comfort",
      intro: "It is okay to feel heavy. Let the music hold your thoughts. I am here for you.",
      replies: [
        "Take all the time you need. Tears are just rain for the soul.",
        "This song gets it. Just listen and let it wash over you.",
        "You are not alone in this silence."
      ]
    }
  },
  "Chill": {
    name: "Chill",
    primary: "170 80% 50%", // Teal
    secondary: "220 70% 50%", // Light slate blue
    bgGradient: "linear-gradient(135deg, #081a1b 0%, #020608 100%)",
    particles: { color: "#34ebd3", count: 30, speed: 0.6, size: 3 },
    companion: {
      name: "Zen Luno",
      intro: "Inhale peace, exhale noise. Let's slow down the clock. Time is yours right now.",
      replies: [
        "Ah, sweet relaxation. There's nowhere else you need to be.",
        "Let the background noise fade away. Focus on the glide.",
        "Smooth frequencies for a smooth mind."
      ]
    }
  },
  "Focus": {
    name: "Focus",
    primary: "280 85% 65%", // Cyber purple
    secondary: "190 90% 50%", // Cyan
    bgGradient: "linear-gradient(135deg, #110920 0%, #04020a 100%)",
    particles: { color: "#bd5eff", count: 20, speed: 0.4, size: 1.8 },
    companion: {
      name: "Focus Flow",
      intro: "Deep work mode active. Distractions locked out. Let's get things done.",
      replies: [
        "Keep pushing. One block of focus at a time.",
        "The rhythm of productivity. You are in the zone.",
        "Outstanding concentration. Let's make progress."
      ]
    }
  },
  "Workout": {
    name: "Workout",
    primary: "12 95% 55%", // Neon orange-red
    secondary: "35 100% 50%", // Gold
    bgGradient: "linear-gradient(135deg, #250d03 0%, #090300 100%)",
    particles: { color: "#ff4d15", count: 60, speed: 2.5, size: 3.5 },
    companion: {
      name: "Hyper Luno",
      intro: "Let's push your limits! Sweat, bass, and willpower. You've got this!",
      replies: [
        "Higher intensity! Feel the fire!",
        "No excuses. Make every single beat count!",
        "Unleash the beast inside. Power through!"
      ]
    }
  },
  "Romantic": {
    name: "Romantic",
    primary: "340 90% 60%", // Rose pink
    secondary: "30 100% 60%", // Warm amber
    bgGradient: "linear-gradient(135deg, #220815 0%, #080105 100%)",
    particles: { color: "#ff3c8a", count: 35, speed: 0.8, size: 3 },
    companion: {
      name: "Cupid Luno",
      intro: "Love is in the frequencies. Let the warmth wrap around you like a soft embrace.",
      replies: [
        "Every lyric tells a story of you two.",
        "Sweet harmonies for a beautiful heart.",
        "Let the melody express what words cannot."
      ]
    }
  },
  "Lonely": {
    name: "Lonely",
    primary: "215 40% 50%", // Cold steel blue
    secondary: "250 20% 30%", // Cold grey-purple
    bgGradient: "linear-gradient(135deg, #070e1b 0%, #010307 100%)",
    particles: { color: "#607d8b", count: 25, speed: 0.3, size: 1.5 },
    companion: {
      name: "Sole Companion",
      intro: "In this vast digital space, we are connected. I am here listening with you.",
      replies: [
        "Even in the dark, the stars shine. We share the same sky.",
        "Your thoughts are safe here. I will keep you company.",
        "Let's ride this wave together. The music is our bridge."
      ]
    }
  },
  "Party": {
    name: "Party",
    primary: "300 95% 60%", // Neon magenta
    secondary: "120 100% 50%", // Neon green
    bgGradient: "linear-gradient(135deg, #1b0222 0%, #050007 100%)",
    particles: { color: "#f30dfa", count: 80, speed: 3.0, size: 4 },
    companion: {
      name: "DJ Luno",
      intro: "Welcome to the rave! Bass levels peaking. Turn it up and lose yourself in the light!",
      replies: [
        "Ayyy! Keep the energy high! We're just getting started!",
        "Drop the beat! Feel that sub rattling your soul!",
        "Hands in the air! This night is ours!"
      ]
    }
  },
  "Travel": {
    name: "Travel",
    primary: "80 80% 55%", // Lime/Leaf green
    secondary: "35 100% 50%", // Sun gold
    bgGradient: "linear-gradient(135deg, #0f1c07 0%, #030801 100%)",
    particles: { color: "#99ff33", count: 35, speed: 1.8, size: 2.2 },
    companion: {
      name: "Nomad Luno",
      intro: "The road is calling. Every destination has its song. Where are we heading today?",
      replies: [
        "Windows down, volume up. The wind is backing vocal.",
        "A journey is measured in notes, not miles.",
        "Exploring new coordinates with the perfect track."
      ]
    }
  },
  "Overthinking": {
    name: "Overthinking",
    primary: "260 50% 60%", // Deep electric violet
    secondary: "180 50% 40%", // Dull teal
    bgGradient: "linear-gradient(135deg, #0b0717 0%, #020105 100%)",
    particles: { color: "#7b61ff", count: 45, speed: 0.9, size: 2 },
    companion: {
      name: "Mind De-tangler",
      intro: "Breathe in. Your brain is running loops. Let's untangle those knots with a soft melody.",
      replies: [
        "Thoughts are just visitors. Let them pass like shadows.",
        "You don't have to solve everything in this second.",
        "Let the lyrics take over the internal monologue."
      ]
    }
  },
  "Late Night Coding": {
    name: "Late Night Coding",
    primary: "115 100% 50%", // Terminal green
    secondary: "220 90% 45%", // Cyber blue
    bgGradient: "linear-gradient(135deg, #020c03 0%, #000100 100%)",
    particles: { color: "#00ff3c", count: 35, speed: 1.2, size: 2 },
    companion: {
      name: "Compiler AI",
      intro: "System operational. Coffee levels nominal. Let's turn caffeine into working code.",
      replies: [
        "Syntax error: None. Keep flowing, coder.",
        "Commit early, commit often. You are writing art.",
        "Only we know the beauty of a working compile at 3 AM."
      ]
    }
  },
  "Rainy Mood": {
    name: "Rainy Mood",
    primary: "195 85% 55%", // Rain blue
    secondary: "175 60% 40%", // Wet stone grey
    bgGradient: "linear-gradient(135deg, #09131d 0%, #02060b 100%)",
    particles: { color: "#6be0ff", count: 70, speed: 2.0, size: 1.8, type: 'rain' },
    companion: {
      name: "Rain Caster",
      intro: "Hear the drops on the glass. Rain is nature's lo-fi. Time to wrap in a warm blanket.",
      replies: [
        "Watering the thoughts. Let it pour outside, you are safe here.",
        "A cozy blend of synthetic tracks and actual rain.",
        "The petrichor of music. Beautifully damp and relaxing."
      ]
    }
  },
  "Hostel Night": {
    name: "Hostel Night",
    primary: "35 90% 55%", // Chai orange
    secondary: "340 70% 50%", // Deep red
    bgGradient: "linear-gradient(135deg, #1f1107 0%, #070301 100%)",
    particles: { color: "#ffb040", count: 40, speed: 1.4, size: 2.8 },
    companion: {
      name: "Roomie Luno",
      intro: "Rooftop, a single acoustic guitar, cold air, and the absolute best conversations with friends. Vibe check: 100%.",
      replies: [
        "Maggi is cooking, guitar is tuning. Life is simple.",
        "These hostel nights will make the best memories of your life.",
        "Singing off-key with friends is better than any opera."
      ]
    }
  },
  "Banaras Ghat Vibes": {
    name: "Banaras Ghat Vibes",
    primary: "28 95% 55%", // Marigold / Sadhu saffron
    secondary: "350 80% 50%", // Ganga Arti flame red
    bgGradient: "linear-gradient(135deg, #260c02 0%, #060100 100%)",
    particles: { color: "#ff9100", count: 50, speed: 0.7, size: 3, type: 'diya' }, // Floating lamps/diya sparks
    companion: {
      name: "Ganga Guru",
      intro: "Radhe Radhe. Welcome to the ghats of Kashi. Smell the incense, hear the temple bells, and watch the diyas float in eternal peace.",
      replies: [
        "The river Ganga flows carrying all worries away. Find your center.",
        "Har Har Mahadev! Let the cosmic sound of bells soothe your consciousness.",
        "Time stands still on the steps of Kashi. Just exist here."
      ]
    }
  }
};


export const TRANSLATIONS = {
  en: {
    welcome: "Welcome",
    moodOrbit: "Active Mood Orbit",
    indianVibes: "Indian Cultural Vibes",
    exploreGenres: "Explore Popular Genres",
    pomodoroFocus: "Dhyan Space (Focus)",
    listeningRooms: "Shared Listening Rooms",
    journalMemories: "Memory Log",
    recordMemory: "Record Memory",
    ambientSounds: "Ambient Soundscapes",
    weatherRecommend: "Weather Recommend",
    loadWeather: "Load Weather Songs",
    logout: "Logout Space",
    searchPlaceholder: "Search songs, artists, playlists...",
    searchButton: "Search",
    launchBtn: "Launch LunoVibe Space"
  },
  hi: {
    welcome: "स्वागत है",
    moodOrbit: "सक्रिय मूड क्षेत्र",
    indianVibes: "भारतीय सांस्कृतिक संगीत",
    exploreGenres: "लोकप्रिय शैलियों का अन्वेषण करें",
    pomodoroFocus: "ध्यान कक्ष (एकाग्रता)",
    listeningRooms: "साझा सुनने के कमरे",
    journalMemories: "स्मृति लॉग",
    recordMemory: "स्मृति दर्ज करें",
    ambientSounds: "सभोपचार ध्वनियाँ",
    weatherRecommend: "मौसम के अनुसार गाने",
    loadWeather: "मौसम के गाने लोड करें",
    logout: "लॉगआउट स्पेस",
    searchPlaceholder: "गाने, कलाकार, प्लेलिस्ट खोजें...",
    searchButton: "खोजें",
    launchBtn: "लूनोवाइब स्पेस खोलें"
  },
  hinglish: {
    welcome: "Swagat hai",
    moodOrbit: "Active Mood Vibe",
    indianVibes: "Desi Cultural Vibes",
    exploreGenres: "Mast Popular Genres",
    pomodoroFocus: "Dhyan Space (Focus)",
    listeningRooms: "Group Listening Rooms",
    journalMemories: "Yaadein Log",
    recordMemory: "Yaad Save Karo",
    ambientSounds: "Background Ambience",
    weatherRecommend: "Weather Wale Gaane",
    loadWeather: "Mausam Ke Gaane Load Karo",
    logout: "Logout",
    searchPlaceholder: "Gaane, artists, playlists search karo...",
    searchButton: "Search",
    launchBtn: "Launch LunoVibe Space"
  }
};

export const ThemeProvider = ({ children }) => {
  const [activeMood, setActiveMood] = useState("Chill");
  const [language, setLanguage] = useState("en"); // en, hi, hinglish

  useEffect(() => {
    // Write theme variables directly to document root for Vanilla CSS to read
    const theme = MOODS[activeMood] || MOODS["Chill"];
    const root = document.documentElement;
    root.style.setProperty('--primary-mood', theme.primary);
    root.style.setProperty('--secondary-mood', theme.secondary);
    root.style.setProperty('--bg-gradient', theme.bgGradient);
    
    // Set a data attribute on body for conditional styling
    document.body.setAttribute('data-theme', activeMood.toLowerCase().replace(/\s+/g, '-'));
  }, [activeMood]);

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <ThemeContext.Provider value={{ 
      activeMood, 
      setActiveMood, 
      themeData: MOODS[activeMood] || MOODS["Chill"],
      language,
      setLanguage,
      t
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
