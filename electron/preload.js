// Electron preload 脚本。当前前端不需要 Node 桥接（contextIsolation 开启、nodeIntegration 关闭），
// 此文件保留为最小占位，供未来需要暴露安全 API 时扩展。
// 本文件在渲染进程加载前执行，拥有受限 Node 访问权限。