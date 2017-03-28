let peerConnection = null;

window.startVideo = () => {
  const localVideo = document.getElementById('local_video');

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
    .then(stream => {
      localVideo.srcObject = stream;
      peerConnection = _prepareNewConnection(stream);
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
    .catch(console.error);
};

window.onSdpText = () => {
  if (peerConnection === null) {
    console.warn('peer connection does not exist.');
    return;
  }

  const textToReceiveSdp = document.getElementById('text_for_receive_sdp');
  const text = textToReceiveSdp.value;

  const isAnswerSide = peerConnection.signalingState === 'stable';

  if (isAnswerSide) {
    // Offerを受けた側が相手からのOfferをセットする場合
    console.log('Received offer text...');
    setOffer(text);
  }
  else {
    // Offerした側が相手からのAnswerをセットする場合
    console.log('Received answer text...');
    setAnswer(text);
  }

  textToReceiveSdp.value = '';


  function setAnswer(sdp) {
    const sessionDesc = new RTCSessionDescription({
      type: 'answer',
      sdp: sdp,
    });
    peerConnection.setRemoteDescription(sessionDesc)
      .catch(console.error);
  }

  function setOffer(sdp) {
    const sessionDesc = new RTCSessionDescription({
      type: 'offer',
      sdp: sdp,
    });
    peerConnection.setRemoteDescription(sessionDesc)
      .then(() => {
        return peerConnection.createAnswer()
          .then(sessionDesc => {
            console.log('createAnswer() succsess in promise');
            return peerConnection.setLocalDescription(sessionDesc);
          });
      })
      .catch(console.error);
  }
};

window.hangUp = () => {
  if (peerConnection === null) {
    console.warn('peer connection does not exist.');
    return;
  }

  if (peerConnection.iceConnectionState !== 'closed'){
    peerConnection.close();
    peerConnection = null;
    console.log('peerConnection is closed.');
  }
};

function _prepareNewConnection(localStream) {
  const remoteVideo = document.getElementById('remote_video');

  // RTCPeerConnectionを初期化する
  const peer = new RTCPeerConnection({
    iceServers:[ { urls: 'stun:stun.skyway.io:3478' } ],
  });

  if ('ontrack' in peer) {
    peer.ontrack = ev => {
      console.log('-- peer.ontrack()');
      remoteVideo.srcObject = ev.streams[0];
    };
  } else {
    peer.onaddstream = ev => {
      console.log('-- peer.onaddstream()');
      remoteVideo.srcObject = ev.stream;
    };
  }

  // ICE Candidateを収集したときのイベント
  peer.onicecandidate = ev => {
    if (ev.candidate) {
      console.log('skip candidate', ev.candidate);
      return;
    }

    console.log('empty ice event');
    __sendSdp(peer.localDescription);
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


  function __sendSdp(sessionDesc) {
    const textForSendSdp = document.getElementById('text_for_send_sdp');
    console.log('---sending sdp ---');
    textForSendSdp.value = sessionDesc.sdp;
    textForSendSdp.focus();
    textForSendSdp.select();
  }
}
