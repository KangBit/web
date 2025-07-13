// WebGPU 지원 여부 확인
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

// 사각형을 이루는 두 삼각형의 꼭짓점 정의 (TypeArray)
const vertices = new Float32Array([
  // Triangle 1
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,
  // Triangle 2
  -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
]);

// 꼭짓점 버퍼 생성
const vertexBuffer = device.createBuffer({
  label: "Cell vertices",
  size: vertices.byteLength, // 버퍼의 크기
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, // 버퍼의 용도
});

// 꼭짓점 버퍼에 데이터 쓰기
device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

// 꼭짓점 버퍼 레이아웃 정의
const vertexBufferLayout = {
  arrayStride: 8, // 다음 꼭짓점을 시작하기 전에 메모리에서 몇 바이트를 건너뛰어야 하는지 (2개의 float32 값)
  attributes: [
    {
      format: "float32x2", // 각 꼭짓점의 형식
      offset: 0, // 각 꼭짓점의 오프셋
      shaderLocation: 0, // 꼭짓점 쉐이더의 위치
    },
  ],
};

// 쉐이더 코드 작성 ( WGSL )
const shaderCode = `
        @group(0) @binding(0) var<uniform> grid: vec2f;

        @vertex
        fn vertexMain(@location(0) pos: vec2f, @builtin(instance_index) instance: u32) 
        -> @builtin(position) vec4f
        {
          let i = f32(instance); // 인스턴스 인덱스를 실수로 변환
          let cell = vec2f(i % grid.x, floor(i / grid.x)); // 인스턴스 인덱스를 그리드 크기에 따라 조정
          let cellOffset = cell / grid * 2; // 인스턴스 인덱스를 그리드 크기에 따라 조정
          let gridPos = (pos + 1) / grid - 1 + cellOffset; // 꼭짓점 위치를 그리드 크기에 따라 조정

          return vec4f(gridPos, 0, 1);
        }

        @fragment
        fn fragmentMain() -> @location(0) vec4f {
          return vec4f(1, 0, 0, 1);
        }
      `;

// 쉐이더 모듈 생성
const cellShaderModule = device.createShaderModule({
  label: "Cell shader",
  code: shaderCode,
});

// 렌더 파이프라인 생성
const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: "auto",
  vertex: {
    module: cellShaderModule,
    entryPoint: "vertexMain", // 모든 꼭짓점 셰이더에 대해 호출되는 함수 이름
    buffers: [vertexBufferLayout],
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fragmentMain", // 모든 프래그먼트 셰이더에 대해 호출되는 함수 이름
    targets: [
      {
        format: canvasFormat,
      },
    ],
  },
});

// 그리드 크기를 저장하는 유니폼 버퍼 생성
const GRID_SIZE = 18; // 그리드 크기
const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
const uniformBuffer = device.createBuffer({
  label: "Grid Uniforms",
  size: uniformArray.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

// 바인드 그룹 생성
const bindGroup = device.createBindGroup({
  label: "Cell renderer bind group",
  layout: cellPipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: { buffer: uniformBuffer },
    },
  ],
});

// 그리기 작업 시작
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

pass.setPipeline(cellPipeline); // 렌더 파이프라인 설정
pass.setVertexBuffer(0, vertexBuffer); // 꼭짓점 버퍼 설정
pass.setBindGroup(0, bindGroup); // 바인드 그룹 설정
pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE); // 6 vertices (2개의 꼭짓점)

pass.end(); // 렌더 패스 종료
device.queue.submit([encoder.finish()]); // 명령어를 기기에 제출
