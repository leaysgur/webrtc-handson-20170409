# webrtc-handson-20170409

## About
- https://github.com/yusuke84/webrtc-handson-2016 と、やりたいことは同じ
- ただし、コードの内容が違ったり、シンタックスが違ったりする
  - 目的のために必要なことしか記述しない
  - ES2015の新しいシンタックス
  - 最新のブラウザの実装で
    - `srcObject`だけを使う
    - `webkitRTCPeerConnection` -> `RTCPeerConnection`でOK
- ChromeとFirefoxで動く

## Purpose
- step1: `getUserMedia()`を使ってローカルのカメラのストリームを得る
- step2: Vanilla ICE方式でP2P通信する
- step3: step4でTrickle ICE方式で通信するためのWebSocketサーバーを作る
- step4: step3で用意したサーバーを使って、Trickle ICE方式でP2P通信する

## Note
- `negotiationneeded`イベントはFirefoxで発火しない
- `addstream`イベントはFirefoxでdepricated（というかChromeの実装が古い）

