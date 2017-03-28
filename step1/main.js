window.startVideo = () => {
  const localVideo = document.getElementById('local_video');

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
    .then(stream => {
      localVideo.srcObject = stream;
    })
    .catch(console.error);
};
