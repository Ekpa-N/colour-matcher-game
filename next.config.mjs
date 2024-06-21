/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    env: {
        socketApi: "http://192.168.0.101:3002",
        homeApi: "http://192.168.0.101:3000",
        api: "http://192.168.0.102",
        apiToo: "http://192.168.25.244",
        newGame: "https://creategame-djhwq4ivna-uc.a.run.app",
        play: "https://playerstatus-djhwq4ivna-uc.a.run.app"
    },
    images: { 
        unoptimized: true 
    }
};

export default nextConfig;
