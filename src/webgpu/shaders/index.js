// 쉐이더 파일들을 모듈로 관리
export async function loadShaders() {
  const [cellShader, simulationShader] = await Promise.all([
    fetch("/src/webgpu/shaders/cell.wgsl").then((res) => res.text()),
    fetch("/src/webgpu/shaders/simulation.wgsl").then((res) => res.text()),
  ]);

  return {
    cellShader,
    simulationShader,
  };
}
