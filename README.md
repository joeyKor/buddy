# 👟 버디버디 (BUDDYBUDDY) Version 7.0 - Retro Web Client

추억의 2000년대 국민 메신저 **버디버디(BuddyBuddy) Version 7.0**의 로그인 화면 및 실시간 쪽지 기능을 웹 표준 기술(HTML, CSS, JavaScript)과 **Firebase Realtime Database**를 활용해 재현한 레트로 웹 클라이언트 프로젝트입니다.

---

## ✨ 주요 기능 (Key Features)

### 1. 2000년대 감성의 클래식 UI/UX 정밀 재현
- **날개 달린 연두색 부츠 & 로고**: CSS 애니메이션으로 둥실둥실 떠오르는 상징적인 엠블럼과 입체 타이포그래피
- **윈도우 창 인터랙션**: 레트로 스타일의 커스텀 타이틀 바 드래그 이동, 최소화/닫기 버튼 및 커스텀 알림 모달창
- **추억의 로그인 폼**:
  - 알약 모양(Pill-style)의 입체 인풋 박스
  - 최근 접속한 이용자 ID 히스토리 콤보박스
  - 황금 열쇠 아이콘이 박힌 입체 광택 로그인 버튼
  - '친구 몰래 입장', '자동 로그인', '비밀번호 저장' 레트로 체크박스
- **레트로 사운드 이펙트**: Web Audio API로 구현한 메신저 접속음, 알림음, 버튼 클릭음, 실시간 쪽지 수신 차임벨

### 2. 별도 가입 없는 간편 접속
- 복잡한 회원가입이나 인증 절차 없이, 원하는 **이용자 ID**만 입력하면 즉시 접속 가능
- 비밀번호는 일괄적으로 `"1234"`로 설정되어 있어 간편하게 테스트 가능

### 3. Firebase 실시간 쪽지 송수신 시스템
- **실시간 쪽지함**:
  - **받은 쪽지함**: 실시간 쪽지 수신 알림음, 읽지 않은 쪽지 개수 배지, 보낸 사람 및 수신 시간 표시
  - **보낸 쪽지함**: 내가 보낸 쪽지 목록 보관
  - **쪽지 읽기 & 답장**: 쪽지 클릭 시 상세 내용 확인, 즉시 답장 작성, 쪽지 삭제 기능 지원
- **버디 목록 관리**:
  - 친구 ID를 자유롭게 추가하거나 삭제하여 나만의 친구 목록 구성
- **Firebase Realtime Database 연동**:
  - `https://sedu-flutter-0001-default-rtdb.asia-southeast1.firebasedatabase.app`와 실시간 동기화
  - 상단 톱니바퀴(`⚙`) 버튼을 통해 본인의 Firebase Realtime Database URL로 즉시 변경 가능
  - 오프라인 또는 설정 전 상태에서도 브라우저 멀티탭 간 실시간 통신(BroadcastChannel) 지원

---

## 📁 프로젝트 구조 (Project Structure)

```
buddy/
├── index.html            # 메인 HTML 마크업 (로그인 화면, 메신저 창, 모달 다이얼로그)
├── style.css             # 레트로 윈도우 & 버디버디 테마 CSS 스타일시트
├── script.js             # UI 상호작용, 사운드, Firebase 실시간 쪽지 로직
├── firebase-config.js    # Firebase Realtime Database 연결 설정
└── README.md             # 프로젝트 소개 문서
```

---

## 🚀 실행 방법 (Getting Started)

### 로컬 환경에서 바로 실행
1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/joeyKor/buddy.git
   cd buddy
   ```
2. 웹 브라우저에서 `index.html` 파일을 더블클릭하여 바로 열거나, 로컬 웹 서버를 구동합니다:
   ```bash
   # Python 3
   python -m http.server 8080
   ```
3. 웹 브라우저에서 `http://localhost:8080`에 접속합니다.

### 쪽지 테스트 방법
1. 첫 번째 탭에서 원하는 ID(예: `buddy_angel`)를 입력하고 비밀번호 `1234`로 로그인합니다.
2. 두 번째 탭(또는 시크릿 창)을 열어 다른 ID(예: `candy_girl`)를 입력하고 로그인합니다.
3. 상단 **[✉ 쪽지 보내기]** 버튼을 눌러 상대방 ID로 쪽지를 전송하면, 실시간으로 상대방 창에 차임벨과 함께 쪽지가 도착합니다!

---

## 🛠 기술 스택 (Tech Stack)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Graphics & Vector**: Inline SVG (하늘, 언덕, 데이지 꽃, 날개 부츠 엠블럼, 황금 열쇠)
- **Audio**: Web Audio API (Synthesized Retro Sound Effects)
- **Backend / Real-time Database**: Google Firebase Realtime Database (Compat SDK)

---

## 📄 라이선스 (License)
This project is licensed under the MIT License.
버디버디(BuddyBuddy)의 디자인 및 콘셉트는 원 저작권자의 추억과 감성을 기리기 위한 레트로 재현 프로젝트입니다.
