import { useState, useRef, useEffect } from 'react';
import { Dots } from 'react-mosaic-loader';

const DEMO_IMAGE = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=400&fit=crop';
const SMOOTH_EASING = 'cubic-bezier(0.33, 0, 0.2, 1)';
const NPM_INSTALL = 'npm install react-mosaic-loader';
const NPM_URL = 'https://www.npmjs.com/package/react-mosaic-loader';
const GITHUB_URL = 'https://github.com/sirivatd/react-mosaic-loader';
const LINKEDIN_URL = 'https://www.linkedin.com/in/donsirivat/';

type ShapeOption = 'square' | 'circle' | 'squircle' | 'play';

export default function App() {
  const [customSrc, setCustomSrc] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(2800);
  const [gridSize, setGridSize] = useState(22);
  const [dotCount, setDotCount] = useState(484);
  const [dotRadius, setDotRadius] = useState(2.5);
  const [minOpacity, setMinOpacity] = useState(0.3);
  const [maxOpacity, setMaxOpacity] = useState(1);
  const [minScale, setMinScale] = useState(0.72);
  const [maxScale, setMaxScale] = useState(1);
  const [shape, setShape] = useState<ShapeOption>('circle');
  const [copied, setCopied] = useState(false);

  const displaySrc = uploadedUrl || customSrc || null;

  const copyInstall = () => {
    navigator.clipboard.writeText(NPM_INSTALL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    return () => {
      if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    };
  }, [uploadedUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
      setUploadedUrl(null);
    }
    if (file && file.type.startsWith('image/')) {
      setUploadedUrl(URL.createObjectURL(file));
      setCustomSrc('');
    }
    e.target.value = '';
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSrc(e.target.value);
    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
      setUploadedUrl(null);
    }
  };

  const clearImage = () => {
    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
      setUploadedUrl(null);
    }
    setCustomSrc('');
  };

  return (
    <div className="page">
      <header className="header">
        <nav className="header-links">
          <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className="header-link">
            npm
          </a>
          <span className="header-link-sep">·</span>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="header-link">
            GitHub
          </a>
          <span className="header-link-sep">·</span>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="header-link">
            Developer
          </a>
        </nav>
        <h1 className="title">react-mosaic-loader</h1>
        <p className="tagline">
          Image-sampling geometric matrix. Pixel data mapped to a grid of dots with a staggered wave animation.
        </p>
      </header>

      <section className="section">
        <h2 className="section-title">Examples</h2>

        <div className="grid">
          <div className="card">
            <div className="card-label">Circle · 24×24</div>
            <div className="loader-wrap">
              <Dots
                src={DEMO_IMAGE}
                gridSize={24}
                width={280}
                height={280}
                dotRadius={2.5}
                duration={2800}
                easing={SMOOTH_EASING}
                shape="circle"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-label">Squircle · fallback</div>
            <div className="loader-wrap">
              <Dots
                gridSize={20}
                width={280}
                height={280}
                dotRadius={3}
                duration={2800}
                easing={SMOOTH_EASING}
                shape="squircle"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-label">Play icon · 32×32</div>
            <div className="loader-wrap">
              <Dots
                src={DEMO_IMAGE}
                gridSize={32}
                width={280}
                height={280}
                dotRadius={1.8}
                duration={3200}
                easing={SMOOTH_EASING}
                shape="play"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section try-section">
        <h2 className="section-title">Try your own image</h2>
        <p className="section-desc">
          Upload an image from your device or paste a URL. Uploaded images are sampled locally (no CORS).
        </p>
        <div className="try-inputs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
            aria-label="Upload image"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-upload"
          >
            Upload image
          </button>
          <input
            type="url"
            placeholder="Or paste image URL…"
            value={customSrc}
            onChange={handleUrlChange}
            className="input"
            aria-label="Image URL"
          />
          {displaySrc && (
            <button type="button" onClick={clearImage} className="btn btn-clear">
              Clear
            </button>
          )}
        </div>

        <div className="controls-panel">
          <h3 className="controls-title">Fine controls</h3>
          <div className="controls-grid">
            <label className="control">
              <span className="control-label">Speed</span>
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <span className="control-value">{speed}x</span>
            </label>
            <label className="control">
              <span className="control-label">Duration (ms)</span>
              <input
                type="range"
                min={1200}
                max={5000}
                step={200}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
              <span className="control-value">{duration}</span>
            </label>
            <label className="control">
              <span className="control-label">Grid size</span>
              <input
                type="range"
                min={8}
                max={40}
                step={2}
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
              />
              <span className="control-value">{gridSize}</span>
            </label>
            <label className="control">
              <span className="control-label">Number of dots</span>
              <input
                type="range"
                min={64}
                max={1600}
                step={1}
                value={dotCount}
                onChange={(e) => setDotCount(Number(e.target.value))}
              />
              <span className="control-value">{dotCount}</span>
            </label>
            <label className="control">
              <span className="control-label">Dot radius</span>
              <input
                type="range"
                min={0.5}
                max={6}
                step={0.5}
                value={dotRadius}
                onChange={(e) => setDotRadius(Number(e.target.value))}
              />
              <span className="control-value">{dotRadius}</span>
            </label>
            <label className="control">
              <span className="control-label">Min opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={minOpacity}
                onChange={(e) => setMinOpacity(Number(e.target.value))}
              />
              <span className="control-value">{minOpacity.toFixed(2)}</span>
            </label>
            <label className="control">
              <span className="control-label">Max opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={maxOpacity}
                onChange={(e) => setMaxOpacity(Number(e.target.value))}
              />
              <span className="control-value">{maxOpacity.toFixed(2)}</span>
            </label>
            <label className="control">
              <span className="control-label">Min scale</span>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={minScale}
                onChange={(e) => setMinScale(Number(e.target.value))}
              />
              <span className="control-value">{minScale.toFixed(2)}</span>
            </label>
            <label className="control">
              <span className="control-label">Max scale</span>
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.05}
                value={maxScale}
                onChange={(e) => setMaxScale(Number(e.target.value))}
              />
              <span className="control-value">{maxScale.toFixed(2)}</span>
            </label>
            <div className="control control-shape">
              <span className="control-label">Shape</span>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as ShapeOption)}
                className="control-select"
              >
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="squircle">Squircle</option>
                <option value="play">Play</option>
              </select>
            </div>
          </div>
        </div>

        <div className="loader-wrap large">
          <Dots
            src={displaySrc}
            dotCount={dotCount}
            width={320}
            height={320}
            dotRadius={dotRadius}
            duration={duration}
            speed={speed}
            minOpacity={minOpacity}
            maxOpacity={maxOpacity}
            minScale={minScale}
            maxScale={maxScale}
            easing={SMOOTH_EASING}
            shape={shape}
            crossOrigin={uploadedUrl ? '' : 'anonymous'}
          />
        </div>
      </section>

      <footer className="footer">
        <div className="install-wrap">
          <code className="install" title={NPM_INSTALL}>{NPM_INSTALL}</code>
          <button
            type="button"
            onClick={copyInstall}
            className="copy-btn"
            title="Copy to clipboard"
            aria-label="Copy install command"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </footer>
    </div>
  );
}
