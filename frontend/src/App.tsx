import React, { useEffect, useState } from "react"
import { AstroX, InternetIdentity } from "@connect2ic/core/providers"
import {
  ConnectButton,
  ConnectDialog,
  Connect2ICProvider,
  useConnect,
  useProviders,
} from "@connect2ic/react"
import "@connect2ic/core/style.css"
import logo from "./assets/logo.svg"
import banner from "./assets/banner.svg"
import minting from "./assets/mint.gif"
import nft from "./assets/116.png"
import Footer from "./components/Footer"
import qs from "querystring"
import { QRCodeSVG } from "qrcode.react"
import Modal from "react-modal"
import { popConnection, popNFTConnection } from "./service/connection"
import { delay } from "./utils"
import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

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
  const { principal, activeProvider, isConnected } = useConnect()
  const provider = useProviders()
  const [identity, setIdentity] = useState<SignIdentity>()
  const [minted, setMinted] = useState(
    localStorage.getItem(principal?.toString()!) ? true : false,
  )
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  console.log(provider)
  let params: any
  const random = Math.floor(Math.random() * 3)
  if (random === 2) {
    params = {
      principal,
      host: window.location.hostname,
    }
  } else {
    params = {
      principal,
      host: window.location.hostname,
      type: random,
    }
  }

  useEffect(() => {
    if(isConnected) {
      const img = new Image()
      img.src = minting
      console.log("principal", principal)
      const curIdentity =  activeProvider?.connector.client._identity;
      setIdentity(curIdentity);
      getNFTTokens(curIdentity);
      checkHumanStatus(curIdentity);
    }
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
      setError("Please connect a wallet.")
      setTimeout(() => {
        setError("")
      }, 2000)
    }
  }

  const mint = async () => {
    if (minted) return setMintOpen(false)
    if (loading) return
    localStorage.setItem(principal?.toString()!, "1")
    setLoading(true)
    delay(2000)
    // const result: any = await (await popConnection(identity!)).actor.()
    setLoading(false)
    setMinted(true)
  }

  const getNFTTokens = async (identity: SignIdentity) => {
    const result: any = await (await popNFTConnection(identity!)).actor.account_id(identity.getPrincipal());
    console.log(result);
    const tokensResult: any = await (await popNFTConnection(identity!)).actor.tokens(result)
    console.log()
    const nftDataResult: any = await (await popNFTConnection(identity!)).actor.tokens(tokensResult)
  }

  const transferNFT = async () => {
    const result: any = await (await popNFTConnection(identity!)).actor.transfer({
      to: {
        principal: Principal.fromText('')
      },
      from: {
        principal: Principal.fromText(principal!)
      },
      token:'',
      memo: [],
      subaccount: [],
      amount: 1
    })
    console.log(result);
  }

  const checkHumanStatus = async (identity: SignIdentity) => {
    const scope = prefix + qs.stringify(params)
    console.log('popConnection', await popConnection(identity!))
    const result: any = await (await popConnection(identity!)).actor.get_token(scope)
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
    clearInterval(timer)
    timer = setInterval(async () => {
      const result: any = await (await popConnection(identity!)).actor.get_token(scope)
      console.log("result", result)
      if (result.Ok && result.Ok.active) {
        //verify
        clearInterval(timer)
        setActive(true)
        setOpen(false)
        setMintOpen(true)
        setSuccess("Verified successfully.")
        setTimeout(() => {
          setSuccess("")
        }, 2000)
      } else {
        setActive(false)
      }
    }, 2000)
  }
  return (
    <div className="container">
      <header className="nav-header ">
        <img src={logo} style={{ width: 162, height: 32 }} alt="logo" />
        <div className="flex-1 flex justify-end align-items-center">
          <a
            className="connect-button"
            style={{ width: 230 }}
            href="https://yvnfd-naaaa-aaaai-acjga-cai.raw.ic0.app/humanid.apk"
            target="_blank"
          >
            Download Demo App
          </a>
        </div>
      </header>
      <div className="verify-status">
        <div className="flex">
          <img src={banner} style={{ width: 540, height: 138 }} alt="" />
        </div>
        <p style={{ marginTop: 36 }}>
          Prove that you’re a real person using blockchain Dapps.
        </p>

        <p></p>
      </div>
      <div className="flex align-items-center">
        <p
          style={{
            borderRadius: 20,
            overflow: "hidden",
            width: 360,
            height: 360,
            marginRight: 100,
          }}
        >
          <img
            src={minted ? nft : minting}
            alt=""
            style={{ width: 360, height: 360 }}
          />
        </p>
        <div className="flex-1">
          <h1 className="c_white" style={{ marginBottom: 36 }}>
            Prove you’re a real person to mint a <strong>MOCKUP</strong> NFT.
          </h1>
          <div className="flex">
            <div style={{ width: 200 }}>
              <ConnectButton />
            </div>
            {principal ? (
              <>
                <p className="c_white" style={{ marginLeft: 10 }}>
                  Principal ID: {principal}
                </p>
              </>
            ) : null}
          </div>
          <a className="mint-button" onClick={tryMint}>
            Mint Now
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
          <p>
            1.Go to “Settings -&gt; Experiments -&gt; Proof of Personhood” and
            then choose "For Dapps".{" "}
          </p>
          <p style={{ marginBottom: 30 }}>2.Click "Scan" button.</p>
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
        <p
          style={{
            textAlign: "center",
            width: 360,
            height: 360,
            marginBottom: 20,
            overflow: "hidden",
            borderRadius: 20,
          }}
        >
          <img
            src={minted ? nft : minting}
            alt=""
            style={{ width: 360, height: 360 }}
          />
        </p>
        <h1 className="c_white">{minted ? "Minted!" : "Verified!"}</h1>

        {minted ? (
          <p>You have minted a <strong>MOCKUP</strong> NFT.</p>
        ) : (
          <p>You can mint a <strong>MOCKUP</strong> NFT now.</p>
        )}
        <a
          onClick={mint}
          className={`mint-button ${loading ? "disabled" : ""}`}
        >
          {loading ? "Minting…" : minted ? "Close" : "Mint"}
        </a>
      </Modal>
      <div
        className="toast"
        style={{ display: error || success ? "block" : "none" }}
      >
        <div
          className={`toast-content ${success ? "toast-content-success" : ""}`}
        >
          {error || success}
        </div>
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
    providers={[InternetIdentity]}
  >
    <App />
  </Connect2ICProvider>
)
