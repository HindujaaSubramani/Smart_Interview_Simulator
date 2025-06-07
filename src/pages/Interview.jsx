import React, { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar';
import useRecorder from '../hooks/useRecorder';
import { playVoiceFromText } from '../utils/playVoice';
import './Interview.css';

const Interview = () => {
  const videoRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscriptReady = async (userText, llmResponse) => {
    setTranscript(userText);
    setAiReply(llmResponse);
    setIsProcessing(false);

    if (!llmResponse || llmResponse.trim() === '') {
      console.warn('⚠️ Empty LLM response. Skipping voice playback.');
      return;
    }

    try {
      await playVoiceFromText(llmResponse);
    } catch (error) {
      console.error('Voice playback error:', error);
    }
  };

  const { recording, startRecording, stopRecording } = useRecorder((userText, llmResponse) => {
    setIsProcessing(true);
    handleTranscriptReady(userText, llmResponse);
  });

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
    <div className="interview-container" role="main" aria-label="AI Interview Simulator">
      <div className="avatar-area">
        <h2>Your AI Interviewer</h2>
        <Avatar text={aiReply} />
      </div>

      <div className="webcam-area">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="webcam-feed"
          aria-label="Webcam video feed"
        />
        <p className="note">
          Webcam is on. Your expressions are being recorded for analysis.
        </p>
      </div>

      <div className="voice-controls">
        {!recording ? (
          <button onClick={startRecording} disabled={isProcessing} aria-live="polite">
            🎤 Start Speaking
          </button>
        ) : (
          <button onClick={stopRecording} aria-live="polite">
            🛑 Stop
          </button>
        )}
        {isProcessing && <p className="processing">⏳ Processing your response...</p>}
        <p className="note">
          Transcript: <strong>{transcript || '...'}</strong>
        </p>
        <p className="note">
          AI Reply: <strong>{aiReply || '...'}</strong>
        </p>
      </div>
    </div>
  );
};

export default Interview;
