
// Service xử lý nhận diện khuôn mặt bằng face-api.js
// Sử dụng biến global từ script tag trong index.html
const faceapi = (window as any).faceapi;

// URL chứa các model đã được train sẵn (Sử dụng CDN công khai ổn định)
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let isModelLoaded = false;

export const faceService = {
  // 1. Tải Model AI (Chỉ cần chạy 1 lần khi app khởi động hoặc khi vào màn hình FaceID)
  loadModels: async () => {
    if (isModelLoaded) return true;
    try {
      console.log("⏳ Đang tải AI Models...");
      // Sử dụng TinyFaceDetector cho nhanh và nhẹ trên mobile
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      // await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // Chính xác hơn nhưng nặng hơn
      isModelLoaded = true;
      console.log("✅ AI Models đã tải xong!");
      return true;
    } catch (error) {
      console.error("❌ Lỗi tải AI Models:", error);
      return false;
    }
  },

  // 2. Lấy đặc điểm khuôn mặt (Descriptor) từ Video hoặc Ảnh HTML Element
  getFaceDescriptor: async (input: HTMLVideoElement | HTMLImageElement) => {
    if (!isModelLoaded) await faceService.loadModels();

    // OPTIMIZATION: Reduce inputSize to 224 (MobileNet default) for faster processing
    // scoreThreshold 0.5 ensures we only get reasonably confident faces
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

    const detection = await faceapi.detectSingleFace(input, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }
    return detection.descriptor; // Trả về mảng Float32Array chứa đặc điểm khuôn mặt
  },

  // 3. Chuyển đổi Base64 Image thành HTMLImageElement để AI đọc
  createImageFromBase64: (base64String: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64String;
    });
  },

  // 4. So sánh 2 khuôn mặt (Trả về độ sai lệch - Distance)
  // Distance càng nhỏ -> càng giống nhau. Thường < 0.5 là cùng 1 người.
  compareFaces: async (videoInput: HTMLVideoElement, storedFaceBase64: string): Promise<{ match: boolean, distance: number }> => {
    try {
      // B1: Lấy đặc điểm khuôn mặt từ Camera hiện tại
      const currentDescriptor = await faceService.getFaceDescriptor(videoInput);
      if (!currentDescriptor) {
        throw new Error("Không tìm thấy khuôn mặt trong Camera.");
      }

      // B2: Lấy đặc điểm khuôn mặt từ ảnh đã lưu (Profile)
      const storedImage = await faceService.createImageFromBase64(storedFaceBase64);
      const storedDescriptor = await faceService.getFaceDescriptor(storedImage);
      
      if (!storedDescriptor) {
        throw new Error("Ảnh gốc không hợp lệ hoặc không rõ mặt.");
      }

      // B3: Tính khoảng cách Euclidean
      const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
      
      // Ngưỡng chấp nhận: 0.45 tương đương độ chính xác cao ~90% trong điều kiện thực tế
      const threshold = 0.45; 
      const isMatch = distance < threshold;

      return { match: isMatch, distance };

    } catch (e) {
      console.error("Lỗi so sánh:", e);
      throw e;
    }
  },

  // 5. Tìm người phù hợp nhất trong danh sách (1:N Matching) - OPTIMIZED
  findBestMatch: async (videoInput: HTMLVideoElement, users: any[]): Promise<{ user: any | null, matchPercentage: number }> => {
    try {
        // Detect face from Camera only ONCE
        const currentDescriptor = await faceService.getFaceDescriptor(videoInput);
        if (!currentDescriptor) return { user: null, matchPercentage: 0 };

        let bestMatchUser = null;
        let bestDistance = 1.0; // Khởi tạo khoảng cách lớn nhất (sai số lớn nhất)

        // Lọc ra user có faceData hoặc faceDescriptor
        const usersWithFace = users.filter(u => u.faceData || u.faceDescriptor);

        // Duyệt qua từng user
        for (const user of usersWithFace) {
            try {
                let distance = 1.0;

                // FAST PATH: Use pre-calculated descriptor if available
                if (user.faceDescriptor && Array.isArray(user.faceDescriptor)) {
                    const storedDescriptor = new Float32Array(user.faceDescriptor);
                    distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
                } 
                // SLOW PATH: Fallback to image detection (Legacy users)
                else if (user.faceData) {
                    const storedImage = await faceService.createImageFromBase64(user.faceData);
                    const storedDescriptor = await faceService.getFaceDescriptor(storedImage);
                    if (storedDescriptor) {
                        distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
                    }
                }

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatchUser = user;
                }
            } catch (e) {
                continue;
            }
        }

        // Logic 90%: 
        // 0.45 threshold
        const STRICT_THRESHOLD = 0.45; 
        
        let matchPercentage = Math.round(Math.max(0, (1 - bestDistance)) * 100);

        if (bestDistance < STRICT_THRESHOLD && bestMatchUser) {
            return { user: bestMatchUser, matchPercentage };
        }

        return { user: null, matchPercentage: matchPercentage > 60 ? matchPercentage : 0 }; 

    } catch (e) {
        console.error(e);
        return { user: null, matchPercentage: 0 };
    }
  }
};
