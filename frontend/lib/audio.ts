export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];

    async start(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
    }

    stop(): Promise<Blob> {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) return resolve(new Blob([]));

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });
    }
}

export const playAudio = async (audioBlob: Blob): Promise<void> => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        return new Promise((resolve) => {
            source.onended = () => {
                audioContext.close();
                resolve();
            };
            source.start(0);
        });
    } catch (err) {
        console.error("Audio decoding failed:", err);
        audioContext.close();
        throw err;
    }
};
