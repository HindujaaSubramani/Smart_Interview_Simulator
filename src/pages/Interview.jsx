import React, { useEffect, useRef } from 'react';
import Avatar from '../components/Avatar';
import useRecorder from '../hooks/useRecorder';
import './Interview.css';

const Interview = () => {
  const videoRef = useRef(null);
  const { recording, startRecording, stopRecording } = useRecorder();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Webcam access error:', err);
      });
  }, []);

  return (
    <div className="interview-container">
      <div className="avatar-area">
        <h2>Your AI Interviewer</h2>
        <Avatar />
      </div>

      <div className="webcam-area">
        <video ref={videoRef} autoPlay muted className="webcam-feed" />
        <p className="note">
          Webcam is on. Your expressions are being recorded for analysis.
        </p>
      </div>

      <div className="voice-controls">
        {!recording ? (
          <button onClick={startRecording}>🎤 Start Speaking</button>
        ) : (
          <button onClick={stopRecording}>🛑 Stop</button>
        )}
        <p className="note">Your voice will be transcribed in real-time using Whisper.</p>
      </div>
    </div>
  );
};

export default Interview;
