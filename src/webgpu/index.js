if (!navigator.gpu) {
  throw new Error("WebGPU not supported on this browser.");
}

// Get Device
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error("No appropriate GPUAdapter found.");
}
const device = await adapter.requestDevice();

// Context와 기기 연결
const canvasFormat = navigator.gpu.getPreferredCanvasFormat(); // 텍스쳐(WebGPU가 이미지 데이터를 저장하는 데 사용하는 객체)의 형식
const canvas = document.querySelector("canvas"); // Get Canvas El
const context = canvas.getContext("webgpu"); // GPUCanvasContext 요청
context.configure({
  device: device,
  format: canvasFormat,
});

// Clear Canvas
const view = context.getCurrentTexture().createView(); // 캔버스 컨텍스트에서 텍스처를 가져옴
const encoder = device.createCommandEncoder(); // 기기에서 GPU 명령어를 기록하기 위한 인터페이스를 제공하는 인코더
const clearColor = { r: 0, g: 0.3, b: 0, a: 1 };
const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view,
      loadOp: "clear", // 렌더 패스가 시작될 때 텍스처를 지움
      clearValue: clearColor, // clear 작업을 실행할 때 어떤 색상을 사용할지
      storeOp: "store", // 렌더 패스가 완료되면 렌더 패스 중에 그리는 결과가 텍스처에 저장
    },
  ],
});

pass.end(); // 렌더 패스 종료
device.queue.submit([encoder.finish()]); // 명령어를 기기에 제출
