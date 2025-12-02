
import React, { useState, useEffect, useRef } from 'react';
import { generateFitnessPlan, getConsultationResponse } from './services/geminiService';
import { type UserProfile, type FitnessPlan, type WorkoutDay, type ChatMessage, type BodyMetrics } from './types/index';

// --- Icons ---

const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
);

const StretchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
  </svg>
);

const StatsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
  </svg>
);

// --- Components ---

const SelectField = ({ label, value, onChange, options }: any) => (
  <div className="mb-4">
    <label className="block text-slate-400 text-sm font-medium mb-2">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const NumberInput = ({ label, value, onChange, unit, step = 1, min = 0, placeholder }: any) => (
  <div className="mb-4">
    <label className="block text-slate-400 text-sm font-medium mb-2">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        min={min}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-lg"
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
          {unit}
        </span>
      )}
    </div>
  </div>
);

const MultiSelectPills = ({ label, options, selectedValues, onChange }: { label: string, options: string[], selectedValues: string[], onChange: (val: string[]) => void }) => {
  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-slate-400 text-sm font-medium mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggleOption(opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedValues.includes(opt)
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Calendar Component ---

const CalendarView = ({ checkInDates }: { checkInDates: string[] }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const days = [];
  // Empty slots for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  return (
    <div className="p-4 bg-slate-900 rounded-2xl shadow-lg border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{monthNames[currentMonth]} {currentYear}</h2>
        <div className="text-right">
          <p className="text-xs text-slate-400">本月堅持</p>
          <p className="text-2xl font-bold text-cyan-400">{checkInDates.filter(d => d.startsWith(`${currentYear}-${String(currentMonth+1).padStart(2, '0')}`)).length} <span className="text-sm text-white">天</span></p>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-center text-slate-500 text-xs font-medium">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square"></div>;
          
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isCheckedIn = checkInDates.includes(dateStr);
          const isToday = day === today.getDate();

          return (
            <div 
              key={day} 
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-semibold relative
                ${isCheckedIn ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'}
                ${isToday && !isCheckedIn ? 'border border-slate-500 text-white' : ''}
              `}
            >
              {day}
              {isCheckedIn && (
                 <div className="absolute bottom-1 w-1 h-1 bg-cyan-400 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Stats Component ---
const StatsView = ({ history, onAddMetric, height }: { history: BodyMetrics[], onAddMetric: (m: BodyMetrics) => void, height: number }) => {
  const [weight, setWeight] = useState<number | ''>('');
  const [bodyFat, setBodyFat] = useState<number | ''>('');
  const [muscleMass, setMuscleMass] = useState<number | ''>('');
  const [boneMass, setBoneMass] = useState<number | ''>('');
  const [visceralFat, setVisceralFat] = useState<number | ''>('');

  const handleSave = () => {
    if (typeof weight !== 'number') return;
    const bmi = weight / ((height / 100) * (height / 100));
    const newMetric: BodyMetrics = {
      date: new Date().toISOString().split('T')[0],
      weight,
      bmi: Number(bmi.toFixed(1)),
      bodyFat: typeof bodyFat === 'number' ? bodyFat : undefined,
      muscleMass: typeof muscleMass === 'number' ? muscleMass : undefined,
      boneMass: typeof boneMass === 'number' ? boneMass : undefined,
      visceralFat: typeof visceralFat === 'number' ? visceralFat : undefined,
    };
    onAddMetric(newMetric);
    setWeight(''); setBodyFat(''); setMuscleMass(''); setBoneMass(''); setVisceralFat('');
  };

  // Simple Trend Chart Logic
  const dataPoints = [...history].reverse(); // Oldest first
  const maxWeight = Math.max(...dataPoints.map(d => d.weight), 0) + 5;
  const minWeight = Math.min(...dataPoints.map(d => d.weight), 100) - 5;
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h3 className="text-white font-bold mb-4">今日數值更新</h3>
        <div className="grid grid-cols-2 gap-4">
           <NumberInput label="體重 (kg)" value={weight} onChange={setWeight} step={0.1} />
           <NumberInput label="體脂 (%)" value={bodyFat} onChange={setBodyFat} step={0.1} />
           <NumberInput label="肌肉量 (kg)" value={muscleMass} onChange={setMuscleMass} step={0.1} />
           <NumberInput label="骨量 (kg)" value={boneMass} onChange={setBoneMass} step={0.1} />
           <NumberInput label="內臟脂肪" value={visceralFat} onChange={setVisceralFat} step={0.5} />
        </div>
        <button 
          onClick={handleSave}
          disabled={!weight}
          className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
        >
          儲存紀錄
        </button>
      </div>

      {dataPoints.length > 1 && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <h3 className="text-white font-bold mb-4">體重趨勢</h3>
          <div className="h-40 flex items-end justify-between gap-1 px-2 relative">
             {dataPoints.map((d, i) => {
               const heightPercent = ((d.weight - minWeight) / (maxWeight - minWeight)) * 100;
               return (
                 <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-slate-700 text-white text-xs px-2 py-1 rounded transition-opacity">
                      {d.weight}kg ({d.date})
                    </div>
                    <div 
                      className="w-full bg-cyan-500/50 rounded-t-sm hover:bg-cyan-400 transition-colors"
                      style={{ height: `${Math.max(heightPercent, 10)}%` }}
                    ></div>
                 </div>
               );
             })}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{dataPoints[0].date}</span>
            <span>{dataPoints[dataPoints.length - 1].date}</span>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
         <div className="p-4 bg-slate-800/50 border-b border-slate-700">
           <h3 className="text-white font-bold">歷史紀錄</h3>
         </div>
         <div className="max-h-80 overflow-y-auto">
            {history.map((record, idx) => (
              <div key={idx} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                 <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-mono text-sm">{record.date}</span>
                    <span className="text-cyan-400 font-bold">{record.weight} kg</span>
                 </div>
                 <div className="flex gap-3 text-xs text-slate-500">
                    <span>BMI: {record.bmi}</span>
                    {record.bodyFat && <span>體脂: {record.bodyFat}%</span>}
                    {record.muscleMass && <span>肌肉: {record.muscleMass}kg</span>}
                 </div>
                 {/* Simple Logic Based Advice */}
                 <div className="mt-2 text-xs text-slate-400 italic bg-slate-800/30 p-2 rounded">
                    {idx === 0 ? "📝 最新紀錄" : 
                      record.weight > history[idx+1]?.weight 
                      ? "💪 體重上升，請確認是肌肉增加還是體脂增加。" 
                      : "🔥 體重下降，請注意蛋白質攝取維持肌肉量。"
                    }
                 </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">尚無紀錄</div>
            )}
         </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [profile, setProfile] = useState<UserProfile>({
    age: 16,
    gender: 'male',
    height: 170,
    weight: 60,
    targetWeight: 65,
    timeline: 12,
    equipment: ['啞鈴'],
    goal: 'muscle_gain',
    currentBodyFat: undefined,
    targetBodyFat: undefined
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'calendar' | 'stats' | 'consultant' | 'stretch'>('plan');
  
  // Dashboard states
  const [activeDay, setActiveDay] = useState(0);
  
  // Consultant state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check-in State
  const [checkInDates, setCheckInDates] = useState<string[]>([]);
  const [checkedExercises, setCheckedExercises] = useState<{[key: string]: boolean}>({});

  // Stats History
  const [metricsHistory, setMetricsHistory] = useState<BodyMetrics[]>([]);

  useEffect(() => {
    // Load state from local storage
    const savedPlan = localStorage.getItem('fitnessPlan');
    const savedProfile = localStorage.getItem('userProfile');
    const savedDates = localStorage.getItem('checkInDates');
    const savedHistory = localStorage.getItem('metricsHistory');
    
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedDates) setCheckInDates(JSON.parse(savedDates));
    if (savedHistory) setMetricsHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleCreatePlan = async () => {
    setLoading(true);
    try {
      const generatedPlan = await generateFitnessPlan(profile);
      setPlan(generatedPlan);
      localStorage.setItem('fitnessPlan', JSON.stringify(generatedPlan));
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setActiveTab('plan');
      setChatMessages([{ role: 'model', text: '你好！我是你的 AI 健身教練。你的計畫已經生成完畢，有任何問題都可以隨時問我！' }]);
    } catch (error) {
      alert("生成計畫失敗，請檢查網路連線或稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeight = async () => {
    if (!window.confirm("更新體重將會重新計算你的營養攝取建議，確定嗎？")) return;
    await handleCreatePlan();
  };

  const handleReset = () => {
    if (window.confirm("確定要重設所有資料嗎？這將刪除目前的計畫與進度。")) {
      localStorage.removeItem('fitnessPlan');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('checkInDates');
      localStorage.removeItem('metricsHistory');
      setPlan(null);
      setCheckInDates([]);
      setCheckedExercises({});
      setChatMessages([]);
      setMetricsHistory([]);
      setProfile({
        age: 16,
        gender: 'male',
        height: 170,
        weight: 60,
        targetWeight: 65,
        timeline: 12,
        equipment: ['啞鈴'],
        goal: 'muscle_gain',
        currentBodyFat: undefined,
        targetBodyFat: undefined
      });
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const newMessage: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await getConsultationResponse(chatInput);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: "抱歉，連線發生錯誤。" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleExerciseCheck = (dayIndex: number, exerciseIndex: number) => {
    const key = `${dayIndex}-${exerciseIndex}`;
    setCheckedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDailyCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    if (checkInDates.includes(today)) return;

    const newDates = [...checkInDates, today];
    setCheckInDates(newDates);
    localStorage.setItem('checkInDates', JSON.stringify(newDates));
    alert("打卡成功！繼續保持！🔥");
  };

  const handleAddMetric = (metric: BodyMetrics) => {
    const newHistory = [metric, ...metricsHistory];
    setMetricsHistory(newHistory);
    localStorage.setItem('metricsHistory', JSON.stringify(newHistory));
    
    // Optionally update current weight in profile but don't regenerate plan automatically unless requested
    setProfile(prev => ({ ...prev, weight: metric.weight }));
    if (metric.bodyFat) setProfile(prev => ({ ...prev, currentBodyFat: metric.bodyFat }));
    
    alert("數據已更新！📊");
  };

  if (!plan) {
    return (
      <div className="min-h-screen p-6 max-w-lg mx-auto pb-24">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            AI 健身教練
          </h1>
          <p className="text-slate-400 text-sm">專為高中生打造的智能增肌計畫</p>
        </header>

        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SelectField 
              label="性別" 
              value={profile.gender} 
              onChange={(e: any) => setProfile({...profile, gender: e.target.value})}
              options={[{value: 'male', label: '男'}, {value: 'female', label: '女'}]} 
            />
            <NumberInput label="年齡" value={profile.age} onChange={(v: number) => setProfile({...profile, age: v})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberInput label="身高 (cm)" value={profile.height} onChange={(v: number) => setProfile({...profile, height: v})} />
            <NumberInput label="目前體重 (kg)" value={profile.weight} onChange={(v: number) => setProfile({...profile, weight: v})} step={0.1} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <NumberInput label="目標體重 (kg)" value={profile.targetWeight} onChange={(v: number) => setProfile({...profile, targetWeight: v})} step={0.1} />
             <NumberInput label="目標時間 (週)" value={profile.timeline} onChange={(v: number) => setProfile({...profile, timeline: v})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label="目前體脂率 % (選填)" value={profile.currentBodyFat || ''} onChange={(v: number) => setProfile({...profile, currentBodyFat: v})} step={0.1} />
            <NumberInput label="目標體脂率 % (選填)" value={profile.targetBodyFat || ''} onChange={(v: number) => setProfile({...profile, targetBodyFat: v})} step={0.1} />
          </div>

          <SelectField 
              label="主要目標" 
              value={profile.goal} 
              onChange={(e: any) => setProfile({...profile, goal: e.target.value})}
              options={[{value: 'muscle_gain', label: '增肌 (Muscle Gain)'}, {value: 'fat_loss', label: '減脂 (Fat Loss)'}]} 
          />

          <MultiSelectPills
            label="可用器材 (可多選)"
            options={['無器材(徒手)', '啞鈴', '槓鈴', '彈力帶', '單槓', '健身房機械', '壺鈴']}
            selectedValues={profile.equipment}
            onChange={(vals) => setProfile({...profile, equipment: vals})}
          />

          <button
            onClick={handleCreatePlan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                AI 計算中...
              </>
            ) : (
              '生成專屬計畫 🚀'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative bg-slate-950">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-white">AI 健身教練</h1>
        <div className="flex gap-2">
            <button onClick={handleReset} className="text-xs text-red-400 px-3 py-1 rounded-full border border-red-400/30 hover:bg-red-400/10">
            重設
            </button>
            <button onClick={() => setPlan(null)} className="text-xs text-slate-400 px-3 py-1 rounded-full border border-slate-700 hover:bg-slate-800">
            編輯資料
            </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {activeTab === 'plan' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wider">每日熱量</h2>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-white">{plan.dailyCalories}</span>
                    <span className="text-sm text-cyan-400 font-medium">kcal</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs mb-1">目前進度</div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-white font-mono">{profile.weight}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-cyan-400 font-bold font-mono">{profile.targetWeight} kg</span>
                  </div>
                  <button onClick={handleUpdateWeight} className="text-xs text-cyan-500 mt-1 hover:underline">
                    重新計算計畫
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/50 rounded-xl p-3 text-center border border-slate-700/50">
                  <div className="text-cyan-400 text-lg font-bold">{plan.macros.protein}g</div>
                  <div className="text-slate-500 text-xs">蛋白質</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700/50">
                  <div className="text-white text-lg font-bold">{plan.macros.carbs}g</div>
                  <div className="text-slate-500 text-xs">碳水</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700/50">
                  <div className="text-yellow-400 text-lg font-bold">{plan.macros.fats}g</div>
                  <div className="text-slate-500 text-xs">脂肪</div>
                </div>
              </div>
            </div>
            
            {/* Water Intake Card */}
            <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-800/50 flex items-center justify-between">
                <div>
                    <h3 className="text-blue-200 font-bold flex items-center gap-2">
                         💧 每日飲水建議
                    </h3>
                    <p className="text-xs text-blue-300/70 mt-1">根據你的體重與活動量</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-blue-100">{plan.waterIntake}</span>
                    <span className="text-sm text-blue-300 ml-1">ml</span>
                </div>
            </div>

            {/* Workout Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">本週訓練課表</h3>
                <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                  {plan.weeklySchedule[activeDay].day}
                </span>
              </div>
              
              {/* Day Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                {plan.weeklySchedule.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDay(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeDay === idx
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {day.day.replace(/Day\s/i, 'D')}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                  <h4 className="font-bold text-white text-lg">{plan.weeklySchedule[activeDay].focus}</h4>
                </div>
                <div className="p-2">
                  {plan.weeklySchedule[activeDay].exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="flex items-start gap-3 p-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors rounded-lg">
                      <div className="pt-1">
                        <input 
                            type="checkbox" 
                            checked={!!checkedExercises[`${activeDay}-${exIdx}`]}
                            onChange={() => toggleExerciseCheck(activeDay, exIdx)}
                            className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-700"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-medium ${checkedExercises[`${activeDay}-${exIdx}`] ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                              {ex.name}
                          </span>
                        </div>
                        <div className="flex gap-3 text-sm text-slate-400">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{ex.sets} 組</span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{ex.reps} 下</span>
                        </div>
                        {ex.notes && <p className="text-xs text-slate-500 mt-1 italic">{ex.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Check in Button for the active day */}
                <div className="p-4 border-t border-slate-800 bg-slate-800/20">
                    <button 
                        onClick={handleDailyCheckIn}
                        disabled={checkInDates.includes(new Date().toISOString().split('T')[0])}
                        className={`w-full py-3 rounded-xl font-bold text-center transition-all ${
                            checkInDates.includes(new Date().toISOString().split('T')[0])
                            ? 'bg-green-500/20 text-green-500 cursor-default'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg'
                        }`}
                    >
                        {checkInDates.includes(new Date().toISOString().split('T')[0]) ? '今日已完成簽到 ✅' : '完成今日訓練並簽到'}
                    </button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="space-y-4">
               <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-xl">🥗</span> 飲食建議
                  </h3>
                  <ul className="space-y-2">
                    {plan.dietSuggestions.slice(0, 3).map((tip, i) => (
                      <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-cyan-500 mt-1">•</span> {tip}
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span> 專家叮嚀
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                    {plan.ageSpecificAdvice}
                  </p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-4">訓練行事曆 📅</h2>
            <CalendarView checkInDates={checkInDates} />
            
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-white font-bold mb-3">簽到紀錄</h3>
                {checkInDates.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">目前還沒有簽到紀錄，開始你的第一次訓練吧！</p>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {[...checkInDates].reverse().map(date => (
                            <div key={date} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
                                <span className="text-slate-300 font-mono">{date}</span>
                                <span className="text-green-400 text-xs font-bold px-2 py-1 bg-green-400/10 rounded-full">已完成</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
           <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-4">身體數據追蹤 📊</h2>
              <StatsView history={metricsHistory} onAddMetric={handleAddMetric} height={profile.height} />
           </div>
        )}

        {activeTab === 'stretch' && (
           <div className="space-y-6 animate-fadeIn">
             <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 shadow-lg border border-indigo-700/50 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">{plan.stretchingRoutine.focus}</h2>
                <p className="text-indigo-200 text-sm">每次訓練後的放鬆時刻</p>
             </div>

             <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   ⚠️ 注意事項
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {plan.stretchingRoutine.tips}
                </p>

                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   🧘 建議動作
                </h3>
                <div className="space-y-3">
                    {plan.stretchingRoutine.movements.map((move, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                {idx + 1}
                            </div>
                            <span className="text-slate-200 font-medium">{move}</span>
                        </div>
                    ))}
                </div>
             </div>
           </div>
        )}

        {activeTab === 'consultant' && (
          <div className="h-[calc(100vh-180px)] flex flex-col">
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex-1 flex flex-col shadow-lg overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 p-2 no-scrollbar mb-4">
                    {chatMessages.length === 0 && (
                        <div className="text-center text-slate-500 mt-10">
                            <p className="mb-2">👋 有什麼想問的嗎？</p>
                            <p className="text-xs">例如：「這個課表太累了怎麼辦？」、「我最近膝蓋痛可以做什麼替代動作？」</p>
                        </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-cyan-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                     {isChatLoading && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 border border-slate-700 flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="輸入問題..."
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        disabled={isChatLoading}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center p-2 max-w-2xl mx-auto">
          <button 
            onClick={() => setActiveTab('plan')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'plan' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">計畫</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'calendar' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <CalendarIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">打卡</span>
          </button>

          <button 
            onClick={() => setActiveTab('stats')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <StatsIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">數據</span>
          </button>

          <button 
            onClick={() => setActiveTab('stretch')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'stretch' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <StretchIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">放鬆</span>
          </button>

          <button 
            onClick={() => setActiveTab('consultant')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'consultant' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ChatIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">顧問</span>
          </button>
        </div>
      </div>
    </div>
  );
}
