const socket = io("http://localhost:4001");

// get doms
const myVideo = document.getElementById("myVideo");
const muteBtn = document.getElementById("mute");
const turnOffBtn = document.getElementById("turnoff");
const cameralist = document.getElementById("cameraList");
const miclist = document.getElementById("micList");

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

getMedia();
