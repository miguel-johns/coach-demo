function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4" />
    </svg>
  )
}

export default function MainBar() {
  return (
    <div className="mbar">
      <div className="mtop">
        <button className="trailb" id="trailB" data-act="trailback" type="button" hidden />
        <h1 id="pageTitle">Home</h1>
        <div className="mright">
          <span id="topBtn" />
          <span className="pswrap">
            <input
              className="psearch"
              id="psearch"
              type="search"
              placeholder="Find a person"
              aria-label="Find a person"
              autoComplete="off"
            />
            <span className="psres" id="psres" hidden />
          </span>
          <span className="pswrap">
            <button className="ico" data-act="usermenu" aria-label="Your menu" aria-haspopup="true" type="button">
              <UserIcon />
            </button>
            <span className="umenu" id="umenu" hidden />
          </span>
          <button className="ico" id="homeX" data-act="go" data-id="home" aria-label="Close and go Home" type="button">
            {'\u2715'}
          </button>
        </div>
      </div>
      <nav className="ptabs" id="ptabs" aria-label="Page sections" />
    </div>
  )
}
