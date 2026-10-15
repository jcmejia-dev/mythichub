import type { NextConfig } from 'next';
const nextConfig:NextConfig={async headers(){return [{source:'/api/:path*',headers:[{key:'Access-Control-Allow-Origin',value:process.env.EXPO_WEB_ORIGIN??'http://localhost:8081'},{key:'Access-Control-Allow-Credentials',value:'true'},{key:'Access-Control-Expose-Headers',value:'set-auth-token'},{key:'Access-Control-Allow-Headers',value:'Content-Type, Authorization'},{key:'Access-Control-Allow-Methods',value:'GET, POST, PUT, OPTIONS'}]}]}};
export default nextConfig;
