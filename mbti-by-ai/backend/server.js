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
    {id: 1, text: "주말 저녁, 에너지를 재충전하기 위해 당신은 주로 무엇을 하나요? 혼자만의 시간을 보내나요, 아니면 친구들과 어울리나요? 그 이유는 무엇인가요?"}, // E/I
    {id: 2, text: "새로운 사람들과 만나는 자리에서, 당신은 먼저 말을 거는 편인가요, 아니면 상대방이 다가오기를 기다리는 편인가요? 그 이유는 무엇인가요?"}, // E/I 추가
    {id: 3, text: "새로운 프로젝트를 시작할 때, 당신은 어떤 정보에 더 끌리나요? 이미 검증된 사실과 구체적인 데이터인가요, 아니면 전체적인 그림과 미래의 가능성인가요?"}, // S/N
    {id: 4, text: "어떤 물건을 살 때, 당신은 실제 사용 후기와 구체적인 스펙을 꼼꼼히 확인하는 편인가요, 아니면 디자인이나 느낌, 전반적인 평판에 더 영향을 받나요?"}, // S/N 추가
    {id: 5, text: "친구가 어려운 결정을 앞두고 조언을 구할 때, 당신은 보통 어떻게 반응하나요? 객관적인 장단점을 분석해주나요, 아니면 친구의 감정과 관계에 미칠 영향을 먼저 고려하나요?"}, // T/F
    {id: 6, text: "팀 프로젝트에서 갈등이 발생했을 때, 당신은 문제의 '논리적 해결'에 집중하는 편인가요, 아니면 팀원들 간의 '화합과 분위기'를 더 중요하게 생각하나요?"}, // T/F 추가
    {id: 7, text: "여행을 계획할 때, 당신의 스타일은 어떤가요? 모든 일정을 시간대별로 꼼꼼하게 짜는 편인가요, 아니면 큰 틀만 정해두고 현지 상황에 따라 즉흥적으로 움직이는 것을 즐기나요?"}, // J/P
    {id: 8, text: "갑자기 생긴 여유 시간에 당신은 무엇을 할 가능성이 더 큰가요? 미리 계획된 활동을 시작하나요, 아니면 그 순간 하고 싶은 일을 찾아 자유롭게 시간을 보내나요?"}  // J/P 추가
];

const questions_en = [
    {id: 1, text: "On a weekend evening, what do you usually do to recharge your energy? Do you spend time alone, or do you socialize with friends? What is your reason?"}, // E/I
    {id: 2, text: "When meeting new people, do you usually initiate conversations, or do you wait for others to approach you? Why?"}, // E/I Added
    {id: 3, text: "When starting a new project, what kind of information are you more drawn to? Verified facts and concrete data, or the bigger picture and future possibilities?"}, // S/N
    {id: 4, text: "When buying something, do you meticulously check actual user reviews and specific specs, or are you more influenced by design, feel, or general reputation?"}, // S/N Added
    {id: 5, text: "When a friend asks for advice on a difficult decision, how do you usually respond? Do you analyze objective pros and cons, or do you first consider your friend's feelings and the impact on relationships?"}, // T/F
    {id: 6, text: "When a conflict arises in a team project, do you tend to focus on 'logical problem-solving' or do you prioritize 'harmony and atmosphere' among team members?"}, // T/F Added
    {id: 7, text: "When planning a trip, what is your style? Do you meticulously plan every detail by the hour, or do you prefer to set a general framework and spontaneously adjust based on local circumstances?"}, // J/P
    {id: 8, text: "When you suddenly have free time, what are you more likely to do? Start a pre-planned activity, or freely spend the time finding something you feel like doing at that moment?"} // J/P Added
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