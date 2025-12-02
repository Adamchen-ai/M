
import React, { useState, useEffect, useRef } from 'react';
import { generateFitnessPlan, getConsultationResponse } from './services/geminiService';
import { type UserProfile, type FitnessPlan, type ChatMessage, type BodyMetrics } from './types/index';

// --- Components ---

const Navbar = ({ activeTab, setActiveTab, onReset, hasPlan }: any) => (
  <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            AI
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hidden sm:block">
            智能健身教練
          </span>
        </div>
        
        {hasPlan && (
          <div className="hidden md:flex space-x-1">
            {[
              { id: 'plan', label: '我的計畫', icon: '📋' },
              { id: 'calendar', label: '訓練日誌', icon: '📅' },
              { id: 'stats', label: '身體數據', icon: '📊' },
              { id: 'stretch', label: '放鬆修復', icon: '🧘' },
              { id: 'consultant', label: 'AI 顧問', icon: '💬' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === item.id
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
           {hasPlan && (
             <button onClick={onReset} className="text-sm text-red-400 hover:text-red-300 transition-colors">
               重設資料
             </button>
           )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {hasPlan && (
        <div className="md:hidden flex justify-between py-2 border-t border-slate-800 overflow-x-auto no-scrollbar">
           {[
              { id: 'plan', label: '計畫', icon: '📋' },
              { id: 'calendar', label: '日誌', icon: '📅' },
              { id: 'stats', label: '數據', icon: '📊' },
              { id: 'stretch', label: '放鬆', icon: '🧘' },
              { id: 'consultant', label: '顧問', icon: '💬' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-500'
                }`}
              >
                {item.label}
              </button>
            ))}
        </div>
      )}
    </div>
  </nav>
);

const NumberInput = ({ label, value, onChange, unit, step = 1, min = 0, placeholder }: any) => (
  <div className="mb-4">
    <label className="block text-slate-400 text-sm font-medium mb-2">{label}</label>
    <div className="relative group">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        min={min}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-lg transition-all group-hover:border-slate-600"
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedValues.includes(opt)
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
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

// --- Views ---

const CalendarView = ({ checkInDates }: { checkInDates: string[] }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-fadeIn">
      <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{currentYear}年 {currentMonth + 1}月</h2>
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
             <span className="text-slate-400 text-xs uppercase tracking-wide">本月堅持</span>
             <div className="text-2xl font-bold text-cyan-400">
               {checkInDates.filter(d => d.startsWith(`${currentYear}-${String(currentMonth+1).padStart(2, '0')}`)).length} <span className="text-sm">天</span>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-slate-500 text-sm font-bold">{d}</div>
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
                  aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all relative
                  ${isCheckedIn ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-inner' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'}
                  ${isToday && !isCheckedIn ? 'border-2 border-slate-400 text-white' : ''}
                `}
              >
                {day}
                {isCheckedIn && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1"></span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 h-fit">
        <h3 className="text-lg font-bold text-white mb-4">打卡紀錄</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {[...checkInDates].reverse().map(date => (
            <div key={date} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
               <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">✓</div>
               <div>
                  <div className="text-slate-200 font-medium">{date}</div>
                  <div className="text-slate-500 text-xs">完成訓練</div>
               </div>
            </div>
          ))}
          {checkInDates.length === 0 && <p className="text-slate-500 text-center py-4">尚無紀錄</p>}
        </div>
      </div>
    </div>
  );
};

const StatsView = ({ history, onAddMetric, height }: { history: BodyMetrics[], onAddMetric: (m: BodyMetrics) => void, height: number }) => {
  const [weight, setWeight] = useState<number | ''>('');
  const [bodyFat, setBodyFat] = useState<number | ''>('');
  const [muscleMass, setMuscleMass] = useState<number | ''>('');
  const [boneMass, setBoneMass] = useState<number | ''>('');
  const [visceralFat, setVisceralFat] = useState<number | ''>('');

  const handleSave = () => {
    if (typeof weight !== 'number' || !weight) return;
    const bmi = weight / ((height / 100) * (height / 100));
    const newMetric: BodyMetrics = {
      date: new Date().toISOString().split('T')[0],
      weight,
      bmi: Number(bmi.toFixed(1)),
      bodyFat: typeof bodyFat === 'number' && bodyFat ? bodyFat : undefined,
      muscleMass: typeof muscleMass === 'number' && muscleMass ? muscleMass : undefined,
      boneMass: typeof boneMass === 'number' && boneMass ? boneMass : undefined,
      visceralFat: typeof visceralFat === 'number' && visceralFat ? visceralFat : undefined,
    };
    onAddMetric(newMetric);
    setWeight(''); setBodyFat(''); setMuscleMass(''); setBoneMass(''); setVisceralFat('');
  };

  const dataPoints = [...history].reverse();
  const maxWeight = dataPoints.length > 0 ? Math.max(...dataPoints.map(d => d.weight)) + 2 : 100;
  const minWeight = dataPoints.length > 0 ? Math.min(...dataPoints.map(d => d.weight)) - 2 : 40;

  const getAdvice = (current: BodyMetrics, previous?: BodyMetrics) => {
    if (!previous) return "📝 這是你的第一筆紀錄，持續保持追蹤！";
    const weightDiff = current.weight - previous.weight;
    const muscleDiff = (current.muscleMass && previous.muscleMass) ? current.muscleMass - previous.muscleMass : 0;
    
    if (weightDiff > 0 && muscleDiff > 0) return "💪 增肌成效顯著！體重與肌肉量同時上升。";
    if (weightDiff < 0 && muscleDiff < 0) return "📉 注意蛋白質攝取，避免肌肉流失。";
    if (weightDiff < 0) return "🔥 體重下降，持續加油！";
    return "⚓️ 數據穩定，繼續保持訓練強度。";
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-cyan-400">✏️</span> 更新今日數據
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <NumberInput label="體重 (kg) *" value={weight} onChange={setWeight} step={0.1} />
             <NumberInput label="體脂率 (%)" value={bodyFat} onChange={setBodyFat} step={0.1} />
             <NumberInput label="肌肉量 (kg)" value={muscleMass} onChange={setMuscleMass} step={0.1} />
             <NumberInput label="骨量 (kg)" value={boneMass} onChange={setBoneMass} step={0.1} />
             <NumberInput label="內臟脂肪" value={visceralFat} onChange={setVisceralFat} step={0.5} />
          </div>
          <button 
            onClick={handleSave}
            disabled={!weight}
            className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            上傳紀錄 💾
          </button>
        </div>

        {dataPoints.length > 1 && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
            <h3 className="text-white font-bold mb-4">體重變化趨勢</h3>
            <div className="h-48 flex items-end justify-between gap-2 relative border-b border-slate-700/50 pb-2">
               {dataPoints.map((d, i) => {
                 const heightPercent = ((d.weight - minWeight) / (maxWeight - minWeight)) * 100;
                 return (
                   <div key={i} className="flex flex-col items-center flex-1 group relative">
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-slate-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 transition-opacity">
                        {d.weight}kg ({d.date})
                      </div>
                      <div 
                        className="w-full bg-cyan-500 rounded-t-sm opacity-60 hover:opacity-100 transition-opacity"
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
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
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden flex flex-col max-h-[600px]">
         <div className="p-5 bg-slate-800 border-b border-slate-700">
           <h3 className="text-white font-bold">歷史紀錄</h3>
         </div>
         <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
            {history.map((record, idx) => (
              <div key={idx} className="p-5 border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm font-mono">{record.date}</span>
                    <span className="text-xl font-bold text-white">{record.weight} <span className="text-sm text-slate-500">kg</span></span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg">
                    <div>BMI: <span className="text-white">{record.bmi}</span></div>
                    {record.bodyFat && <div>體脂: <span className="text-white">{record.bodyFat}%</span></div>}
                    {record.muscleMass && <div>肌肉: <span className="text-white">{record.muscleMass}kg</span></div>}
                    {record.visceralFat && <div>內臟脂肪: <span className="text-white">{record.visceralFat}</span></div>}
                 </div>
                 <div className="mt-3 text-xs text-cyan-400/90 italic flex items-center gap-1">
                    <span>💡</span> {getAdvice(record, history[idx + 1])}
                 </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                 <p className="text-4xl mb-2">📊</p>
                 <p>尚未輸入任何數據</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('plan');
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
  
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkInDates, setCheckInDates] = useState<string[]>([]);
  const [checkedExercises, setCheckedExercises] = useState<{[key: string]: boolean}>({});
  const [metricsHistory, setMetricsHistory] = useState<BodyMetrics[]>([]);
  const [activeDay, setActiveDay] = useState(0);

  // Chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Data with Error Boundary Logic
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem('fitnessPlan');
      const savedProfile = localStorage.getItem('userProfile');
      const savedDates = localStorage.getItem('checkInDates');
      const savedHistory = localStorage.getItem('metricsHistory');

      if (savedPlan) setPlan(JSON.parse(savedPlan));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedDates) setCheckInDates(JSON.parse(savedDates));
      if (savedHistory) setMetricsHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Data corruption detected, resetting storage");
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCreatePlan = async () => {
    setLoading(true);
    try {
      const generatedPlan = await generateFitnessPlan(profile);
      setPlan(generatedPlan);
      localStorage.setItem('fitnessPlan', JSON.stringify(generatedPlan));
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setChatMessages([{ role: 'model', text: '你好！我是你的 AI 健身教練。計畫已生成，準備好開始改變了嗎？' }]);
    } catch (error) {
      alert("生成失敗，請檢查網路連線。");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("確定要刪除所有資料並重新開始嗎？")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    if (!checkInDates.includes(today)) {
      const newDates = [...checkInDates, today];
      setCheckInDates(newDates);
      localStorage.setItem('checkInDates', JSON.stringify(newDates));
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatLoading(true);
    try {
      const response = await getConsultationResponse(msg);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'model', text: "連線錯誤，請稍後再試。" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Rendering ---

  // 1. Onboarding Form
  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar activeTab="" setActiveTab={() => {}} hasPlan={false} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 animate-fadeIn">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">建立你的專屬計畫</h1>
              <p className="text-slate-400">輸入基本資料，AI 將為你量身打造高中生增肌課表</p>
            </header>
            
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-2">性別</label>
                        <select 
                            className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700"
                            value={profile.gender}
                            onChange={(e:any) => setProfile({...profile, gender: e.target.value})}
                        >
                            <option value="male">男</option>
                            <option value="female">女</option>
                        </select>
                    </div>
                    <NumberInput label="年齡" value={profile.age} onChange={(v:number) => setProfile({...profile, age:v})} />
                  </div>
                  <NumberInput label="身高 (cm)" value={profile.height} onChange={(v:number) => setProfile({...profile, height:v})} />
                  <NumberInput label="體重 (kg)" value={profile.weight} onChange={(v:number) => setProfile({...profile, weight:v})} step={0.1} />
               </div>
               
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="目標體重" value={profile.targetWeight} onChange={(v:number) => setProfile({...profile, targetWeight:v})} step={0.1} />
                    <NumberInput label="計畫週數" value={profile.timeline} onChange={(v:number) => setProfile({...profile, timeline:v})} />
                  </div>
                   <div>
                        <label className="block text-slate-400 text-sm font-medium mb-2">主要目標</label>
                        <select 
                            className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700"
                            value={profile.goal}
                            onChange={(e:any) => setProfile({...profile, goal: e.target.value})}
                        >
                            <option value="muscle_gain">增肌 (Muscle Gain)</option>
                            <option value="fat_loss">減脂 (Fat Loss)</option>
                        </select>
                    </div>
               </div>
            </div>

            <div className="mt-6">
                <MultiSelectPills
                    label="可用器材"
                    options={['無器材(徒手)', '啞鈴', '槓鈴', '彈力帶', '單槓', '機械器材']}
                    selectedValues={profile.equipment}
                    onChange={(vals) => setProfile({...profile, equipment: vals})}
                />
            </div>

            <button
                onClick={handleCreatePlan}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {loading ? 'AI 正在計算代謝率與生成課表...' : '開始生成計畫 🚀'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onReset={handleReset} hasPlan={true} />
      
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* VIEW: PLAN */}
        {activeTab === 'plan' && (
           <div className="grid md:grid-cols-12 gap-6 animate-fadeIn">
              {/* Left Column: Stats & Nutrition */}
              <div className="md:col-span-4 space-y-6">
                 {/* Calories Card */}
                 <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">每日目標熱量</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">{plan.dailyCalories}</span>
                        <span className="text-cyan-400 font-medium">kcal</span>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-3 gap-2">
                        <div className="bg-slate-950/50 p-3 rounded-xl text-center border border-slate-800">
                            <div className="text-cyan-400 font-bold text-xl">{plan.macros.protein}g</div>
                            <div className="text-xs text-slate-500">蛋白質</div>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl text-center border border-slate-800">
                            <div className="text-white font-bold text-xl">{plan.macros.carbs}g</div>
                            <div className="text-xs text-slate-500">碳水</div>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl text-center border border-slate-800">
                            <div className="text-yellow-500 font-bold text-xl">{plan.macros.fats}g</div>
                            <div className="text-xs text-slate-500">脂肪</div>
                        </div>
                    </div>
                 </div>

                 {/* Water Intake Card */}
                 <div className="bg-blue-900/20 rounded-2xl p-6 border border-blue-800/30 shadow-lg flex items-center justify-between">
                    <div>
                        <h3 className="text-blue-200 font-bold flex items-center gap-2 text-lg">
                            💧 每日飲水
                        </h3>
                        <p className="text-sm text-blue-300/70 mt-1">基礎代謝需求</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-blue-100">{plan.waterIntake}</span>
                        <span className="text-sm text-blue-300 ml-1">ml</span>
                    </div>
                 </div>

                 {/* Advice Card */}
                 <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-white font-bold mb-4">💡 AI 飲食建議</h3>
                    <ul className="space-y-3">
                        {plan.dietSuggestions.slice(0, 3).map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-300">
                                <span className="text-cyan-500 font-bold">•</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                 </div>
              </div>

              {/* Right Column: Workout Schedule */}
              <div className="md:col-span-8">
                 <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-4 bg-slate-800/50 border-b border-slate-700 overflow-x-auto">
                        <div className="flex space-x-2 min-w-max">
                            {plan.weeklySchedule.map((day, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveDay(idx)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                        activeDay === idx 
                                        ? 'bg-cyan-600 text-white shadow-lg' 
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                                >
                                    {day.day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">{plan.weeklySchedule[activeDay].focus}</h2>
                            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">
                                {plan.weeklySchedule[activeDay].exercises.length} 個動作
                            </span>
                        </div>
                        
                        <div className="space-y-3 flex-1">
                            {plan.weeklySchedule[activeDay].exercises.map((ex, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/30 border border-slate-800/50 hover:border-cyan-500/30 transition-colors group">
                                    <input 
                                        type="checkbox" 
                                        className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                                        checked={!!checkedExercises[`${activeDay}-${i}`]}
                                        onChange={() => setCheckedExercises(prev => ({...prev, [`${activeDay}-${i}`]: !prev[`${activeDay}-${i}`]}))}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className={`font-bold text-lg ${checkedExercises[`${activeDay}-${i}`] ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                                                {ex.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-sm text-slate-400">
                                            <span className="bg-slate-800 px-2 py-1 rounded text-cyan-400 font-mono">{ex.sets} 組</span>
                                            <span className="bg-slate-800 px-2 py-1 rounded text-cyan-400 font-mono">{ex.reps} 下</span>
                                        </div>
                                        {ex.notes && <p className="text-xs text-slate-500 mt-2 italic">{ex.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <button 
                                onClick={handleCheckIn}
                                disabled={checkInDates.includes(new Date().toISOString().split('T')[0])}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                    checkInDates.includes(new Date().toISOString().split('T')[0])
                                    ? 'bg-green-600/20 text-green-500 cursor-default border border-green-600/30'
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg'
                                }`}
                            >
                                {checkInDates.includes(new Date().toISOString().split('T')[0]) ? '🎉 今日訓練已完成！' : '完成今日訓練並簽到'}
                            </button>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* VIEW: STATS */}
        {activeTab === 'stats' && <StatsView history={metricsHistory} onAddMetric={(m) => {
            const newH = [m, ...metricsHistory];
            setMetricsHistory(newH);
            localStorage.setItem('metricsHistory', JSON.stringify(newH));
            setProfile(p => ({...p, weight: m.weight}));
        }} height={profile.height} />}

        {/* VIEW: CALENDAR */}
        {activeTab === 'calendar' && <CalendarView checkInDates={checkInDates} />}

        {/* VIEW: STRETCH */}
        {activeTab === 'stretch' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-center shadow-2xl border border-indigo-500/30">
                    <h2 className="text-3xl font-bold text-white mb-2">{plan.stretchingRoutine.focus}</h2>
                    <p className="text-indigo-200">專屬你的課後修復菜單</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-4">⚠️ 關鍵提示</h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{plan.stretchingRoutine.tips}</p>
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                         <h3 className="text-xl font-bold text-white mb-4">🧘 推薦動作</h3>
                         <ul className="space-y-4">
                            {plan.stretchingRoutine.movements.map((m, i) => (
                                <li key={i} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg">
                                    <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">{i+1}</span>
                                    <span className="text-slate-200">{m}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: CONSULTANT */}
        {activeTab === 'consultant' && (
            <div className="max-w-3xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden h-[600px] flex flex-col animate-fadeIn">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">AI</div>
                    <div>
                        <div className="font-bold text-white">私人健身顧問</div>
                        <div className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> 線上
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                    {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-cyan-600 text-white rounded-tr-sm' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-700 flex gap-2">
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>
                <div className="p-4 bg-slate-800 border-t border-slate-700">
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="問問教練關於飲食或訓練的問題..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || isChatLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
