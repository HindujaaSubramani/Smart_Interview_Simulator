export async function playVoiceFromText(text) {
  if (!text || text.trim() === "") {
    console.warn("⚠️ Empty text received in playVoiceFromText");
    return;
  }

  try {
    const response = await fetch('http://localhost:5002/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TTS audio: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    // Play audio and revoke URL after playback ends to free memory
    await audio.play();

    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });

    // Also revoke if there's an error or playback is interrupted
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(audioUrl);
    });
  } catch (error) {
    console.error('Error playing voice from text:', error);
  }
}
