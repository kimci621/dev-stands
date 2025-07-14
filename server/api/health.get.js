// API route для Vercel/Nuxt - GET /api/health

export default defineEventHandler(async (event) => {
  return {
    status: "OK",
    timestamp: Date.now(),
    uptime: process.uptime(),
    message: "API сервер работает",
  };
});
