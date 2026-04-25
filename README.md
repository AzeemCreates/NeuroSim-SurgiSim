🧠 SurgiSim (NeuroSim-Web3)
An interactive, 3D medical education platform powered by AI, real-time voice streaming, and Solana Web3 certification.

SurgiSim transforms medical learning by allowing users to interact with a 3D brain model, perform simulated "surgical" exploration, and receive real-time, voice-streamed guidance from an AI "Chief Neurosurgeon." Upon successfully completing their training modules, users are rewarded with an on-chain Certificate of Completion minted on the Solana blockchain.

🚀 Live Demo & Pitch
Video Demo: [Insert Link to your YouTube/Loom video here]

Live Application: [Insert Link to deployed site, if applicable]

Hackathon Track: [Insert the name of the bounty or track you are targeting]

✨ Key Features
Interactive 3D Brain: Built with React Three Fiber, allowing users to rotate, zoom, and click specific brain lobes/regions to trigger surgical lessons.

AI Chief Neurosurgeon: Powered by Google's Gemini AI and Snowflake RAG context to provide highly accurate, medical-grade educational responses.

Real-Time Voice Streaming: Integrates ElevenLabs API to immediately stream the AI's response as realistic, low-latency audio.

Secure User Authentication: Fully protected routes and frontend UI managed by Auth0.

Web3 Certification: Connects to Phantom Wallet via Solana Wallet Adapter to mint verifiable "Certificates of Completion" on the Solana Devnet.

🛠️ Tech Stack
Frontend:

React 18 + Vite

Three.js & React Three Fiber (@react-three/fiber, @react-three/drei)

Auth0 (@auth0/auth0-react)

Solana Wallet Adapter (@solana/wallet-adapter-react)

TailwindCSS / Anime.js (UI & Animations)

Backend:

Node.js & Express

MongoDB (Mongoose)

Snowflake (Data/RAG Context)

Gemini AI (@google/generative-ai)

ElevenLabs API

Solana Web3 (@solana/web3.js)

⚙️ Local Setup & Installation
1. Clone the Repository
Bash
git clone https://github.com/your-username/NeuroSim-Web3.git
cd NeuroSim-Web3
2. Install Dependencies
You will need to install the Node modules for both the frontend and backend.

Bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
3. Environment Variables
You must create two .env files for this project to run locally.

Backend (backend/.env):

Code snippet
# Database & Cloud
MONGODB_URI="your_mongodb_connection_string"
SNOWFLAKE_ACCOUNT="your_snowflake_account"
SNOWFLAKE_USER="your_snowflake_user"
SNOWFLAKE_PASSWORD="your_snowflake_password"

# AI & Audio
GEMINI_API_KEY="your_gemini_key"
ELEVENLABS_API_KEY="your_elevenlabs_key"

# Authentication (Auth0)
AUTH0_ISSUER_BASE_URL="https://your_domain.us.auth0.com"
AUTH0_AUDIENCE="https://neuro-api"

# Web3 (Solana)
SOLANA_CERTIFICATE_SECRET="your_burner_wallet_private_key"
Frontend (frontend/.env):

Code snippet
# Authentication (Auth0)
VITE_AUTH0_DOMAIN="your_domain.us.auth0.com"
VITE_AUTH0_CLIENT_ID="your_auth0_client_id"
VITE_AUTH0_AUDIENCE="https://neuro-api"
4. Solana Devnet Funding
This project uses the Solana Devnet, meaning no real funds are used. To ensure the backend burner wallet can mint certificates:

Copy the public address of your SOLANA_CERTIFICATE_SECRET wallet.

Go to the Solana Faucet.

Airdrop 1 Test SOL to your wallet address.

5. Run the Application
Start both the frontend and backend development servers.

Bash
# In the backend directory:
npm run dev

# In the frontend directory:
npm run dev
The application will be available at http://localhost:5173.

🎮 How to Use SurgiSim
Login: Click the login button to authenticate via Auth0.

Explore: Use your mouse to rotate and zoom the 3D brain canvas.

Learn: Click on any highlighted brain region (e.g., Frontal Lobe).

Listen: Wait a moment as the AI Chief Neurosurgeon processes the action and streams the audio lesson directly to your browser.

Certify: Once the module is complete, connect your Phantom Wallet (Devnet) and click "Claim Certificate" to mint your on-chain reward!

🚀 Future Roadmap
Implement multiplayer surgery rooms where multiple users can operate on the same 3D model.

Add more complex Web3 rewards (e.g., NFT badges for different surgical specialties).

Expand the AI context to include patient case studies, not just anatomy.
