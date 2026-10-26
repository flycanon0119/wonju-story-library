# 원주도서관

청소년이 한 사람의 경험을 책처럼 읽고, 관심 있는 멘토와 대화를 이어가는 웹앱입니다.

- [모바일 앱](https://wonju-story-library.lively-apple-0815.chatgpt.site/mobile)
- [PC 앱](https://wonju-story-library.lively-apple-0815.chatgpt.site/desktop.html)
- [개발 기록과 Firebase 안내](firebase-notes.md)
- [형상관리 안내](version-control.md)

## 구성

`dist/`의 HTML·CSS·JavaScript를 그대로 실행하는 정적 웹앱입니다. Firebase Authentication과 Firestore를 사용합니다. 얼굴 사진과 소개가 있는 기본 사람책은 가상 예시입니다.

관심 분야·고민 통합 검색, 추천 서가, 멘토 프로필, 질문·대화, 멘토링 신청·일정, 신고·사서 상담, 개인 활동 책갈피를 제공합니다. 실제 계정, 승인 멘토와 운영 절차의 준비가 필요합니다.

## 실행

Node.js가 설치된 환경에서 저장소 최상위 폴더를 엽니다.

1. `dist/firebase-config.example.js`를 같은 폴더의 `firebase-config.js`로 복사합니다.
2. Firebase 콘솔에서 자신의 웹앱 설정을 확인해 빈 값을 채웁니다. 서비스 계정 키는 사용하지 않습니다.
3. `node serve.cjs`를 실행합니다.
4. `http://127.0.0.1:4173/mobile.html` 또는 `/desktop.html`을 엽니다.

실제 Firebase 설정 없이 서버 연결과 회원 기능은 동작하지 않습니다. 테스트는 `node tests/activity-bookmarks.test.cjs`로 실행합니다.

## 아이콘

- 펼친 책: 책장에 담기, 나의 책장·내 공간.
- 리본 책갈피: 멘토링 후 배운 점과 다음 활동을 남긴 개인 기록.

문서 원고는 `docs/`에 모읍니다. 비밀번호, 관리자 키, 회원 데이터와 실제 Firebase 설정은 저장소에 올리지 않습니다.
