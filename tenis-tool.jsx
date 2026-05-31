import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
//  TENI'S TOOL — AI Anime & Video Generator
//  Powered by Claude AI + Replicate APIs
//  FEATURES: 5min videos, Project Saving, HD Download
// ═══════════════════════════════════════════════════════════

const STYLE_CONFIG = {
  anime:     { label:"Anime",     icon:"⛩️",  color:"#ff6eb4", substyles:["Shonen Action","Shojo Romance","Isekai Fantasy","Mecha Battle","Slice of Life","Dark Fantasy","Cyberpunk Anime","Studio Ghibli","Horror Anime","Sports Anime","Magical Girl"], hint:"anime art style, vibrant cel-shaded colors, expressive characters, detailed backgrounds" },
  realistic: { label:"Realistic", icon:"🎬",  color:"#38bdf8", substyles:["Cinematic","Documentary","Nature Film","Urban Scene","Action Movie","Portrait","Aerial View","Underwater","Fashion"], hint:"photorealistic, cinematic quality, ultra-detailed, 8K resolution, natural lighting" },
  "2d":      { label:"2D",        icon:"🎨",  color:"#4ade80", substyles:["Classic Cartoon","Hand-drawn","Pixel Art","Comic Book","Watercolor","Chalk Art","Sketch","Flat Design","Retro Cartoon"], hint:"2D animation style, clean lines, flat colors, illustrated, smooth movement" },
  "3d":      { label:"3D",        icon:"💎",  color:"#c084fc", substyles:["CGI Movie","Pixar Style","Low Poly","Photorealistic 3D","Clay Animation","Voxel Art","Stylized 3D","Glass Render"], hint:"3D render, volumetric lighting, ray tracing, detailed textures, depth of field" },
  motion:    { label:"Motion",    icon:"✨",  color:"#fb923c", substyles:["Disney Classic","DreamWorks","Motion Graphics","Lofi Animation","Retro Animation","Abstract Motion","Kinetic Typography","Morphing"], hint:"fluid animation, smooth motion, dynamic movement, flowing transitions" },
};

const BG_ELEMENTS = [
  {id:"birds flying gracefully",e:"🐦",l:"Birds"},
  {id:"aircraft flying through sky",e:"✈️",l:"Planes"},
  {id:"flowing water waves",e:"🌊",l:"Water"},
  {id:"heavy rainfall",e:"🌧️",l:"Rain"},
  {id:"colorful butterflies",e:"🦋",l:"Butterflies"},
  {id:"glowing fireflies insects",e:"🪲",l:"Insects"},
  {id:"vibrant rainbow arc",e:"🌈",l:"Rainbow"},
  {id:"bright shining sun rays",e:"☀️",l:"Sun"},
  {id:"full glowing moon",e:"🌙",l:"Moon"},
  {id:"starry night galaxy sky",e:"🌌",l:"Night Sky"},
  {id:"golden hour daylight",e:"🌤️",l:"Daytime"},
  {id:"tall city buildings skyline",e:"🏙️",l:"Buildings"},
  {id:"highway roads traffic",e:"🛣️",l:"Roads"},
  {id:"exotic wild animals",e:"🦁",l:"Animals"},
  {id:"cherry blossom flower petals",e:"🌸",l:"Flowers"},
  {id:"dramatic mountain peaks",e:"⛰️",l:"Mountains"},
  {id:"lush dense forest trees",e:"🌲",l:"Forest"},
  {id:"dramatic storm clouds",e:"☁️",l:"Clouds"},
  {id:"snowfall winter scene",e:"❄️",l:"Snow"},
  {id:"lightning bolt electrical storm",e:"⚡",l:"Lightning"},
];

const MOODS = [
  {id:"epic and powerful cinematic",l:"⚔️ Epic",c:"#ef4444"},
  {id:"peaceful and serene calm",l:"🌿 Peaceful",c:"#22c55e"},
  {id:"dark atmospheric moody",l:"🌑 Dark",c:"#7c3aed"},
  {id:"romantic soft warm",l:"💕 Romantic",c:"#ec4899"},
  {id:"intense high-energy action",l:"🔥 Action",c:"#f97316"},
  {id:"mysterious foggy ethereal",l:"🔮 Mysterious",c:"#0ea5e9"},
  {id:"cheerful bright colorful joyful",l:"🌟 Cheerful",c:"#eab308"},
  {id:"melancholic nostalgic emotional",l:"💧 Melancholic",c:"#64748b"},
];

const QUICK_PROMPTS = [
  "A samurai warrior in red armor standing on a mountain cliff, cherry blossom petals swirling in the wind at golden sunset",
  "Two anime students running through a neon-lit cyberpunk Tokyo street at night, umbrellas in the rain",
  "A magical girl with silver hair transforming, sparkles and star particles exploding around her in slow motion",
  "An ancient red dragon soaring over a feudal Japanese castle surrounded by storm clouds and lightning",
  "A peaceful anime village by a crystal river, children playing, fireflies glowing at dusk in summer",
];

const REPLICATE_MODELS = {
  anime:     "wavespeedai/wan-2.1-t2v-480p",
  realistic: "wavespeedai/wan-2.1-t2v-480p",
  "2d":      "wavespeedai/wan-2.1-t2v-480p",
  "3d":      "wavespeedai/wan-2.1-t2v-480p",
  motion:    "wavespeedai/wan-2.1-t2v-480p",
};

// ─────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes floatY{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes slideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 8px var(--ac,#ff6eb4)}50%{box-shadow:0 0 24px var(--ac,#ff6eb4),0 0 48px var(--ac,#ff6eb455)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes starTwinkle{0%,100%{opacity:0.3}50%{opacity:1}}

.tt{min-height:100vh;background:radial-gradient(ellipse at 15% 10%,#110824 0%,#060511 40%,#050a06 100%);font-family:'Rajdhani',sans-serif;color:#e0e0ff;overflow-x:hidden;position:relative}

.stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;animation:starTwinkle var(--d,3s) ease-in-out infinite;animation-delay:var(--dl,0s);opacity:0.6}

.content{position:relative;z-index:1;max-width:820px;margin:0 auto;padding:0 14px 120px}

/* HEADER */
.hdr{text-align:center;padding:36px 0 20px;animation:slideIn .7s ease}
.logo{font-family:'Orbitron',monospace;font-size:clamp(30px,8vw,52px);font-weight:900;background:linear-gradient(135deg,#ff6eb4,#c084fc,#60c5ff,#ff6eb4);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 4s ease infinite;letter-spacing:4px}
.tagline{font-size:13px;color:rgba(200,200,255,0.5);margin-top:6px;letter-spacing:2.5px;text-transform:uppercase;font-weight:300}
.badge{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:4px 14px;border-radius:20px;border:1px solid rgba(255,110,180,0.25);font-size:11px;color:rgba(255,110,180,0.7);letter-spacing:1px}
.badge-dot{width:6px;height:6px;background:#ff6eb4;border-radius:50%;animation:blink 1.4s ease-in-out infinite}

/* NAV */
.nav{display:flex;gap:4px;background:rgba(255,255,255,0.03);padding:4px;border-radius:16px;border:1px solid rgba(255,255,255,0.07);margin-bottom:18px}
.nav-btn{flex:1;padding:10px 6px;border:none;border-radius:12px;background:transparent;color:rgba(200,200,255,0.4);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;letter-spacing:.5px;cursor:pointer;transition:all .2s;text-transform:uppercase}
.nav-btn.on{background:rgba(255,110,180,0.12);color:#ff6eb4;border:1px solid rgba(255,110,180,0.25);animation:pulseGlow .4s ease}

/* CARD */
.card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:18px;margin-bottom:14px;animation:slideIn .4s ease;backdrop-filter:blur(12px)}
.card-title{font-family:'Orbitron',monospace;font-size:10.5px;letter-spacing:2px;color:rgba(200,200,255,0.45);text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.card-title::before{content:'';display:block;width:3px;height:14px;border-radius:2px;background:var(--ac,#ff6eb4);flex-shrink:0}

/* STYLE TABS */
.styles{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.styles::-webkit-scrollbar{display:none}
.style-btn{flex-shrink:0;padding:8px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.09);background:transparent;color:rgba(200,200,255,0.5);font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.style-btn.on{border-color:var(--sc);background:rgba(0,0,0,0.3);color:var(--sc);box-shadow:0 0 16px var(--sg,rgba(255,110,180,0.2)),inset 0 0 20px rgba(0,0,0,0.5)}

/* SUBSTYLE */
.substyles{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.sub-btn{padding:5px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:transparent;color:rgba(200,200,255,0.45);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.sub-btn.on{border-color:var(--sc);color:var(--sc);background:rgba(0,0,0,0.4)}

/* BACKGROUND GRID */
.bg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:5px}
.bg-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 3px;border-radius:10px;border:1px solid rgba(255,255,255,0.07);background:transparent;color:rgba(200,200,255,0.45);font-size:10.5px;cursor:pointer;transition:all .15s;font-family:'Rajdhani',sans-serif;font-weight:600}
.bg-btn .e{font-size:18px;line-height:1.2}
.bg-btn.on{border-color:#c084fc;background:rgba(192,132,252,0.1);color:#c084fc}

/* MOODS */
.moods{display:flex;flex-wrap:wrap;gap:6px}
.mood-btn{padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.09);background:transparent;color:rgba(200,200,255,0.45);font-family:'Rajdhani',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s}
.mood-btn.on{border-color:var(--mc);color:var(--mc);background:rgba(0,0,0,0.4)}

/* TEXTAREA */
.textarea{width:100%;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.09);border-radius:14px;color:#e0e0ff;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:400;padding:13px;resize:vertical;min-height:100px;transition:border-color .2s;line-height:1.6}
.textarea:focus{outline:none;border-color:#ff6eb4;box-shadow:0 0 0 2px rgba(255,110,180,0.08)}
.textarea::placeholder{color:rgba(200,200,255,0.25)}

/* ENHANCED BOX */
.enhanced{background:rgba(192,132,252,0.04);border:1px solid rgba(192,132,252,0.18);border-radius:14px;padding:14px;font-size:13px;color:rgba(220,200,255,0.85);line-height:1.65;margin-top:10px;animation:slideIn .3s ease}
.enhanced-lbl{font-size:9.5px;letter-spacing:1.5px;color:#c084fc;text-transform:uppercase;margin-bottom:8px;font-family:'Orbitron',monospace}

/* BUTTONS */
.btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:14px;border:none;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:.5px;cursor:pointer;transition:all .2s;text-transform:uppercase}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none !important}

.btn-enhance{background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.25);color:#c084fc;flex:1}
.btn-enhance:hover:not(:disabled){background:rgba(192,132,252,0.18);box-shadow:0 0 20px rgba(192,132,252,0.25)}

.btn-gen{background:linear-gradient(135deg,#ff6eb4,#c084fc);color:#fff;width:100%;padding:17px;font-size:18px;border-radius:18px;box-shadow:0 4px 24px rgba(255,110,180,0.35);letter-spacing:1.5px}
.btn-gen:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 8px 32px rgba(255,110,180,0.5)}
.btn-gen:active:not(:disabled){transform:translateY(-1px)}

.btn-dl{background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;flex:1}
.btn-dl:hover:not(:disabled){background:rgba(56,189,248,0.18);box-shadow:0 0 20px rgba(56,189,248,0.25)}

.btn-save{background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);color:#4ade80;flex:1}
.btn-save:hover:not(:disabled){background:rgba(34,197,94,0.18);box-shadow:0 0 20px rgba(34,197,94,0.25)}

.btn-again{background:rgba(255,110,180,0.08);border:1px solid rgba(255,110,180,0.25);color:#ff6eb4;flex:1}
.btn-again:hover{background:rgba(255,110,180,0.18)}

.btn-sm{padding:7px 12px;font-size:11.5px;border-radius:10px}

/* SPINNER */
.spin{width:15px;height:15px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;display:inline-block;flex-shrink:0}
.spin-purple{border-color:rgba(192,132,252,0.25);border-top-color:#c084fc}

/* PROGRESS */
.prog-bar{width:100%;height:5px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;margin:10px 0}
.prog-fill{height:100%;background:linear-gradient(90deg,#ff6eb4,#c084fc,#60c5ff);background-size:200% 100%;border-radius:3px;transition:width .6s ease;animation:shimmer 2s linear infinite}
.prog-pct{font-family:'Orbitron',monospace;font-size:10px;color:#c084fc;font-weight:700}
.prog-status{font-size:13px;color:rgba(200,200,255,0.6);margin-top:4px}

/* VIDEO */
.video{width:100%;border-radius:14px;border:1px solid rgba(255,110,180,0.18);background:#000;box-shadow:0 0 40px rgba(255,110,180,0.12)}

/* SLIDER */
.slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);outline:none;margin:8px 0}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#ff6eb4,#c084fc);cursor:pointer;box-shadow:0 0 8px rgba(255,110,180,0.5)}
.dur-labels{display:flex;justify-content:space-between;font-size:10px;color:rgba(200,200,255,0.35);margin-top:-2px}

/* INPUT */
.inp{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;color:#e0e0ff;font-family:'Rajdhani',sans-serif;font-size:14px;padding:10px 14px;transition:border-color .2s}
.inp:focus{outline:none;border-color:#ff6eb4}
.inp::placeholder{color:rgba(200,200,255,0.25)}

/* QUALITY SELECTOR */
.quality-opts{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.quality-btn{padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.09);background:transparent;color:rgba(200,200,255,0.45);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.quality-btn.on{border-color:#38bdf8;color:#38bdf8;background:rgba(56,189,248,0.1)}

/* PROJECTS */
.projects-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:12px}
.project-card{padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.09);background:rgba(255,255,255,0.015);cursor:pointer;transition:all .2s}
.project-card:hover{border-color:#ff6eb4;background:rgba(255,110,180,0.06)}
.project-thumb{width:100%;height:70px;border-radius:7px;object-fit:cover;background:rgba(0,0,0,0.3);margin-bottom:8px;border:1px solid rgba(255,255,255,0.055)}
.project-name{font-size:11px;color:rgba(200,200,255,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.project-date{font-size:9px;color:rgba(200,200,255,0.35);margin-top:3px}
.project-btn{padding:4px 6px;font-size:9px;margin-top:6px;width:100%}

/* QUICK PROMPTS */
.qp-list{display:flex;flex-direction:column;gap:5px}
.qp-btn{padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.055);background:transparent;color:rgba(200,200,255,0.45);font-family:'Rajdhani',sans-serif;font-size:12px;text-align:left;cursor:pointer;transition:all .15s;line-height:1.45}
.qp-btn:hover{border-color:rgba(255,110,180,0.28);color:rgba(220,210,255,0.9);background:rgba(255,110,180,0.04)}

/* ERROR */
.error{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:12px 16px;color:#fca5a5;font-size:13px;margin-bottom:12px;animation:slideIn .3s ease;line-height:1.6}

/* INFO */
.info{background:rgba(56,189,248,0.04);border:1px solid rgba(56,189,248,0.18);border-radius:12px;padding:14px 16px;font-size:12.5px;color:rgba(150,200,255,0.7);line-height:1.75}
.info a{color:#38bdf8;text-decoration:none}

/* SUCCESS */
.success-badge{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#4ade80;font-size:12px;margin-bottom:10px;animation:slideIn .4s ease}

/* HISTORY */
.hist-item{display:flex;gap:10px;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,0.055);background:rgba(255,255,255,0.015);align-items:center}
.hist-vid{width:64px;height:40px;border-radius:7px;object-fit:cover;border:1px solid rgba(255,255,255,0.09);flex-shrink:0}
.hist-info{flex:1;min-width:0}
.hist-prompt{font-size:11.5px;color:rgba(200,200,255,0.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-meta{font-size:10px;color:rgba(200,200,255,0.28);margin-top:2px}

/* RESULT CARD */
.result-card{border:1px solid rgba(255,110,180,0.22);background:rgba(255,110,180,0.03)}
.result-title{color:#ff6eb4 !important}
.result-title::before{background:#ff6eb4 !important}

/* ROW */
.row{display:flex;gap:8px}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,110,180,0.35);border-radius:2px}
`;

// ─────────────────────────────────────────────────────────────
//  STAR FIELD COMPONENT
// ─────────────────────────────────────────────────────────────
const STAR_DATA = Array.from({length:55},(_,i) => ({
  left: `${(i*17+7)%100}%`,
  top:  `${(i*23+11)%100}%`,
  dur:  `${2 + (i%5)}s`,
  dl:   `${-(i%4)}s`,
  size: i%7===0 ? 3 : 2,
}));

const Stars = () => (
  <div className="stars">
    {STAR_DATA.map((s,i) => (
      <div key={i} className="star" style={{left:s.left,top:s.top,"--d":s.dur,"--dl":s.dl,width:s.size,height:s.size}}/>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────
export default function TenisTool() {
  const [tab,       setTab]       = useState("t2v");
  const [apiKey,    setApiKey]    = useState("");
  const [keySaved,  setKeySaved]  = useState(false);
  const [style,     setStyle]     = useState("anime");
  const [substyle,  setSubstyle]  = useState("");
  const [mood,      setMood]      = useState("epic and powerful cinematic");
  const [bgs,       setBgs]       = useState([]);
  const [prompt,    setPrompt]    = useState("");
  const [enhanced,  setEnhanced]  = useState("");
  const [duration,  setDuration]  = useState(30);
  const [quality,   setQuality]   = useState("1080p");
  const [isEnh,     setIsEnh]     = useState(false);
  const [isGen,     setIsGen]     = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [progress,  setProgress]  = useState(0);
  const [videoUrl,  setVideoUrl]  = useState(null);
  const [imgFile,   setImgFile]   = useState(null);
  const [imgPrev,   setImgPrev]   = useState(null);
  const [imgBase64, setImgBase64] = useState(null);
  const [imgMime,   setImgMime]   = useState("image/jpeg");
  const [error,     setError]     = useState("");
  const [history,   setHistory]   = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [projectName, setProjectName] = useState("");
  const fileRef = useRef(null);
  const cfg = STYLE_CONFIG[style];

  // ── Load projects from localStorage ──────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("tenis_projects");
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  // ── Helpers ──────────────────────────────────────────────
  const toggleBg = id => setBgs(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  const handleImg = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setImgMime(f.type || "image/jpeg");
    const r = new FileReader();
    r.onload = ev => {
      setImgPrev(ev.target.result);
      setImgBase64(ev.target.result.split(",")[1]);
    };
    r.readAsDataURL(f);
  };

  const buildPrompt = () => {
    const bgStr = bgs.length ? bgs.slice(0,6).join(", ") : "";
    const sub = substyle ? `${substyle} style,` : "";
    const base = enhanced || prompt;
    return `${cfg.hint}, ${sub} ${mood} mood, ${base}, ${bgStr}, highly detailed, smooth animation, HD quality, TikTok vertical format`.replace(/,\s*,/g,",").trim();
  };

  const downloadVideo = async (url, filename, qual) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${qual}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setError(`Download failed: ${e.message}`);
    }
  };

  const saveProject = async () => {
    if (!videoUrl) {
      setError("No video to save");
      return;
    }
    
    const name = projectName.trim() || `Project_${new Date().toLocaleString()}`;
    
    try {
      // Convert video URL to base64 for storage (only thumbnail for performance)
      const canvas = document.createElement("canvas");
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      
      await new Promise(r => {
        video.onloadedmetadata = () => {
          canvas.width = 140;
          canvas.height = 78;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, 140, 78);
          r();
        };
      });

      const thumbnail = canvas.toDataURL("image/jpeg", 0.6);
      
      const project = {
        id: Date.now(),
        name,
        videoUrl,
        thumbnail,
        prompt: enhanced || prompt,
        style,
        substyle,
        mood,
        duration,
        quality,
        created: new Date().toLocaleString(),
      };

      const updated = [...projects, project];
      setProjects(updated);
      localStorage.setItem("tenis_projects", JSON.stringify(updated));
      setProjectName("");
      setError("");
    } catch (e) {
      setError(`Failed to save project: ${e.message}`);
    }
  };

  const pollPrediction = async (id) => {
    for (let i=0; i<600; i++) { // Increased for 5min videos
      await new Promise(r=>setTimeout(r,3000));
      const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`,{
        headers:{"Authorization":`Bearer ${apiKey}`}
      });
      const data = await res.json();
      const pct = Math.min(20 + (i/600)*72, 92);
      setProgress(pct);
      const msgs = ["🎨 Painting key frames...","✨ Applying anime art style...","🌸 Rendering background details...","⚡ Compositing motion frames...","🎬 Polishing final video...","🔮 Enhancing HD quality...","🌟 Almost ready...","💫 Final render..."];
      setGenStatus(msgs[Math.floor(i/4) % msgs.length]);
      if (data.status === "succeeded") return Array.isArray(data.output) ? data.output[0] : data.output;
      if (data.status === "failed" || data.status === "canceled") throw new Error(data.error || "Generation failed");
    }
    throw new Error("Generation timed out. Please try again.");
  };

  // ── Enhance Prompt (Claude AI) ─────────────────────────────
  const enhancePrompt = async () => {
    const p = prompt.trim();
    if (!p) return;
    setIsEnh(true);
    setEnhanced("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model:"claude-3-5-sonnet-20241022",
          max_tokens:500,
          messages:[{
            role:"user",
            content:`Enhance this video prompt for a ${style} animation with mood "${mood}". Make it more vivid, cinematic, and detailed. Keep it under 150 words:\n\n${p}`,
          }],
        }),
      });
      if (!res.ok) throw new Error("Claude API error");
      const data = await res.json();
      setEnhanced(data.content[0].text);
    } catch (e) {
      setError(`Enhancement failed: ${e.message}`);
    } finally {
      setIsEnh(false);
    }
  };

  // ── Generate Video ──────────────────────────────────────
  const generateVideo = async () => {
    const p = (enhanced || prompt).trim();
    if (!p || !apiKey) {
      setError("Need prompt and API key");
      return;
    }

    setIsGen(true);
    setError("");
    setProgress(0);
    setVideoUrl(null);
    setGenStatus("🚀 Initializing video generation...");

    try {
      const fullPrompt = buildPrompt();
      const durationFrames = Math.floor(duration * 8); // 8 fps base
      
      const res = await fetch("https://api.replicate.com/v1/predictions",{
        method:"POST",
        headers:{
          "Authorization":`Bearer ${apiKey}`,
          "Content-Type":"application/json",
        },
        body: JSON.stringify({
          version: "aa50f26b10fef4e2d77b8f5d33b5ef25b4f1a8f5",
          input:{
            prompt: fullPrompt,
            duration: Math.min(duration, 300), // Cap at 5 min
            height: quality === "4k" ? 2160 : quality === "2k" ? 1440 : 1080,
            width: quality === "4k" ? 3840 : quality === "2k" ? 2560 : 1920,
          },
        }),
      });

      if (!res.ok) throw new Error("Replicate API error");
      const pred = await res.json();
      setProgress(5);
      setGenStatus("⏳ Waiting for generation...");

      const videoUrl = await pollPrediction(pred.id);
      setProgress(100);
      setGenStatus("✅ Video generated!");
      setVideoUrl(videoUrl);
      setHistory(h => [{prompt: p, url: videoUrl, created: new Date().toLocaleString()}, ...h.slice(0,9)]);
    } catch (e) {
      setError(`Generation error: ${e.message}`);
      setProgress(0);
    } finally {
      setIsGen(false);
    }
  };

  return (
    <div className="tt" style={{background: "radial-gradient(ellipse at 15% 10%,#110824 0%,#060511 40%,#050a06 100%)"}}>
      <style>{CSS}</style>
      <Stars />
      <div className="content">
        {/* HEADER */}
        <div className="hdr">
          <div className="logo">✨ TENI'S TOOL ✨</div>
          <p className="tagline">AI Anime & Video Generator with Project Save & HD Download</p>
          <div className="badge">
            <span className="badge-dot"></span>
            Powered by Claude + Replicate
          </div>
        </div>

        {/* NAV TABS */}
        <div className="nav">
          <button className={`nav-btn ${tab==="t2v"?"on":""}`} onClick={()=>setTab("t2v")}>🎬 Text-to-Video</button>
          <button className={`nav-btn ${tab==="projects"?"on":""}`} onClick={()=>setTab("projects")}>💾 My Projects</button>
          <button className={`nav-btn ${tab==="settings"?"on":""}`} onClick={()=>setTab("settings")}>⚙️ Settings</button>
        </div>

        {/* TEXT-TO-VIDEO TAB */}
        {tab === "t2v" && (
          <>
            {/* API KEY */}
            <div className="card">
              <div className="card-title" style={{"--ac":"#38bdf8"}}>🔑 Replicate API Key</div>
              <div className="row">
                <input
                  type="password"
                  className="inp"
                  value={apiKey}
                  onChange={(e)=>setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{flex:1}}
                />
                <button className="btn btn-enhance btn-sm" onClick={()=>setKeySaved(!keySaved)}>
                  {keySaved ? "✓ Saved" : "Save"}
                </button>
              </div>
              <div className="info" style={{marginTop:"10px"}}>
                Get your key at <a href="https://replicate.com/api" target="_blank" rel="noopener noreferrer">replicate.com/api</a>
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && <div className="error">{error}</div>}

            {/* STYLE SELECTION */}
            <div className="card">
              <div className="card-title">🎨 Style</div>
              <div className="styles">
                {Object.entries(STYLE_CONFIG).map(([key,cfg]) => (
                  <button
                    key={key}
                    className={`style-btn ${style===key?"on":""}`}
                    onClick={()=>{setStyle(key);setSubstyle("");}}
                    style={{"--sc":cfg.color,"--sg":`${cfg.color}33`}}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>

              {/* SUBSTYLE */}
              {cfg && cfg.substyles.length > 0 && (
                <div>
                  <div style={{fontSize:"11px",color:"rgba(200,200,255,0.4)",marginTop:"12px",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Sub-Style</div>
                  <div className="substyles">
                    {cfg.substyles.map(sub => (
                      <button
                        key={sub}
                        className={`sub-btn ${substyle===sub?"on":""}`}
                        onClick={()=>setSubstyle(substyle===sub?"":sub)}
                        style={{"--sc":cfg.color}}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MOOD */}
            <div className="card">
              <div className="card-title">🎭 Mood</div>
              <div className="moods">
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    className={`mood-btn ${mood===m.id?"on":""}`}
                    onClick={()=>setMood(m.id)}
                    style={{"--mc":m.c}}
                  >
                    {m.l}
                  </button>
                ))}
              </div>
            </div>

            {/* BACKGROUND ELEMENTS */}
            <div className="card">
              <div className="card-title">🌅 Background Elements</div>
              <div className="bg-grid">
                {BG_ELEMENTS.map(bg => (
                  <button
                    key={bg.id}
                    className={`bg-btn ${bgs.includes(bg.id)?"on":""}`}
                    onClick={()=>toggleBg(bg.id)}
                  >
                    <div className="e">{bg.e}</div>
                    <div>{bg.l}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* DURATION */}
            <div className="card">
              <div className="card-title">⏱️ Duration (seconds)</div>
              <input type="range" className="slider" min="6" max="300" value={duration} onChange={(e)=>setDuration(parseInt(e.target.value))} />
              <div className="dur-labels">
                <span>6s</span>
                <span className="prog-pct">{duration}s ({(duration/60).toFixed(2)} min)</span>
                <span>5:00</span>
              </div>
              <div className="info" style={{marginTop:"10px",fontSize:"11px"}}>
                Extended durations require more processing time. Max 5 minutes (300s).
              </div>
            </div>

            {/* QUALITY */}
            <div className="card">
              <div className="card-title" style={{"--ac":"#38bdf8"}}>📺 Output Quality</div>
              <div className="quality-opts">
                <button className={`quality-btn ${quality==="720p"?"on":""}`} onClick={()=>setQuality("720p")}>720p (SD)</button>
                <button className={`quality-btn ${quality==="1080p"?"on":""}`} onClick={()=>setQuality("1080p")}>1080p (HD)</button>
                <button className={`quality-btn ${quality==="2k"?"on":""}`} onClick={()=>setQuality("2k")}>2K</button>
                <button className={`quality-btn ${quality==="4k"?"on":""}`} onClick={()=>setQuality("4k")}>4K (UHD)</button>
              </div>
            </div>

            {/* PROMPT */}
            <div className="card">
              <div className="card-title">📝 Prompt</div>
              <textarea
                className="textarea"
                value={prompt}
                onChange={(e)=>setPrompt(e.target.value)}
                placeholder="Describe what you want to see in your video..."
              />
              <div className="row" style={{marginTop:"10px"}}>
                <button className="btn btn-enhance" onClick={enhancePrompt} disabled={isEnh || !prompt.trim()}>
                  {isEnh ? <span className="spin"></span> : "✨"} {isEnh ? "Enhancing..." : "Enhance"}
                </button>
              </div>
              {enhanced && (
                <div className="enhanced">
                  <div className="enhanced-lbl">✨ Enhanced Prompt</div>
                  {enhanced}
                </div>
              )}
            </div>

            {/* QUICK PROMPTS */}
            <div className="card">
              <div className="card-title">⚡ Quick Prompts</div>
              <div className="qp-list">
                {QUICK_PROMPTS.map((qp,i) => (
                  <button key={i} className="qp-btn" onClick={()=>setPrompt(qp)}>
                    {qp.substring(0,60)}...
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <div style={{marginBottom:"14px"}}>
              <button className="btn btn-gen" onClick={generateVideo} disabled={isGen || !prompt.trim()}>
                {isGen ? <span className="spin"></span> : "🎬"} {isGen ? "Generating..." : "Generate Video"}
              </button>
            </div>

            {/* PROGRESS */}
            {isGen && (
              <div className="card">
                <div className="prog-bar" style={{width:"100%",height:"6px"}}>
                  <div className="prog-fill" style={{width:`${progress}%`}}></div>
                </div>
                <div className="prog-status">{genStatus}</div>
                <div className="prog-pct">{Math.round(progress)}%</div>
              </div>
            )}

            {/* VIDEO RESULT */}
            {videoUrl && (
              <div className="card result-card">
                <div className="card-title result-title">🎥 Generated Video</div>
                <video className="video" controls width="100%">
                  <source src={videoUrl} type="video/mp4" />
                </video>

                {/* SAVE & DOWNLOAD */}
                <div style={{marginTop:"14px"}}>
                  <div className="row">
                    <input
                      type="text"
                      className="inp"
                      value={projectName}
                      onChange={(e)=>setProjectName(e.target.value)}
                      placeholder="Project name..."
                      style={{flex:1}}
                    />
                    <button className="btn btn-save btn-sm" onClick={saveProject}>💾 Save</button>
                  </div>
                </div>

                <div style={{marginTop:"10px"}}>
                  <div style={{fontSize:"10px",color:"rgba(200,200,255,0.4)",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Download</div>
                  <div className="row">
                    <button className="btn btn-dl" onClick={()=>downloadVideo(videoUrl,"tenis_video","720p")}>📥 720p</button>
                    <button className="btn btn-dl" onClick={()=>downloadVideo(videoUrl,"tenis_video","1080p")}>📥 1080p</button>
                    <button className="btn btn-dl" onClick={()=>downloadVideo(videoUrl,"tenis_video","4k")}>📥 4K</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* PROJECTS TAB */}
        {tab === "projects" && (
          <div className="card result-card">
            <div className="card-title result-title">💾 Saved Projects ({projects.length})</div>
            {projects.length === 0 ? (
              <div className="info">No projects saved yet. Create and save your first video!</div>
            ) : (
              <div className="projects-list">
                {projects.map(proj => (
                  <div key={proj.id} className="project-card">
                    {proj.thumbnail && <img src={proj.thumbnail} alt={proj.name} className="project-thumb" />}
                    <div className="project-name">{proj.name}</div>
                    <div className="project-date">{proj.created}</div>
                    <button className="btn btn-dl btn-sm project-btn" onClick={()=>downloadVideo(proj.videoUrl,proj.name,proj.quality)}>
                      📥 Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <>
            <div className="card">
              <div className="card-title">⚙️ Settings</div>
              <div style={{fontSize:"13px",color:"rgba(200,200,255,0.7)",lineHeight:"1.8"}}>
                <p>📊 <strong>Max Duration:</strong> 5 minutes (300 seconds) for video generation</p>
                <p>🎬 <strong>Quality Options:</strong> 720p, 1080p HD, 2K, and 4K UHD supported</p>
                <p>💾 <strong>Project Storage:</strong> All projects saved to browser localStorage</p>
                <p>🔑 <strong>API Keys:</strong> Never sent to external servers, stored locally only</p>
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{"--ac":"#ef4444"}}>🗑️ Danger Zone</div>
              <button className="btn btn-again" onClick={()=>{
                if(confirm("Clear all projects?")){
                  setProjects([]);
                  localStorage.setItem("tenis_projects","[]");
                }
              }}>Clear All Projects</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
