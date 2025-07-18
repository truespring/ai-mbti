const express = require('express');
const cors = require('cors');
const {GoogleGenerativeAI} = require("@google/generative-ai");
require('dotenv').config(); // .env 파일의 환경 변수를 불러옵니다.

const app = express();
const port = 3001;

// .env 파일에서 API 키를 가져옵니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors({
    origin: ['http://localhost:3000', 'https://your-frontend-app.vercel.app'] // 여기에 실제 프론트엔드 도메인을 추가
}));
app.use(express.json());

// 질문 데이터를 언어별로 분리 (총 8개 질문)
const questions_ko = [
    {id: 1, text: "정신없이 바빴던 한 주가 끝났습니다. 이번 주말, 당신의 이상적인 재충전 방식은 무엇인가요? 자세히 설명해주세요."}, // E/I
    {id: 2, text: "관심 있는 주제로 가득한 파티에 초대되었습니다. 그곳에서 당신은 주로 어떻게 시간을 보낼 것 같나요?"}, // E/I
    {id: 3, text: "지금껏 없었던 새로운 방식의 스마트폰이 출시되었습니다. 구매를 결정하기까지 당신의 생각 과정은 어떨 것 같나요?"}, // S/N
    {id: 4, text: "친한 친구가 '지금 하는 일이 나랑 안 맞는 것 같아'라며 고민을 털어놓습니다. 당신의 첫 반응은 무엇일까요?"}, // S/N
    {id: 5, text: "오랫동안 계획했던 중요한 약속과, 도움이 꼭 필요한 친구의 갑작스러운 부탁이 겹쳤습니다. 어떻게 결정하실 건가요?"}, // T/F
    {id: 6, text: "당신이 리더인 팀 프로젝트에서 팀원들의 의견이 크게 엇갈리고 있습니다. 이 상황을 어떻게 해결해 나갈 건가요?"}, // T/F
    {id: 7, text: "한 달간의 자유로운 해외여행 기회가 생겼습니다. 어떻게 여행을 준비하고 즐길 건가요? 당신의 여행 스타일을 들려주세요."}, // J/P
    {id: 8, text: "오늘 해야 할 일 목록이 있지만, 갑자기 흥미로운 전시회 소식을 들었습니다. 당신의 선택은 무엇이며 그 이유는 무엇인가요?"}  // J/P
];

const questions_en = [
    {
        id: 1,
        text: "A hectic week has finally ended. What is your ideal way to recharge this weekend? Please describe in detail."
    }, // E/I
    {
        id: 2,
        text: "You've been invited to a party full of topics that interest you. How do you think you'll spend your time there?"
    }, // E/I
    {
        id: 3,
        text: "A new type of smartphone, unlike any before, has been released. What would your thought process be before deciding to buy it?"
    }, // S/N
    {
        id: 4,
        text: "A close friend confides in you, saying, 'I don't think my current job is the right fit for me.' What would be your initial reaction?"
    }, // S/N
    {
        id: 5,
        text: "An important, long-planned appointment conflicts with a sudden request from a friend who desperately needs your help. How will you decide?"
    }, // T/F
    {
        id: 6,
        text: "In a team project you're leading, team members have strongly conflicting opinions. How would you resolve this situation?"
    }, // T/F
    {
        id: 7,
        text: "You have a chance for a month-long, flexible trip abroad. How will you prepare for and enjoy the trip? Tell us about your travel style."
    }, // J/P
    {
        id: 8,
        text: "You have a to-do list for today, but you suddenly hear about an interesting exhibition. What would you choose to do and why?"
    } // J/P
];


// 실제 Gemini API를 호출하는 함수에 language 매개변수 추가
async function getAiAnalysis(answers, language) {
    console.log(`AI에게 ${language} 분석을 요청합니다:`, answers);

    // 분석을 위한 Gemini Pro 모델을 선택합니다.
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const langInstruction = language === 'ko' ? "결과를 한국어로 제공해 주세요." : "Please provide the result in English.";

    // 프롬프트에 8개 질문 모두 포함
    const prompt = `
    You are an expert psychologist specializing in personality analysis based on the MBTI framework.
    Analyze the following user's answers to open-ended questions.
    For each of the 4 dichotomies (E/I, S/N, T/F, J/P), determine the user's preference.

    - Extraversion(E) vs. Introversion(I): Where does the user get their energy?
    - Sensing(S) vs. Intuition(N): How does the user perceive information?
    - Thinking(T) vs. Feeling(F): How does the user make decisions?
    - Judging(J) vs. Perceiving(P): How does the user prefer to live their outer life?

    Based on the answers below, provide a final MBTI type and a brief justification for each letter.
    Return the result ONLY as a clean JSON object without any other text or markdown formatting or markdown backticks.
    ${langInstruction}
    The JSON format must be:
   {
      "mbti_type": "string",
      "scores": {
        "ei": "number between -100 and 100",
        "sn": "number between -100 and 100",
        "tf": "number between -100 and 100",
        "jp": "number between -100 and 100"
      },
      "analysis": {
        "ei": { "type": "E or I", "reason": "brief justification" },
        "sn": { "type": "S or N", "reason": "brief justification" },
        "tf": { "type": "T or F", "reason": "brief justification" },
        "jp": { "type": "J or P", "reason": "brief justification" }
      }
    }

    --- User Answers ---
    Question 1 (About social situations): "${answers[0]}"
    Question 2 (About social interaction): "${answers[1]}"
    Question 3 (About perceiving information): "${answers[2]}"
    Question 4 (About detail vs. big picture): "${answers[3]}"
    Question 5 (About decision making): "${answers[4]}"
    Question 6 (About conflict resolution): "${answers[5]}"
    Question 7 (About planning): "${answers[6]}"
    Question 8 (About spontaneity): "${answers[7]}"
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // AI가 마크다운으로 응답하는 경우를 대비하여 백틱 제거
        // '```json' 으로 시작하고 '```' 으로 끝나는 경우를 처리합니다.
        if (text.startsWith('```json')) {
            text = text.substring(7); // '```json' 제거
        }
        if (text.endsWith('```')) {
            text = text.slice(0, -3); // '```' 제거
        }

        console.log("AI Response Text (cleaned):", text);
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        // AI 응답이 잘못되었거나 파싱에 실패한 경우를 대비한 기본 에러 응답
        throw new Error("Failed to get a valid response from AI.");
    }
}

// API 엔드포인트에 language 매개변수 추가
app.get('/api/questions', (req, res) => {
    const language = req.query.lang || 'ko'; // 기본값은 한국어
    if (language === 'en') {
        res.json(questions_en);
    } else {
        res.json(questions_ko);
    }
});

app.post('/api/analyze', async (req, res) => {
    try {
        const {answers, language} = req.body; // language도 함께 받음
        if (!answers || answers.length === 0) {
            return res.status(400).json({error: 'Answers are required'});
        }

        // 실제 AI 분석 함수 호출 시 language 매개변수 전달
        const result = await getAiAnalysis(answers, language || 'ko'); // language가 없으면 기본값 한국어
        res.json(result);

    } catch (error) {
        console.error("Error in /api/analyze:", error.message);
        res.status(500).json({error: "Failed to analyze answers"});
    }
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});