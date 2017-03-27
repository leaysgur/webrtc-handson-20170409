let localStream = null;
let peerConnection = null;

window.startVideo = () => {
  const localVideo = document.getElementById('local_video');

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
    .then(stream => {
      localVideo.srcObject = stream;
      localStream = stream;
    })
    .catch(console.error);
};

window.connect = () => {
  if (localStream === null) {
    console.warn('local stream not exist.');
    return;
  }
  if (peerConnection) {
    console.warn('peer already exist.');
    return;
  }

  console.log('make Offer');
  peerConnection = _prepareNewConnection();
  peerConnection.onnegotiationneeded = () => {
    peerConnection.createOffer()
      .then(sessionDescription => {
        console.log('createOffer() succsess in promise');
        peerConnection.setLocalDescription(sessionDescription);
      })
      .then(() => {
        console.log('setLocalDescription() succsess in promise');
      })
      .catch(console.error);
  };

};

window.onSdpText = () => {
  const textToReceiveSdp = document.getElementById('text_for_receive_sdp');
  const text = textToReceiveSdp.value;

  if (peerConnection) {
    // Offerした側が相手からのAnswerをセットする場合
    console.log('Received answer text...');
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: text,
    });
    setAnswer(answer);
  }
  else {
    if (localStream === null) {
      console.warn('local stream not exist.');
      return;
    }

    // Offerを受けた側が相手からのOfferをセットする場合
    console.log('Received offer text...');
    const offer = new RTCSessionDescription({
      type: 'offer',
      sdp: text,
    });
    setOffer(offer);
  }

  textToReceiveSdp.value = '';


  function setAnswer(sessionDescription) {
    peerConnection.setRemoteDescription(sessionDescription)
      .then(() => {
        console.log('setRemoteDescription(answer) succsess in promise');
      })
      .catch(console.error);
  }

  function setOffer(sessionDescription) {
    peerConnection = _prepareNewConnection();
    peerConnection.onnegotiationneeded = () => {
      peerConnection.setRemoteDescription(sessionDescription)
        .then(function() {
          console.log('setRemoteDescription(offer) succsess in promise');
          _makeAnswer();
        })
        .catch(console.error);
    };
  }

  function _makeAnswer() {
    console.log('sending Answer. Creating remote session description...' );
    peerConnection.createAnswer()
      .then(sessionDescription => {
        console.log('createAnswer() succsess in promise');
        peerConnection.setLocalDescription(sessionDescription);
      })
      .then(() => {
        console.log('setLocalDescription() succsess in promise');
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

function _prepareNewConnection() {
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
      console.log(ev.candidate);
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


  function __sendSdp(sessionDescription) {
    const textForSendSdp = document.getElementById('text_for_send_sdp');
    console.log('---sending sdp ---');
    textForSendSdp.value = sessionDescription.sdp;
    textForSendSdp.focus();
    textForSendSdp.select();
  }
}
