import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  targetDateIso: string;
  examTitle: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDateIso, examTitle }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateIso).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateIso]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-center md:text-left">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-amber-200">
              Exam Countdown
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Target: {new Date(targetDateIso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 mt-1">{examTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 justify-center w-full md:w-auto">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-4 py-2 text-center min-w-[52px] sm:min-w-[64px]">
          <span className="text-lg sm:text-2xl font-black text-blue-700 block leading-none">{timeLeft.days}</span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">Days</span>
        </div>

        <span className="text-lg sm:text-xl font-black text-slate-300">:</span>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-4 py-2 text-center min-w-[52px] sm:min-w-[64px]">
          <span className="text-lg sm:text-2xl font-black text-slate-800 block leading-none">{timeLeft.hours}</span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">Hours</span>
        </div>

        <span className="text-lg sm:text-xl font-black text-slate-300">:</span>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-4 py-2 text-center min-w-[52px] sm:min-w-[64px]">
          <span className="text-lg sm:text-2xl font-black text-slate-800 block leading-none">{timeLeft.minutes}</span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">Mins</span>
        </div>

        <span className="text-lg sm:text-xl font-black text-slate-300">:</span>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-4 py-2 text-center min-w-[52px] sm:min-w-[64px]">
          <span className="text-lg sm:text-2xl font-black text-amber-600 block leading-none">{timeLeft.seconds}</span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">Secs</span>
        </div>
      </div>
    </div>
  );
};
