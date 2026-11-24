export default function Overlays() {
  return (
    <>
      <div className="takeover" id="takeover" hidden />
      <div className="scrim" id="scrim" data-act="pclose" />
      <aside className="spanel" id="spanel" aria-label="Side panel" />
      <div className="ov2" id="confirm" hidden />
      <div id="callLayer" />
      <div className="toast" id="toast" role="status" aria-live="polite" />
    </>
  )
}
