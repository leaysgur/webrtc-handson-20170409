window.startVideo = () => {
  const localVideo = document.getElementById('local_video');

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
    .then(stream => {
      playVideo(localVideo, stream);
    })
    .catch(console.error);


  function playVideo(el, stream) {
    el.srcObject = stream;
  }
};
