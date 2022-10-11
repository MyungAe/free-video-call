# custom video call

## todos

- [x] mute 후 mic switching 뮤트 유지 안되는 현상
- [x] 카메라 및 마이크 스위칭 함수 구조 리팩토링 (getMedia에서 list 접근 가능하도록)
- [ ] 반복되는 코드 함수 이용해 리팩토링 : 리팩토링 시 정상 작동 X, 추후 해결책 찾아서 리팩토링
- [ ] 마이크 변경 시 자동으로 비디오가 켜지는 현상
- [ ] stun 서버 직접 만들기
- [ ] localtunnel와 핸드폰을 이용했을 때 js 적용 안되는 현상 해결 >> localtunnel 말고 핫스팟 사용, ip로 접근해 테스트할 예정 >> webrtc는 보안상 localhost, https에서만 작동
- [x] 1:1 구조를 N:N 구조로 변경
- [ ] 서버가 룸, 인원수, 유저 sid를 기억하고 있도록 수정하고, disconnecting한 유저 발생 시 클라이언트에 반영하도록 로직 수정(클라이언트가 sid값을 갖고 있어야 함)

## tests

- [ ] 카메라 및 마이크 변경이 정상 작동되는가?
- [ ] 카메라를 끄고 변경 시 화면 꺼짐이 유지되는가?

## conclusions

- [ ] mesh 구조 단점을 상쇄할 방법 고민하기 (SFC, upload 1)
