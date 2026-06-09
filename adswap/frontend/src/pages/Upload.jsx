import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, AVATAR_STYLES, VARIATION_OPTIONS } from "../lib/api.js";

const ACCEPT = ".mp4,.mov,.avi";

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const productInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [numVariations, setNumVariations] = useState(3);
  const [avatarStyle, setAvatarStyle] = useState("diverse_cast");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const submit = async () => {
    if (!file) return;
    setSubmitting(true);
    setUploadPct(0);
    setError(null);
    try {
      const { job_id } = await api.createJob({
        file,
        numVariations,
        avatarStyle,
        productImage,
        onProgress: setUploadPct,
      });
      navigate(`/results/${job_id}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  const buttonLabel = !submitting
    ? "Generate variations"
    : uploadPct < 100
      ? `Uploading… ${uploadPct}%`
      : "Starting pipeline…";

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Swap the cast, keep the ad</h1>
      <p className="mt-2 text-neutral-400">
        Upload a UGC video ad. AdSwap transcribes it, analyzes the scene structure, and
        generates character-swapped variations with the same script and product.
      </p>

      {health?.mock_mode && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Running in mock mode — add API keys in <code>.env</code> for real generation.
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-8 cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          dragging ? "border-brand bg-brand/10" : "border-neutral-700 hover:border-neutral-500"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="text-4xl">📤</div>
        {file ? (
          <p className="mt-3 font-medium">{file.name}</p>
        ) : (
          <>
            <p className="mt-3 font-medium">Drag & drop a video here</p>
            <p className="text-sm text-neutral-500">or click to browse — .mp4, .mov, .avi</p>
          </>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => productInputRef.current?.click()}
            className="shrink-0 h-16 w-16 rounded-lg border border-dashed border-neutral-700 hover:border-neutral-500 grid place-items-center overflow-hidden"
          >
            {productImage ? (
              <img
                src={URL.createObjectURL(productImage)}
                alt="product"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl">📦</span>
            )}
          </button>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-200">
              Product image <span className="text-neutral-500">(optional)</span>
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {productImage
                ? productImage.name
                : "Add a clean photo of your product for an exact match in every variation."}
            </p>
          </div>
          {productImage && (
            <button
              type="button"
              onClick={() => setProductImage(null)}
              className="ml-auto text-xs text-neutral-400 hover:text-white"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={productInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setProductImage(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Number of variations
          </label>
          <div className="flex gap-2">
            {VARIATION_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setNumVariations(n)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium border transition-colors ${
                  numVariations === n
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Avatar style</label>
          <select
            value={avatarStyle}
            onChange={(e) => setAvatarStyle(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-2 px-3 text-sm focus:border-brand outline-none"
          >
            {AVATAR_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <button
        onClick={submit}
        disabled={!file || submitting}
        className="mt-8 w-full rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed py-3 font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {submitting && (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        )}
        {buttonLabel}
      </button>

      {submitting && uploadPct < 100 && (
        <div className="mt-3 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-200"
            style={{ width: `${Math.max(2, uploadPct)}%` }}
          />
        </div>
      )}
    </div>
  );
}
