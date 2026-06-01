/**
 * ФАЙЛ: AiCameraPage.jsx
 * ЧТО ЭТО: Страница: AI-камера.
 * ЗА ЧТО ОТВЕЧАЕТ: фото еды → распознавание → дневник.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scansApi } from '../api/scans';
import { useLanguage } from '../i18n/LanguageContext';
import { prepareImageFile } from '../utils/prepareImageFile';
import PageHero from '../components/ui/PageHero';
import { SkeletonCardList } from '../components/ui/Skeleton';
import './AiCameraPage.css';

function getLocalDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fileErrorMessage(code, t) {
  switch (code) {
    case 'FILE_TOO_LARGE':
      return t('aiCamera.fileTooLarge');
    case 'UNSUPPORTED_FORMAT':
    case 'CONVERT_FAILED':
      return t('aiCamera.unsupportedFormat');
    case 'NO_FILE':
      return t('aiCamera.noFile');
    default:
      return null;
  }
}

export default function AiCameraPage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [tab, setTab] = useState('scan');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const setPreview = useCallback((url) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (url) previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  useEffect(() => {
    if (!cameraOn || !streamRef.current || !videoRef.current) return undefined;

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {});

    return undefined;
  }, [cameraOn]);

  useEffect(() => () => {
    stopCamera();
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, [stopCamera]);

  const startCamera = async () => {
    setError('');

    if (!window.isSecureContext) {
      setError(t('aiCamera.secureContext'));
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t('aiCamera.cameraUnsupported'));
      return;
    }

    try {
      stopCamera();

      const attempts = [
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        { video: { facingMode: 'user' }, audio: false },
        { video: true, audio: false },
      ];

      let stream = null;
      let lastError = null;

      for (const constraints of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!stream) {
        throw lastError || new Error('camera_denied');
      }

      streamRef.current = stream;
      setCameraOn(true);
    } catch (err) {
      console.error('Camera error:', err);
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError(t('aiCamera.cameraDenied'));
      } else if (name === 'NotFoundError') {
        setError(t('aiCamera.cameraNotFound'));
      } else {
        setError(t('aiCamera.cameraError'));
      }
    }
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { scans } = await scansApi.getList(40);
      setHistory(scans || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  const analyzeFile = async (rawFile) => {
    if (!rawFile) return;

    setError('');
    setAnalyzing(true);
    setResult(null);
    stopCamera();

    let file = rawFile;
    try {
      file = await prepareImageFile(rawFile);
    } catch (prepErr) {
      const msg = fileErrorMessage(prepErr.message, t) || t('aiCamera.unsupportedFormat');
      setError(msg);
      setAnalyzing(false);
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      const { scan } = await scansApi.analyze(file, lang);
      setResult(scan);
    } catch (err) {
      setError(err.message || t('aiCamera.analyzeError'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) analyzeFile(file);
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError(t('aiCamera.cameraError'));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(t('aiCamera.analyzeError'));
          return;
        }
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        stopCamera();
        analyzeFile(file);
      },
      'image/jpeg',
      0.92
    );
  };

  const handleConfirm = async () => {
    if (!result?.id) return;
    setConfirming(true);
    setError('');
    try {
      await scansApi.confirm(result.id, getLocalDateString());
      navigate('/', { state: { diaryUpdated: true } });
    } catch (err) {
      setError(err.message || t('aiCamera.confirmError'));
    } finally {
      setConfirming(false);
    }
  };

  const resetScan = () => {
    setPreview(null);
    setResult(null);
    setError('');
    stopCamera();
  };

  const showCaptureUi = !result && !analyzing;

  return (
    <div className="page ai-camera">
      <PageHero
        eyebrow={t('aiCamera.eyebrow')}
        title={t('aiCamera.title')}
        subtitle={t('aiCamera.subtitle')}
      />

      <div className="ai-camera__tabs">
        <button
          type="button"
          className={`ai-camera__tab ${tab === 'scan' ? 'ai-camera__tab--active' : ''}`}
          onClick={() => setTab('scan')}
        >
          {t('aiCamera.tabScan')}
        </button>
        <button
          type="button"
          className={`ai-camera__tab ${tab === 'history' ? 'ai-camera__tab--active' : ''}`}
          onClick={() => setTab('history')}
        >
          {t('aiCamera.tabHistory')}
        </button>
      </div>

      {tab === 'scan' && (
        <div className="ai-camera__workspace glass-card">
          <div className="ai-camera__media">
            <p className="ai-camera__media-label">
              {result && !analyzing ? t('aiCamera.yourPhoto') : t('aiCamera.tabScan')}
            </p>

            {result && !analyzing ? (
              <div className="ai-camera__thumb-frame">
                <img
                  src={previewUrl || scansApi.imageUrl(result.imageUrl)}
                  alt=""
                  className="ai-camera__thumb"
                />
              </div>
            ) : (
              <div className="ai-camera__viewfinder">
                <video
                  ref={videoRef}
                  className={`ai-camera__video ${cameraOn ? 'ai-camera__video--live' : ''}`}
                  playsInline
                  muted
                  autoPlay
                />
                {previewUrl && !cameraOn && (
                  <img src={previewUrl} alt="" className="ai-camera__preview" />
                )}
                {!cameraOn && !previewUrl && showCaptureUi && (
                  <div className="ai-camera__placeholder">
                    <span className="ai-camera__placeholder-icon" aria-hidden>
                      📷
                    </span>
                    <p>{t('aiCamera.hint')}</p>
                  </div>
                )}
                {analyzing && (
                  <div className="ai-camera__analyzing-overlay">
                    <div className="ai-camera__shimmer" />
                    <p>{t('aiCamera.analyzing')}</p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="ai-camera__error" role="alert">
                {error}
              </p>
            )}

            {showCaptureUi && (
              <div className="ai-camera__controls">
                {!cameraOn ? (
                  <>
                    <button
                      type="button"
                      className="ai-camera__btn ai-camera__btn--primary"
                      onClick={startCamera}
                    >
                      {t('aiCamera.openCamera')}
                    </button>
                    <label className="ai-camera__btn ai-camera__btn--file">
                      {t('aiCamera.fromGallery')}
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="ai-camera__file-input-native"
                        onChange={handleFilePick}
                      />
                    </label>
                  </>
                ) : (
                  <button
                    type="button"
                    className="ai-camera__btn ai-camera__btn--primary"
                    onClick={captureFromCamera}
                  >
                    {t('aiCamera.capture')}
                  </button>
                )}
                {(cameraOn || previewUrl) && (
                  <button
                    type="button"
                    className="ai-camera__btn ai-camera__btn--ghost"
                    onClick={resetScan}
                  >
                    {t('aiCamera.reset')}
                  </button>
                )}
              </div>
            )}

            {result && !analyzing && (
              <button
                type="button"
                className="ai-camera__btn ai-camera__btn--ghost ai-camera__media-reset"
                onClick={resetScan}
              >
                {t('aiCamera.scanAgain')}
              </button>
            )}
          </div>

          <div className="ai-camera__panel">
            {analyzing && (
              <div className="ai-camera__panel-block ai-camera__panel-block--loading">
                <h2 className="ai-camera__panel-title">{t('aiCamera.analyzing')}</h2>
                <SkeletonCardList count={2} />
              </div>
            )}

            {!analyzing && result && (
              <div className="ai-camera__panel-block ai-camera__result">
                <h2 className="ai-camera__panel-title">{t('aiCamera.resultTitle')}</h2>
                <div className="ai-camera__result-head">
                  <p className="ai-camera__dish">{result.dishName}</p>
                  <div className="ai-camera__result-meta">
                    <span className="ai-camera__confidence">
                      {Math.round((result.confidence || 0) * 100)}% {t('aiCamera.confidence')}
                    </span>
                    {result.provider && result.provider !== 'mock' && (
                      <span className="ai-camera__provider">
                        {result.provider === 'openai'
                          ? t('aiCamera.providerOpenai')
                          : result.provider === 'gemini'
                            ? t('aiCamera.providerGemini')
                            : result.provider === 'local'
                              ? t('aiCamera.providerLocal')
                              : result.provider}
                      </span>
                    )}
                  </div>
                </div>

                {(result.confidence ?? 1) < 0.65 && (
                  <p className="ai-camera__low-confidence">{t('aiCamera.lowConfidenceHint')}</p>
                )}

                {result.alternatives?.length > 0 && (result.confidence ?? 1) < 0.72 && (
                  <div className="ai-camera__alternatives">
                    <h3>{t('aiCamera.alternatives')}</h3>
                    <ul>
                      {result.alternatives.map((alt) => (
                        <li key={alt.catalogId || alt.dishName}>{alt.dishName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="ai-camera__nutrition">
                  <div className="ai-camera__nutri-card">
                    <span>{t('aiCamera.weight')}</span>
                    <strong>{result.estimatedWeightG} g</strong>
                  </div>
                  <div className="ai-camera__nutri-card ai-camera__nutri-card--accent">
                    <span>{t('aiCamera.calories')}</span>
                    <strong>
                      {result.calories} {t('dashboard.kcal')}
                    </strong>
                  </div>
                  <div className="ai-camera__nutri-card">
                    <span>{t('dashboard.protein')}</span>
                    <strong>{result.protein} g</strong>
                  </div>
                  <div className="ai-camera__nutri-card">
                    <span>{t('dashboard.fat')}</span>
                    <strong>{result.fat} g</strong>
                  </div>
                  <div className="ai-camera__nutri-card">
                    <span>{t('dashboard.carbs')}</span>
                    <strong>{result.carbs} g</strong>
                  </div>
                </div>

                {result.ingredients?.length > 0 && (
                  <div className="ai-camera__ingredients">
                    <h3>{t('aiCamera.ingredients')}</h3>
                    <ul>
                      {result.ingredients.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="ai-camera__result-actions">
                  <button
                    type="button"
                    className="ai-camera__btn ai-camera__btn--primary"
                    disabled={confirming}
                    onClick={handleConfirm}
                  >
                    {confirming ? t('aiCamera.confirming') : t('aiCamera.confirm')}
                  </button>
                  <button type="button" className="ai-camera__btn" onClick={resetScan}>
                    {t('aiCamera.scanAgain')}
                  </button>
                </div>
              </div>
            )}

            {!analyzing && !result && (
              <div className="ai-camera__panel-block ai-camera__tips">
                <h2 className="ai-camera__panel-title">{t('aiCamera.tipsTitle')}</h2>
                <ol className="ai-camera__tips-list">
                  <li>{t('aiCamera.tip1')}</li>
                  <li>{t('aiCamera.tip2')}</li>
                  <li>{t('aiCamera.tip3')}</li>
                </ol>
                <div className="ai-camera__tips-note">
                  <span className="ai-camera__tips-icon" aria-hidden>
                    ✨
                  </span>
                  <p>{t('aiCamera.subtitle')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="ai-camera__history glass-card">
          {historyLoading ? (
            <SkeletonCardList count={3} />
          ) : history.length === 0 ? (
            <p className="ai-camera__empty">{t('aiCamera.historyEmpty')}</p>
          ) : (
            <ul className="ai-camera__history-list">
              {history.map((scan) => (
                <li key={scan.id} className="ai-camera__history-item">
                  {scan.imageUrl && (
                    <img
                      src={scansApi.imageUrl(scan.imageUrl)}
                      alt=""
                      className="ai-camera__history-thumb"
                    />
                  )}
                  <div className="ai-camera__history-body">
                    <strong>{scan.dishName}</strong>
                    <span>
                      {scan.calories} {t('dashboard.kcal')} · {scan.status}
                    </span>
                    <time>{new Date(scan.createdAt).toLocaleString()}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  );
}
