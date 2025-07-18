import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3001';

const texts = {
    ko: {
        title: "AI 기반 주관식 성향 분석",
        description: "AI가 당신의 글을 분석하여 당신의 진짜 성향을 알려드립니다.",
        startButton: "검사 시작하기",
        loadingQuestions: "질문 로딩 중...",
        analyzing: "AI가 당신의 답변을 분석중입니다...",
        allQuestionsAnswered: "모든 질문에 답변해주세요.",
        answerRequired: "답변을 입력해주세요.",
        analysisError: "분석 중 오류가 발생했습니다.",
        resultTitle: "분석 결과:",
        retryButton: "다시하기",
        question: "질문",
        placeholder: "자유롭게 생각을 적어주세요...",
        previous: "이전",
        next: "다음",
        analyzeResult: "결과 분석하기"
    },
    en: {
        title: "AI-Powered Subjective Tendency Analysis",
        description: "AI analyzes your writing to reveal your true personality.",
        startButton: "Start Test",
        loadingQuestions: "Loading questions...",
        analyzing: "AI is analyzing your answers...",
        allQuestionsAnswered: "Please answer all questions.",
        answerRequired: "Please enter your answer.",
        analysisError: "An error occurred during analysis.",
        resultTitle: "Analysis Result:",
        retryButton: "Try Again",
        question: "Question",
        placeholder: "Write your thoughts freely...",
        previous: "Previous",
        next: "Next",
        analyzeResult: "Analyze Result"
    }
};

function App() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [language, setLanguage] = useState('ko');
    const textareaRef = useRef(null);

    const currentTexts = texts[language];

    useEffect(() => {
        axios.get(`${API_URL}/api/questions?lang=${language}`)
            .then(response => {
                setQuestions(response.data);
                setAnswers({});
                setCurrentQuestionIndex(0);
            })
            .catch(error => console.error("Error fetching questions:", error));
    }, [language]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [currentQuestionIndex, questions]);


    const handleAnswerChange = (questionId, text) => {
        setAnswers(prev => ({...prev, [questionId]: text}));
    };

    const handleNext = () => {
        const currentQuestionId = questions[currentQuestionIndex].id;
        if (!answers[currentQuestionId] || answers[currentQuestionId].trim() === '') {
            alert(currentTexts.answerRequired);
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        const currentQuestionId = questions[currentQuestionIndex].id;
        if (!answers[currentQuestionId] || answers[currentQuestionId].trim() === '') {
            alert(currentTexts.answerRequired);
            return;
        }

        if (Object.keys(answers).length !== questions.length) {
            alert(currentTexts.allQuestionsAnswered);
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const orderedAnswers = questions.map(q => answers[q.id] || "");
            const response = await axios.post(`${API_URL}/api/analyze`, {answers: orderedAnswers, language: language});
            setResult(response.data);
        } catch (error) {
            console.error("Error submitting answers:", error);
            alert(currentTexts.analysisError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        setIsTestStarted(false);
        setResult(null);
    };

    const isCurrentAnswerEmpty = () => {
        if (!questions.length) return true;
        const currentQuestionId = questions[currentQuestionIndex]?.id;
        return !answers[currentQuestionId] || answers[currentQuestionId].trim() === '';
    };

    // 점수를 백분율로 변환하고, 해당 문자를 결정하는 헬퍼 함수
    const formatScore = (score, typeA, typeB) => {
        let percentage;
        let preferenceType;

        if (score >= 0) {
            percentage = score;
            preferenceType = typeA;
        } else {
            percentage = Math.abs(score);
            preferenceType = typeB;
        }
        return `${preferenceType} (${percentage}%)`;
    };

    if (!isTestStarted) {
        return (
            <div className="container">
                <div className="language-selector">
                    <select onChange={handleLanguageChange} value={language}>
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                    </select>
                </div>
                <h1>{currentTexts.title}</h1>
                <p>{currentTexts.description}</p>
                <button onClick={() => setIsTestStarted(true)} disabled={questions.length === 0}>
                    {questions.length > 0 ? currentTexts.startButton : currentTexts.loadingQuestions}
                </button>
            </div>
        );
    }

    if (isLoading) {
        return <div className="container"><h2>{currentTexts.analyzing}</h2></div>;
    }

    if (result) {
        // 백엔드에서 score 필드가 항상 온다고 가정합니다.
        // 만약 score가 없을 수 있다면, 여기에 안전한 널 체크를 추가해야 합니다.
        const scores = result.scores || {}; // score 필드가 없을 경우를 대비하여 빈 객체 할당

        return (
            <div className="container result-container">
                <div className="language-selector">
                    <select onChange={handleLanguageChange} value={language}>
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                    </select>
                </div>
                <h1>{currentTexts.resultTitle} {result.mbti_type}</h1>
                <div className="analysis-box">
                    <p>
                        <strong>{result.analysis.ei.type} ({formatScore(scores.ei, 'E', 'I')}):</strong> {result.analysis.ei.reason}
                    </p>
                    <p>
                        <strong>{result.analysis.sn.type} ({formatScore(scores.sn, 'S', 'N')}):</strong> {result.analysis.sn.reason}
                    </p>
                    <p>
                        <strong>{result.analysis.tf.type} ({formatScore(scores.tf, 'T', 'F')}):</strong> {result.analysis.tf.reason}
                    </p>
                    <p>
                        <strong>{result.analysis.jp.type} ({formatScore(scores.jp, 'J', 'P')}):</strong> {result.analysis.jp.reason}
                    </p>
                </div>
                <button onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setIsTestStarted(false);
                }}>{currentTexts.retryButton}
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="language-selector">
                <select onChange={handleLanguageChange} value={language}>
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                </select>
            </div>
            {questions.length > 0 && (
                <div className="question-box">
                    <h2>{currentTexts.question} {currentQuestionIndex + 1}/{questions.length}</h2>
                    <p>{questions[currentQuestionIndex].text}</p>
                    <textarea
                        ref={textareaRef}
                        rows="8"
                        value={answers[questions[currentQuestionIndex].id] || ''}
                        onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                        placeholder={currentTexts.placeholder}
                    />
                    <div className="button-group">
                        <button onClick={handleBack}
                                disabled={currentQuestionIndex === 0}>{currentTexts.previous}</button>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button onClick={handleNext} disabled={isCurrentAnswerEmpty()}>{currentTexts.next}</button>
                        ) : (
                            <button onClick={handleSubmit} className="submit-btn"
                                    disabled={isCurrentAnswerEmpty()}>{currentTexts.analyzeResult}</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;