import { useState, useRef } from 'react';

const useRecorder = (onTranscriptReady) => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('🔊 Audio Blob:', audioBlob);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
          // Transcribe audio
          const response = await fetch('http://localhost:5001/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Transcription API error: ${response.statusText}`);
          }

          const data = await response.json();
          console.log('✅ Transcription:', data.text);

          if (!data.text || data.text.trim() === '') {
            console.warn('⚠️ Empty transcription. Skipping LLM call.');
            onTranscriptReady('No speech detected', 'Please try speaking again.');
            return;
          }

          // Call LLM for response
          const llmResponse = await fetch('http://localhost:4000/api/llm/interview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userText: data.text }),
          });

          if (!llmResponse.ok) {
            throw new Error(`LLM API error: ${llmResponse.statusText}`);
          }

          const llmData = await llmResponse.json();
          console.log('🤖 LLM Response:', llmData.response);

          onTranscriptReady(data.text, llmData.response);
        } catch (err) {
          console.error('❌ Error during transcription or LLM call:', err);
          alert('❌ Transcription or LLM request failed. Please try again.');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('⚠️ getUserMedia error:', err);
      alert('⚠️ Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return {
    recording,
    startRecording,
    stopRecording,
  };
};

export default useRecorder;
