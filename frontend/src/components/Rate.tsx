import React from "react"
import { useState } from "react"
import minting from "../assets/mint.gif"
import rate from "../assets/rate.png"
import step from "../assets/step.png"
type RateViewProps = {
  close: () => void
}
const RateView: React.FC<RateViewProps> = (props) => {
  const { close } = props
  const [tab, setTab] = useState("step")
  const tabsOptions = [
    {
      title: "Circulation volume",
      key: "step",
    },
    {
      title: "Rarities",
      key: "rate",
    },
  ]
  return (
    <div className="flex">
      <div style={{ width: 220, marginRight: 50 }}>
        <img
          src={minting}
          style={{ width: 220, height: 220, marginTop: 60 }}
          alt=""
        />
        <h1 className="c_white">POP NFT</h1>
      </div>
      <div className="flex-1">
        <div className="tabs">
          <div className="tabs-nav">
            {tabsOptions.map((o) => (
              <div
                className={`tab-item ${tab === o.key ? "tab-item-active" : ""}`}
                onClick={() => setTab(o.key)}
              >
                <h2>{o.title}</h2>
              </div>
            ))}
          </div>
          {tab === "rate" ? (
            <div className="tabs-content">
              <img src={rate} alt="" style={{ width: 660, display: 'block', paddingLeft: 60, paddingRight: 40 }} />
              <button
                style={{ marginTop: 60 }}
                onClick={close}
                className={`mint-button`}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="tabs-content">
              <div className="flex" style={{ paddingLeft: 60, paddingRight: 60, alignItems: "flex-start" }}>
                <div>
                  {/* <img src={step} alt="" style={{height: 334, marginTop: 20, marginRight: 7}} /> */}
                  <div className="time-line">
                    <div className="time-item">End</div>
                    <div className="time-item"></div>
                    <div className="time-item"></div>
                    <div className="time-item"></div>
                  </div>
                </div>
                <div className="flex-1" style={{textAlign: 'left'}}>
                  <div className="step">
                    <h1>1st Round</h1>
                    <h2 className="c_white">800 for OG and early testers.</h2>
                  </div>
                  <div className="step">
                    <h1>2nd Round</h1>
                    <h2 className="c_white">3000 for Android App users.</h2>
                  </div>
                  <div className="step">
                    <h1>3rd Round</h1>
                    <h2 className="c_white">3000 for iOS App users.</h2>
                  </div>
                  <div className="step">
                    <h1>4th Round</h1>
                    <h2 className="c_white">
                      2000 for other whitelists and events.
                    </h2>
                  </div>
                </div>
              </div>
              <button
                style={{ marginTop: 60 }}
                onClick={close}
                className={`mint-button`}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RateView
