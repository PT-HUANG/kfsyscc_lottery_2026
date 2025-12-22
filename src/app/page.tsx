"use client";
import { useRouter } from "next/navigation";
import "./start.css";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/gacha");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 via-blue-100 to-yellow-100 relative overflow-hidden">
      {/* Cute floating circles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="circle-float circle-1"></div>
        <div className="circle-float circle-2"></div>
        <div className="circle-float circle-3"></div>
        <div className="circle-float circle-4"></div>
        <div className="circle-float circle-5"></div>
        <div className="circle-float circle-6"></div>
      </div>

      {/* Stars decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="star star-1">★</div>
        <div className="star star-2">★</div>
        <div className="star star-3">★</div>
        <div className="star star-4">★</div>
        <div className="star star-5">★</div>
      </div>

      <div className="text-center p-8 relative z-10">
        {/* Main title with cute style */}
        <div className="title-container">
          <h1 className="text-7xl font-black tracking-wider title-text mb-8">
            KFSYSCC
          </h1>
          <div className="title-shadow"></div>
        </div>

        {/* Cute subtitle */}
        <div className="subtitle-container mb-12">
          <p className="text-3xl font-bold subtitle-text">
            Lottery System 2026
          </p>
        </div>

        {/* Start button - gacha machine style */}
        <button
          onClick={handleStart}
          className="start-button group"
        >
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <span className="font-black text-3xl">開始抽獎  </span>
            <span className="text-3xl">🎁</span>
          </span>
        </button>

      </div>
    </div>
  );
}
