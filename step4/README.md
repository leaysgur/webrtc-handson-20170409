# step4

Step2のコードを改変し、WebSocketでSDPの交換（シグナリング）を実現する。

Connectボタンを押すだけでつながる。

- 手動シグナリングではなく、WebSocketサーバーを使ったものに
  - Vanilla ICEからTrickle ICEへ
  - SDPをコピペしなくてもいいので、テキストエリアも不要に

手動のシグナリング時との差異としては、

- Offer / Answerの交換からはじまることに代わりはない
- それだけでなく、ICE candidateを随時送り合うことで、最短経路を見つけようとする
- WebSocketでデータを受けたら即座に返答したりするので、一瞬でつながるように見えてる
