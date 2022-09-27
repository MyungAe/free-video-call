const socket = io("http://localhost:4001");

// get doms
const myVideo = document.getElementById("myVideo");
const muteBtn = document.getElementById("mute");
const turnOffBtn = document.getElementById("turnoff");
const cameralist = document.getElementById("cameraList");
const miclist = document.getElementById("micList");

const rooms = document.getElementById("rooms");
const setting = document.getElementById("setting");

setting.hidden = true;

// rooms input events
let roomName;

const roomForm = rooms.querySelector("form");
roomForm.addEventListener("submit", handleSubmitRoom);

async function handleSubmitRoom(event) {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  await initCall();
  roomName = input.value;
  socket.emit("join_room", roomName);
  input.value = "";
}

async function initCall() {
  rooms.hidden = true;
  setting.hidden = false;
  await getMedia();
  makeConnection();
}

// video and audio button events
let mute = false;
let turnOff = false;

muteBtn.addEventListener("click", handleMuteClick);
turnOffBtn.addEventListener("click", handleTurnOffClick);

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!mute) {
    muteBtn.innerText = "Audio Unmute";
    mute = true;
  } else {
    muteBtn.innerText = "Audio Mute";
    mute = false;
  }
}
function handleTurnOffClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!turnOff) {
    turnOffBtn.innerText = "Video Turn On";
    turnOff = true;
  } else {
    turnOffBtn.innerText = "Video Turn Off";
    turnOff = false;
  }
}

// get user camera and mic lists
function getDeviceList(devices) {
  getCameraList(devices);
  getMicList(devices);
}

function getCameraList(devices) {
  const cameras = devices.filter((device) => device.kind === "videoinput");
  const currnetCamera = myStream.getVideoTracks()[0];
  cameras.forEach((camera) => {
    const option = document.createElement("option");
    option.value = camera.deviceId;
    option.innerText = camera.label;
    if (currnetCamera.label === camera.label) {
      option.selected = true;
    }
    cameralist.appendChild(option);
  });
}

function getMicList(devices) {
  const mics = devices.filter((device) => device.kind === "audioinput");
  const currentMic = myStream.getAudioTracks()[0];
  mics.forEach((mic) => {
    const option = document.createElement("option");
    option.value = mic.deviceId;
    option.innerText = mic.label;
    if (currentMic.label === mic.label) {
      option.selected = true;
    }
    miclist.appendChild(option);
  });
}

cameralist.addEventListener("input", handleCameraChange);
miclist.addEventListener("input", handleMicChange);

async function handleCameraChange() {
  await getMedia(cameralist.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

async function handleMicChange() {
  await getMedia(miclist.value);
}

// get user stream
let myStream;

async function getMedia(deviceID) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices
    .filter((device) => device.kind === "videoinput")
    .map((device) => device.deviceId);
  const mics = devices
    .filter((device) => device.kind === "audioinput")
    .map((device) => device.deviceId);
  const constrains = {
    audio: mics.includes(deviceID) ? { deviceId: { exact: deviceID } } : true,
    video: cameras.includes(deviceID)
      ? { deviceId: { exact: deviceID } }
      : { facingMode: "user" },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(constrains);
    myVideo.srcObject = myStream;
    if (!deviceID) getDeviceList(devices);
    if (mute)
      myStream.getAudioTracks().forEach((track) => (track.enabled = false));
  } catch (error) {
    console.error(error);
  }
}

// sockets
let myDataChannel;
let peerManagementObject = {};

// peer A
socket.on("welcome", async (sid) => {
  // myDataChannel = myPeerConnection.createDataChannel("chat");
  // myDataChannel.addEventListener("message", console.log);
  // console.log("made data channel");
  const newConnection = makeConnection(sid);
  const offer = await newConnection.createOffer();
  newConnection.setLocalDescription(offer);
  console.log("send the offer");
  socket.emit("offer", offer, sid);
});

// peer B
socket.on("offer", async (offer, sid) => {
  // myPeerConnection.addEventListener("datachannel", (event) => {
  //   myDataChannel = event.channel;
  //   myDataChannel.addEventListener("message", console.log);
  // });
  const receiveConnection = makeConnection(sid);
  await receiveConnection.setRemoteDescription(offer);
  console.log("received the offer");
  const answer = await receiveConnection.createAnswer();
  receiveConnection.setLocalDescription(answer);
  socket.emit("answer", answer, sid);
  console.log("send the answer");
});

// peer A
socket.on("answer", async (answer, sid) => {
  console.log("received the answer");
  await peerManagementObject[sid].setRemoteDescription(answer);
});

// exec all peers
socket.on("ice", async (ice, sid) => {
  console.log("received ice candidate");
  await peerManagementObject[sid].addIceCandidate(ice);
});

// RTC
function makeConnection(sid) {
  const myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", (data) =>
    handleIce(data, sid)
  );
  myPeerConnection.addEventListener("addstream", (data) =>
    handleAddStream(data)
  );
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));

  peerManagementObject[sid] = myPeerConnection;

  return myPeerConnection;
}

function handleIce(data, sid) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, sid);
}

function handleAddStream(data) {
  console.log("add peer stream in video");
  const video = document.createElement("video");
  video.srcObject = data.stream;
  video.autoplay = true;
  video.playsinline = true;
  video.width = 600;
  video.height = 500;
  const videoList = document.querySelector("#videos");
  videoList.appendChild(video);
}
