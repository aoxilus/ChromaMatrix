/**
 * ChromaMatrix - Webcam Stream Controller
 * Manages video device stream and real-time frame extraction for optical decoding
 */

export class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.isActive = false;
  }

  async startCamera(constraints = { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } }) {
    try {
      if (this.stream) {
        this.stopCamera();
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.isActive = true;
      return true;
    } catch (err) {
      console.error('Failed to start camera:', err);
      throw err;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.isActive = false;
  }

  captureFrame(targetWidth = 800) {
    if (!this.isActive || !this.video.videoWidth) {
      return null;
    }

    const vWidth = this.video.videoWidth;
    const vHeight = this.video.videoHeight;
    const scale = targetWidth / vWidth;
    const width = Math.round(vWidth * scale);
    const height = Math.round(vHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    return imgData;
  }
}
