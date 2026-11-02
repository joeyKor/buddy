// ==========================================================
// FIREBASE CONFIGURATION (버디버디 7.0 실시간 쪽지 연동 설정)
// ==========================================================
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyForRealtimeDB",
  databaseURL: "https://sedu-flutter-0001-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sedu-flutter-0001"
};

if (typeof window !== "undefined") {
  window.DEFAULT_FIREBASE_CONFIG = DEFAULT_FIREBASE_CONFIG;
}

if (typeof exports !== "undefined") {
  exports.DEFAULT_FIREBASE_CONFIG = DEFAULT_FIREBASE_CONFIG;
}
