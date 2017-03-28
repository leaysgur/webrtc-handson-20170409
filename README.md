# webrtc-handson-20170409

## About
- https://github.com/yusuke84/webrtc-handson-2016 と、やりたいことは同じ
- ただし、コードの内容が違ったり、シンタックスが違ったりする
  - 目的のために必要なことしか記述しない
  - ES2015の新しいシンタックス
  - 最新のブラウザの実装
    - 'srcObject'
    - `webkitRTCPeerConnection` -> `RTCPeerConnection`

## Purpose
- step1: `getUserMedia()`を使ってローカルのカメラのストリームを得る
- step2: Vanilla ICE方式でP2P通信する
- step3: step4でTrickle ICE方式で通信するためのWebSocketサーバーを作る
- step4: step3で用意したサーバーを使って、Trickle ICE方式でP2P通信する

## Note
- `onnegotiationneeded`がFirefoxで発火しない
- `onaddstream`はFirefoxでdepricated（というかChromeの実装が追いついてない）

