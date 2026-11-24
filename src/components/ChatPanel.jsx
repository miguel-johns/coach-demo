export default function ChatPanel() {
  return (
    <aside className="chat" id="chat" aria-label="Milton chat">
      <div className="chead">
        <span className="nm">
          <img className="mav" src="/assets/milton.png" alt="" />
          Milton
        </span>
        <button className="btn sm quiet" data-act="chatup" id="chatTog" type="button">
          Open
        </button>
      </div>
      <div className="cbody" id="chatBody" />
      <div className="sugg" id="sugg" />
      <form className="cform" id="chatForm">
        <input id="chatInput" type="text" autoComplete="off" aria-label="Message Milton" />
        <button type="submit" aria-label="Send to Milton">
          {'\u2191'}
        </button>
      </form>
    </aside>
  )
}
