// src/pages/LearnToFace.jsx
import React, { useState } from 'react';
import './LearnToFace.css';

const LearnToFace = () => {
  const [input, setInput] = useState('');
  const [avatarTalking, setAvatarTalking] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleAsk = async () => {
    if (!input.trim()) return;

    setAvatarTalking(true);
    setVideoUrl('');

    try {
      const payload = {
        script: {
          type: 'text',
          input: input,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural'
          }
        },
        source_url: 'https://d-id-public-bucket.s3.amazonaws.com/or-ava/01.jpg' // ✅ CHANGE THIS TO YOUR AVATAR URL
      };

      const response = await fetch('http://localhost:4000/api/talks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const data = await response.json();
      const talkId = data.id;

      const poll = setInterval(async () => {
        const statusRes = await fetch(`http://localhost:4000/api/talks/${talkId}`);
        if (!statusRes.ok) {
          const errorText = await statusRes.text();
          console.error('Polling error:', errorText);
          clearInterval(poll);
          setAvatarTalking(false);
          return;
        }

        const statusData = await statusRes.json();
        if (statusData.result_url) {
          setVideoUrl(statusData.result_url);
          setAvatarTalking(false);
          clearInterval(poll);
        }
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      setAvatarTalking(false);
    }
  };

  return (
    <div className="learn-container">
      <h1 className="learn-title">👩‍🏫 Learn to Face Interviews</h1>

      <div className="avatar-video">
        {avatarTalking && <p className="loading-msg">AI Coach is preparing your answer...</p>}
        {videoUrl && <video src={videoUrl} autoPlay controls className="avatar-player" />}
      </div>

      <div className="chat-section">
        <input
          type="text"
          placeholder="Ask a question like: How to introduce myself?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
        />
        <button onClick={handleAsk} className="ask-button">Ask AI Coach</button>
      </div>
    </div>
  );
};

export default LearnToFace;
