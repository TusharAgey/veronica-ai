import { useState, useEffect } from "react";

const SCENES = [
  {
    id: "office",
    name: "Corporate Office",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2564&auto=format&fit=crop",
  },
  {
    id: "lab",
    name: "High-Tech Lab",
    url: "https://images.unsplash.com/photo-1649256308437-e93443143e3a?q=80&w=3132&auto=format&fit=crop",
  },
  {
    id: "penthouse",
    name: "Billionaire Penthouse",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2564&auto=format&fit=crop",
  },
  {
    id: "scifi",
    name: "Sci-Fi Corridor",
    url: "https://images.unsplash.com/photo-1743439949029-3f4469f5bf99?q=80&w=3132&auto=format&fit=crop",
  },
  {
    id: "galaxy",
    name: "Deep Galaxy",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2564&auto=format&fit=crop",
  },
  {
    id: "hallway",
    name: "Futuristic Hallway",
    url: "https://images.unsplash.com/photo-1604241341265-37151d61060e?q=80&w=2913&auto=format&fit=crop",
  },
];

export function SpatialEnvironment() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // 1. Start with a random scene on initial load
    const initialRandom = Math.floor(Math.random() * SCENES.length);
    setActiveIndex(initialRandom);

    // 2. Cinematic Crossfade: Cycle to the next scene every 60 seconds
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SCENES.length);
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-black">
      {/* We map through ALL scenes so the browser pre-loads the images, 
          but we only make the active one visible to create the crossfade. */}
      {SCENES.map((scene, index) => (
        <div
          key={scene.id}
          className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={scene.url}
            alt={scene.name}
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />

          {/* Universal dark gradient overlay to ensure your Glass UI 
              is always perfectly readable, regardless of how bright the image is */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
        </div>
      ))}
    </div>
  );
}
