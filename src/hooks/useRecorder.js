import { useState, useRef } from 'react';

const useRecorder = () => {
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
        // Combine chunks into a Blob and log it
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('🔊 Audio Blob:', audioBlob);

        // Optional: Download the Blob for manual playback
        // const url = URL.createObjectURL(audioBlob);
        // const a = document.createElement('a');
        // a.style.display = 'none';
        // a.href = url;
        // a.download = 'recording.wav';
        // document.body.appendChild(a);
        // a.click();
        // URL.revokeObjectURL(url);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
          const response = await fetch('http://localhost:5001/transcribe', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          console.log('✅ Server Response:', data);
          alert(`🗣️ Transcribed: "${data.text}"`);
        } catch (err) {
          console.error('❌ Fetch error:', err);
          alert('❌ Transcription failed');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('⚠️ getUserMedia error:', err);
      alert('⚠️ Unable to access microphone');
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
