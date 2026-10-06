import { useRef, useState } from 'react'
import { autoTrimImage, type TrimmedImage } from '../lib/autoTrim'

export function ImageCropTool() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<TrimmedImage | null>(null)
  const [status, setStatus] = useState('이미지를 첨부하면 오브젝트 주변 여백을 자동으로 줄입니다.')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadName, setDownloadName] = useState('cropped-image.png')

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsProcessing(true)
    setResult(null)
    setStatus('테두리 배경을 분석하고 오브젝트 경계를 찾는 중…')
    try {
      const trimmed = await autoTrimImage(file)
      setResult(trimmed)
      setDownloadName(`${file.name.replace(/\.[^.]+$/, '') || 'cropped-image'}-cropped.png`)
      setStatus(trimmed.trimmed
        ? `여백을 최소화했습니다. ${trimmed.originalWidth}×${trimmed.originalHeight} → ${trimmed.croppedWidth}×${trimmed.croppedHeight}`
        : '오브젝트가 이미지 가장자리에 닿아 원본 경계를 유지했습니다.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '이미지 자동 크롭 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setResult(null)
    setStatus('이미지를 첨부하면 오브젝트 주변 여백을 자동으로 줄입니다.')
    inputRef.current?.click()
  }

  return (
    <section className="crop-tool" id="image-crop" aria-label="이미지 자동 크롭 도구">
      <div className="crop-tool-heading">
        <p className="eyebrow">AUTO CROP</p>
        <h3>이미지 여백 자르기</h3>
        <p>오브젝트 주변만 남기고 테두리 배경을 최대한 줄여요.</p>
      </div>
      <label className={isProcessing ? 'crop-upload processing' : 'crop-upload'}>
        <span>{isProcessing ? '이미지 분석 중…' : result ? '다른 이미지 첨부' : '이미지 첨부'}</span>
        <small>PNG · JPG · WEBP</small>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} disabled={isProcessing} />
      </label>
      <p className="crop-status" role="status">{status}</p>
      {result ? (
        <div className="crop-result">
          <div className="crop-preview">
            <img src={result.dataUrl} alt="자동 크롭된 이미지 미리보기" />
          </div>
          <a href={result.dataUrl} download={downloadName} className="crop-download">PNG 다운로드 <span>↓</span></a>
          <button type="button" className="crop-reset" onClick={reset}>다른 이미지 선택</button>
        </div>
      ) : null}
      <p className="crop-privacy">파일은 브라우저 안에서만 처리됩니다.</p>
    </section>
  )
}
