let peerConnection = null;
let ws = null;

window.startVideo = () => {
  const localVideo = document.getElementById('local_video');

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
    .then(stream => {
      localVideo.srcObject = stream;

      peerConnection = _prepareNewConnection(stream);
      _initWs();
    })
    .catch(console.error);
};

window.connect = () => {
  if (peerConnection === null) {
    console.warn('peerConnection is not exist.');
    return;
  }

  console.log('make Offer');
  peerConnection.createOffer()
    .then(sessionDesc => peerConnection.setLocalDescription(sessionDesc))
    .then(() => {
      console.log('setLocalDescription() succsess in promise');
      _sendSdp(peerConnection.localDescription);
    })
    .catch(console.error);
};

window.hangUp = () => {
  if (peerConnection === null) {
    console.warn('peer connection does not exist.');
    return;
  }

  if (peerConnection.iceConnectionState !== 'closed'){
    peerConnection.close();
    peerConnection = null;
    ws.send(JSON.stringify({ type: 'close' }));
    console.log('peerConnection is closed.');
  }
};

function _prepareNewConnection(localStream) {
  const remoteVideo = document.getElementById('remote_video');

  // RTCPeerConnectionを初期化する
  const peer = new RTCPeerConnection({
    iceServers:[ { urls: 'stun:stun.skyway.io:3478' } ],
  });

  peer.onaddstream = ev => {
    console.log('-- peer.onaddstream()');
    remoteVideo.srcObject = ev.stream;
  };

  // ICE Candidateを収集したときのイベント
  peer.onicecandidate = ev => {
    if (ev.candidate) {
      const message = JSON.stringify({ type: 'candidate', ice: ev.candidate });
      console.log('sending candidate=' + message);
      ws.send(message);
    }
  };

  peer.oniceconnectionstatechange = () => {
    // ICEのステートが切断状態または異常状態になったら切断処理を実行する
    if (peer.iceConnectionState === 'failed') {
      window.hangUp();
    }
  };

  // ローカルのストリームを利用できるように準備する
  console.log('Adding local stream...');
  peer.addStream(localStream);

  return peer;
}

function _sendSdp(sessionDescription) {
   const message = JSON.stringify(sessionDescription);
   console.log('sending SDP=' + sessionDescription);
   ws.send(message);
}

function _initWs() {
  ws = new WebSocket('ws://localhost:3001/');

  ws.onopen = () => console.log('ws open()');
  ws.onerror = err => console.error(err);
  ws.onmessage = ev => {
    const message = JSON.parse(ev.data);
    console.log('ws onmessage() data:', message);

    if (message.type === 'offer') {
      const offer = new RTCSessionDescription(message);
      _setOffer(offer);
    }
    else if (message.type === 'answer') {
      const answer = new RTCSessionDescription(message);
      _setAnswer(answer);
    }
    else if (message.type === 'candidate') {
      const candidate = new RTCIceCandidate(message.ice);
      peerConnection.addIceCandidate(candidate)
        .catch(console.error);
    }
    else if (message.type === 'close') {
      window.hangUp();
    }

    function _setAnswer(sessionDescription) {
      peerConnection.setRemoteDescription(sessionDescription)
        .then(() => {
          console.log('setRemoteDescription(answer) succsess in promise');
        })
        .catch(console.error);
    }

    function _setOffer(sessionDescription) {
      peerConnection.setRemoteDescription(sessionDescription)
        .then(() => {
          return peerConnection.createAnswer()
            .then(sessionDescription => {
              console.log('createAnswer() succsess in promise');
              peerConnection.setLocalDescription(sessionDescription);
            })
            .then(() => {
              console.log('setLocalDescription() succsess in promise');
              _sendSdp(peerConnection.localDescription);
            });
        })
        .catch(console.error);
    }
  };
}
