import React, { useEffect, useState } from "react"
import { AstroX, InternetIdentity } from "@connect2ic/core/providers"
import {
  ConnectButton,
  ConnectDialog,
  Connect2ICProvider,
  useConnect,
} from "@connect2ic/react"
import "@connect2ic/core/style.css"
import logo from "./assets/logo.svg"
import verified from "./assets/verified.png"
import Footer from "./components/Footer"
import qs from "querystring"
import { QRCodeSVG } from "qrcode.react"
import Modal from "react-modal"
import { connection } from "./service/connection"
import { delay } from "./utils"

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

const prefix = "astrox://human?"

function App() {
  const [link, setLink] = useState("")
  const [open, setOpen] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const { principal, isConnected } = useConnect()
  const [minted, setMinted] = useState(
    localStorage.getItem(principal?.toString()!) ? true : false,
  )
  const [error, setError] = useState("")

  const params = {
    principal,
    host: window.location.hostname,
    type: 0,
  }

  useEffect(() => {
    checkHumanStatus()
    console.log("principal", principal)
  }, [principal])

  const tryMint = () => {
    if (isConnected) {
      if (active) {
        setMintOpen(true)
      } else {
        sanCode()
      }
    } else {
      console.error("please connect account.")
      setError("Please connect account.")
      setTimeout(() => {
        setError("")
      }, 2000)
    }
  }

  const mint = () => {
    if (minted) return setMintOpen(false)
    if (loading) return
    localStorage.setItem(principal?.toString()!, "1")
    setLoading(true)
    delay(2000)
    setLoading(false)
    setMinted(true)
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
    const scope = prefix + qs.stringify(params)
    setLink(scope)
    setOpen(true)
    // const startResult: any = await connection.actor.detect_start(scope, 0)
    // console.log("startResult", startResult)
    // setTimeout(async () => {
    //   const result = await connection.actor.detect_end(scope, startResult["Ok"])
    //   console.log(result)
    // }, 4000)
    timer = setInterval(async () => {
      const result: any = await connection.actor.get_token(scope)
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
      <header className="nav-header ">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="flex-1 flex justify-end align-items-center">
          <ConnectButton />
        </div>
      </header>
      <div className="verify-status">
        <div className="flex">
          <img src={verified} alt="" />
          <h1>
            Proof of <br></br>Human
          </h1>
        </div>
        <p style={{ marginTop: 36 }}>
          Prove that you’re a real person using blockchain Dapps.
        </p>
        {principal ? (
          <>
            <p className="c_white">Principal ID:  {principal}</p>
          </>
        ) : null}
        <p></p>
      </div>
      <div className="flex align-items-center">
        <div className="img" />
        <div className="flex-1">
          <h1 className="c_white">
            Prove you’re a real person to mint an mockup NFT.
          </h1>
          <a className="mint-button" onClick={tryMint}>
            try it now
          </a>
        </div>
      </div>
      <Footer />
      <Modal
        ariaHideApp={false}
        isOpen={open}
        contentLabel="Example Modal"
        style={customStyles}
      >
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
      <Modal
        ariaHideApp={false}
        isOpen={mintOpen}
        contentLabel="Example Modal"
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            backgroundColor: "transparent",
            textAlign: "center",
          },
        }}
      >
        <div className="img"></div>
        <h1 className="c_white">Verified!</h1>
        <p>You can mint a mockup NFT now.</p>
        <a
          onClick={mint}
          className={`mint-button ${loading ? "disabled" : ""}`}
        >
          {loading ? "Minting…" : minted ? "Close" : "Mint"}
        </a>
      </Modal>
      <div className="toast" style={{ display: error ? "block" : "none" }}>
        <div className="toast-content">{error}</div>
      </div>
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
     * List of providers
     */
    providers={[AstroX, InternetIdentity]}
  >
    <App />
  </Connect2ICProvider>
)
