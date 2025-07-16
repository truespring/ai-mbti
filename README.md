AI 기반 주관식 성향 분석 서비스
✨ 프로젝트 소개
이 프로젝트는 Gemini AI 모델을 활용하여 사용자의 주관식 답변을 분석하고, MBTI(성격 유형 지표) 기반의 성향을 예측하여 제공하는 웹 서비스입니다. 사용자는 몇 가지 질문에 자유롭게 답변하고, AI는 이 답변들을 심층 분석하여 개인의 성향을 파악하고 간략한 설명을 제공합니다. 한국어와 영어 두 가지 언어를 지원하여 글로벌 사용자도 쉽게 이용할 수 있습니다.

🚀 주요 기능
주관식 답변 기반 성향 분석: 사용자의 심층적인 사고와 표현을 바탕으로 MBTI 성향을 분석합니다.

Gemini AI 모델 활용: Google의 강력한 Gemini 2.5 Flash 모델을 사용하여 정확하고 빠른 분석을 제공합니다.

다국어 지원: 한국어 및 영어 질문과 분석 결과를 제공하여 다양한 사용자가 이용할 수 있습니다.

직관적인 UI: 사용자가 질문에 집중하고 쉽게 답변을 입력할 수 있도록 깔끔하고 반응형인 사용자 인터페이스를 제공합니다.

답변 유효성 검사 및 자동 포커스: 답변을 입력해야 다음 질문으로 넘어갈 수 있으며, 다음 질문 시 자동으로 입력 필드에 커서가 이동하여 사용자 경험을 개선합니다.

🛠️ 기술 스택
프론트엔드:

React.js

Axios (API 통신)

CSS

백엔드:

Node.js

Express.js (웹 서버 프레임워크)

@google/generative-ai (Gemini API 연동)

CORS (Cross-Origin Resource Sharing)

dotenv (환경 변수 관리)

📦 설치 및 실행 방법
이 프로젝트는 프론트엔드와 백엔드로 구성되어 있습니다. 각 부분을 별도로 설치하고 실행해야 합니다.

1. 백엔드 설정 및 실행
저장소 클론:

Bash

git clone [백엔드 저장소 URL]
cd [백엔드 프로젝트 폴더 (예: mbti-analysis-backend)]
의존성 설치:

Bash

npm install
# 또는 yarn add
환경 변수 설정:
프로젝트 루트에 .env 파일을 생성하고 Google Gemini API 키를 추가합니다.

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
API 키는 Google AI Studio에서 발급받을 수 있습니다.

서버 실행:

Bash

node server.js
서버는 기본적으로 http://localhost:3001에서 실행됩니다.

2. 프론트엔드 설정 및 실행
프로젝트 폴더로 이동:

Bash

cd [프론트엔드 프로젝트 폴더 (예: mbti-analysis-frontend)]
만약 백엔드와 같은 저장소에 있다면, 프론트엔드 폴더(예: client 또는 frontend)로 이동해야 합니다.

의존성 설치:

Bash

npm install
# 또는 yarn add
애플리케이션 실행:

Bash

npm start
# 또는 yarn start
프론트엔드 애플리케이션은 기본적으로 http://localhost:3000에서 실행됩니다.

🌐 배포 (Hosting)
프로젝트를 외부에서 접근 가능하도록 배포하려면 다음 단계를 고려할 수 있습니다.

프론트엔드 (React): Vercel, Netlify, GitHub Pages, Firebase Hosting 등 정적 웹 호스팅 서비스에 빌드된 React 앱을 배포합니다.

백엔드 (Node.js): Render, Heroku, AWS EC2/Elastic Beanstalk, Google Cloud Run/App Engine 등 Node.js 애플리케이션을 호스팅할 수 있는 클라우드 플랫폼에 배포합니다.

중요: 배포 시 백엔드 server.js 파일의 CORS 설정을 프론트엔드 앱의 도메인에 맞게 업데이트해야 합니다. .env 파일의 API 키는 각 호스팅 서비스의 환경 변수 설정 기능을 사용하여 안전하게 관리해야 합니다.

🤝 기여 방법
프로젝트 개선에 기여하고 싶다면 다음 절차를 따르세요.

이 저장소를 포크(Fork)합니다.

새로운 기능/버그 수정을 위한 브랜치를 생성합니다 (git checkout -b feature/awesome-feature).

변경 사항을 커밋하고 (git commit -m 'feat: Add awesome feature').

원격 저장소에 푸시합니다 (git push origin feature/awesome-feature).

풀 리퀘스트(Pull Request)를 생성합니다.

📄 라이선스
이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하십시오.

📧 문의
문의사항이나 피드백이 있으시면 [truespring1@gmail.com]로 연락 주십시오.