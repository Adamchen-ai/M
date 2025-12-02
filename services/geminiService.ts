
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { type UserProfile, type FitnessPlan, type ChatMessage } from '../types/index';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Keep a reference to the active chat session
let chatSession: Chat | null = null;

export const generateFitnessPlan = async (profile: UserProfile): Promise<FitnessPlan> => {
  try {
    const goalText = profile.goal === 'muscle_gain' ? '增肌 (Muscle Gain)' : '減脂 (Fat Loss)';
    
    const prompt = `
      扮演一位世界級的體能與營養教練，專門指導青少年發育期的體態重組。
      請為一位高中生設計一份高度客製化的計畫。
      
      **學生檔案:**
      - 年齡: ${profile.age} 歲
      - 性別: ${profile.gender === 'male' ? '男' : '女'}
      - 身高: ${profile.height} cm
      - 目前體重: ${profile.weight} kg
      - 目標體重: ${profile.targetWeight} kg
      - 主要目標: ${goalText}
      - 計畫時間: ${profile.timeline} 週
      - 可用器材: ${profile.equipment.join(', ')}
      ${profile.currentBodyFat ? `- 目前體脂率: ${profile.currentBodyFat}%` : ''}
      ${profile.targetBodyFat ? `- 目標體脂率: ${profile.targetBodyFat}%` : ''}

      **目標與限制:**
      1. **安全第一:** 避免對青少年造成高受傷風險的動作。強調姿勢正確性。
      2. **策略調整:**
         - 如果是 **增肌**: 請設定適度的熱量盈餘，專注於肌肉肥大。
         - 如果是 **減脂**: 請設定適度的熱量赤字，並確保高蛋白攝取以保留肌肉。
      3. **課表安排:** 設計每週 6 天的訓練菜單（1 天休息）。
      4. **精準營養:** 計算精確的營養素（Macros）與建議飲水量 (依據體重計算，通常約 30-40ml/kg)。
      5. **拉筋放鬆:** 提供運動後的伸展建議，預防生長痛與運動傷害。
      6. **語言:** **必須使用繁體中文 (Traditional Chinese)**。

      **輸出格式要求 (JSON):**
      - **dailyCalories**: 整數 (kcal)。
      - **waterIntake**: 整數 (每日建議毫升數 ml)。
      - **macros**: 蛋白質、碳水、脂肪的克數 (grams)。
      - **weeklySchedule**: 6 天訓練 + 1 天休息的陣列。
      - **dietSuggestions**: 4-5 個具體的健康餐點建議。
      - **foodSwaps**: 4-5 個替換建議，例如「炸雞換成烤雞胸肉」。
      - **ageSpecificAdvice**: 針對此年齡層的睡眠、荷爾蒙、生長與壓力管理的特別建議。
      - **stretchingRoutine**: 包含 focus (重點部位), tips (注意事項), movements (3-5個動作名稱)。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalories: { type: Type.NUMBER },
            waterIntake: { type: Type.NUMBER, description: "Daily water intake in ml" },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER }
              },
              required: ['protein', 'carbs', 'fats']
            },
            weeklySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      },
                      required: ['name', 'sets', 'reps']
                    }
                  }
                },
                required: ['day', 'focus', 'exercises']
              }
            },
            dietSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            foodSwaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            ageSpecificAdvice: { type: Type.STRING },
            stretchingRoutine: {
              type: Type.OBJECT,
              properties: {
                focus: { type: Type.STRING },
                tips: { type: Type.STRING },
                movements: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['focus', 'tips', 'movements']
            }
          },
          required: ['dailyCalories', 'waterIntake', 'macros', 'weeklySchedule', 'dietSuggestions', 'foodSwaps', 'ageSpecificAdvice', 'stretchingRoutine']
        },
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as FitnessPlan;

    // Initialize chat session with context
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `
          你是一位專業的 AI 健身顧問。使用者已經有一份你生成的健身計畫。
          使用者的資料：
          - 年齡: ${profile.age}
          - 性別: ${profile.gender}
          - 目前體重: ${profile.weight}kg, 目標: ${profile.targetWeight}kg
          - 目標方向: ${goalText}
          - 目前計畫熱量: ${plan.dailyCalories}kcal
          - 訓練重點: ${plan.weeklySchedule.map(d => d.focus).join(', ')}
          
          你的任務是回答使用者的問題，協助調整計畫，或提供運動科學知識。
          請用繁體中文回答，語氣鼓勵且專業。回答請簡潔。
        `,
      }
    });

    return plan;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("無法生成健身計畫，請稍後再試。");
  }
};

export const getConsultationResponse = async (userMessage: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Please generate a plan first.");
  }
  try {
    const result = await chatSession.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "抱歉，我目前無法回應，請稍後再試。";
  }
};
