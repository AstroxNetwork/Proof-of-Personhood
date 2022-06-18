import React, { useEffect, useState } from "react"
/*
 * Connect2ic provides essential utilities for IC app development
 */
import { AstroX, InternetIdentity } from "@connect2ic/core/providers"
import {
  ConnectButton,
  ConnectDialog,
  Connect2ICProvider,
  useConnect,
} from "@connect2ic/react"
import "@connect2ic/core/style.css"
/*
 * Import canister definitions like this:
 */
import * as counter from "canisters/counter"
/*
 * Some examples to get you started
 */
import { Counter } from "./components/Counter"
import { Transfer } from "./components/Transfer"
import { Profile } from "./components/Profile"
import logo from "./assets/logo.png"
import verifyed from "./assets/verifyed.png"
import Footer from "./components/Footer"
import qs from "querystring"
import { QRCodeSVG } from "qrcode.react"
import Modal from "react-modal"
import { connection } from "./service/connection"

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(4px)",
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#23232F",
    borderRadius: "10px",
    border: 0,
  },
}
let timer: number | undefined

const prefix = "astrox://human"

function App() {
  const [link, setLink] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(false)
  const { principal, isConnected } = useConnect()

  const params = {
    principal,
    host: window.location.hostname,
  }

  useEffect(() => {
    checkHumanStatus()
  }, [principal])

  const mint = () => {
    //
  }

  const checkHumanStatus = async () => {
    const scope = prefix + qs.stringify(params)
    const result: any = await connection.actor.get_token(scope)
    console.log("result", result)
    if (result.Ok && result.Ok.active) {
      clearInterval(timer)
      setActive(true)
    }
  }

  const sanCode = async () => {
    console.log(window.location.hostname)
    setLink(link)
    setOpen(true)
    const startResult: any = await connection.actor.detect_start(link, 0)
    console.log("startResult", startResult)
    setTimeout(async () => {
      const result = await connection.actor.detect_end(link, startResult["Ok"])
      console.log(result)
    }, 4000)
    timer = setInterval(async () => {
      const result: any = await connection.actor.get_token(link)
      console.log("result", result)
      if (result.Ok.active) {
        //verify
        clearInterval(timer)
        setActive(true)
      } else {
        setActive(false)
      }
    }, 2000)
  }
  return (
    <div className="container">
      <header className="nav-header">
        <img src={logo} className="App-logo" alt="logo" />
        <ConnectButton />
      </header>
      <div className="verify-status">
        <div className="flex">
          <img src={verifyed} alt="" />
          <h1>
            Proof of <br></br>Human
          </h1>
        </div>
        <p style={{ marginTop: 36 }}>
          Prove that you’re a real person using blockchain Dapps.
        </p>
      </div>
      <div className="flex align-items-center">
        <div className="img" />
        <div className="flex-1">
          <h1 className="c_white">
            Prove you’re a real person to mint an mockup NFT.
          </h1>
          <a className="mint-button" onClick={sanCode}>
            try it now
          </a>
        </div>
      </div>
      <Footer />
      {/* <div className="examples">
        <Counter />
        <Profile />
        <Transfer />
      </div> */}
      <Modal isOpen={open} contentLabel="Example Modal" style={customStyles}>
        <div className="modal-content">
          <h1 className="c_white mg_b_10">Scan using ME App</h1>
          <p style={{ marginBottom: 30 }}>
            Go to “Settings -&gt; Experiments -&gt; Proof of Human” and click
            “SCAN” button.
          </p>
          <div className="flex justify-center">
            <div
              style={{
                overflow: "hidden",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 0,
                width: 170,
                height: 170,
              }}
            >
              <QRCodeSVG value={link} size={170} includeMargin />
            </div>
          </div>
          <p style={{ textAlign: "center" }}>
            <a onClick={() => setOpen(false)} className="button">
              Close
            </a>
          </p>
        </div>
      </Modal>
      <ConnectDialog />
    </div>
  )
}

export default () => (
  <Connect2ICProvider
    /*
     * Disables dev mode in production
     * Should be enabled when using local canisters
     */
    dev={import.meta.env.DEV}
    /*
     * Can be consumed throughout your app like this:
     *
     * const [counter] = useCanister("counter")
     *
     * The key is used as the name. So { canisterName } becomes useCanister("canisterName")
     */
    canisters={{
      counter,
    }}
    /*
     * List of providers
     */
    providers={[AstroX, InternetIdentity]}
  >
    <App />
  </Connect2ICProvider>
)
