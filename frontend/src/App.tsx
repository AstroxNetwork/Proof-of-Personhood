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
import back from "./assets/back.png"
import Footer from "./components/Footer"
import qs from "querystring"
import { QRCodeSVG } from "qrcode.react"
import Modal from "react-modal"
import { popConnection, popNFTConnection } from "./service/connection"
import {
  bytesToBase64,
  delay,
  getAccountId,
  getTokenIdentifier,
  hasOwnProperty,
  validatePrincipalId,
} from "./utils"
import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { createClient } from "@connect2ic/core"
import { Info } from "./candid/pop_nft.did"

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

type TransferProps = {
  nftImg: string
  close: () => void
  identity: SignIdentity
  fromPrincipal: string
  tokenIdentifier: string
}
const Transfer: React.FC<TransferProps> = (props) => {
  const { nftImg, identity, fromPrincipal, tokenIdentifier, close } = props
  const [step, setStep] = useState<"main" | "transfer" | "success">("main")
  const [disabled, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState<string>("")
  const [error, setError] = useState("")

  const checkFormat = (value: string) => {
    if (validatePrincipalId(value)) {
      setDisabled(false)
      setError("")
    } else {
      setDisabled(true)
      setError("Principal Id is not valid.")
    }
  }

  const transferNFT = async (to: string) => {
    try {
      setLoading(true)
      const result: any = await (
        await popNFTConnection(identity!)
      ).actor.transfer({
        to: {
          principal: Principal.fromText(to),
        },
        from: {
          principal: Principal.fromText(fromPrincipal!),
        },
        token: tokenIdentifier,
        memo: [],
        subaccount: [],
        amount: 1,
      })
      setLoading(false)
      setStep("success")
    } catch (error) {
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <div>
        <p
          style={{
            textAlign: "center",
            width: 360,
            height: 360,
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: 20,
            overflow: "hidden",
            borderRadius: 20,
          }}
        >
          <img
            src={`data:image/png;base64,${nftImg}`}
            alt=""
            style={{ width: 360, height: 360 }}
          />
        </p>
        <h1 className="mg_t_20 c_white">Success!</h1>
        <p className="c_white">
          You have transferred your PoP NFT to the following wallet. PoP NFT can
          be traded on Yumi now.
        </p>
        <p>
          <a className="button mg_t_30">{value}</a>
        </p>
        <a className="mint-button mg_t_30" onClick={close}>
          Close
        </a>
      </div>
    )
  }

  return (
    <div className="flex" style={{ maxWidth: 900, textAlign: "left" }}>
      <div className="flex-1">
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
            src={`data:image/png;base64,${nftImg}`}
            alt=""
            style={{ width: 360, height: 360 }}
          />
        </p>
        <h1
          className="c_white mg_t_20"
          style={{ fontSize: 46, textAlign: "left" }}
        >
          PoP NFT<br></br> Minted
        </h1>
        <p>You have minted and can trade PoP NFT on Yumi marketplace.</p>
      </div>
      <div className="flex-1">
        <div className="card">
          {step === "main" ? (
            <>
              <h2 className="c_white">Steps before trading your NFT</h2>
              <h2 className="mg_t_30" style={{ fontSize: 30 }}>
                1.
              </h2>
              <h2 className="c_white">
                Log into{" "}
                <a className="c_brand" href="https://yumi.io" target="_blank">
                  Yumi
                </a>
              </h2>
              <p>
                <a
                  href="https://yumi.io"
                  style={{ color: "#9C9CA4", textDecoration: "underline" }}
                  target="_blank"
                >
                  https://yumi.io
                </a>
              </p>
              <h2 className="mg_t_30" style={{ fontSize: 30 }}>
                2.
              </h2>
              <h2 className="c_white">Click Profile</h2>
              <p>
                Click your avatar on the top right corner and click “Profile”.
              </p>
              <h2 className="mg_t_30" style={{ fontSize: 30 }}>
                3.
              </h2>
              <h2 className="c_white">Copy Principal ID</h2>
              <p>Copy “Principal ID” in the Profile page.</p>
              <div
                className="flex"
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginTop: 50,
                }}
              >
                <a className="button" onClick={close}>
                  Close
                </a>
                <a onClick={() => setStep("transfer")} className="mint-button">
                  Next
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="flex" style={{ alignItems: "center" }}>
                <img
                  src={back}
                  alt=""
                  style={{ width: 30, height: 30, marginRight: 10 }}
                  onClick={() => setStep("main")}
                />
                <div className="flex-1">
                  <h1 className="c_white">Transfer PoP NFT</h1>
                </div>
              </div>

              <p>
                PoP NFT will be supported by Yumi marketplace soon. Please stay
                tuned!
              </p>
              <div>
                {/* <input
                  type="text"
                  disabled
                  placeholder="Enter Principal ID"
                  onChange={(e) => {
                    setValue(e.target.value)
                    checkFormat(e.target.value)
                  }}
                /> */}
                {error ? (
                  <p className="mg_t_10" style={{ color: "#FF6363" }}>
                    {error}
                  </p>
                ) : null}
              </div>
              <div
                className="flex"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 290,
                }}
              >
                <a className="button" onClick={close}>
                  Close
                </a>
                {/* <button
                  onClick={() => transferNFT(value!)}
                  disabled={disabled || loading}
                  className="mint-button"
                >
                  {loading ? "Transferring..." : "Transfer"}
                  Coming soon...
                </button> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [link, setLink] = useState("")
  const [open, setOpen] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [nftStatus, setNftStatus] = useState<Info>();
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const { principal, activeProvider, isConnected } = useConnect()
  const [identity, setIdentity] = useState<SignIdentity>()
  const [minted, setMinted] = useState(false)
  const [tokenIdentifier, setTokenIdentifier] = useState<string>("")
  const [nftImg, setNftImg] = useState<string>()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const params = {
    principal,
    host: window.location.hostname,
  }

  useEffect(() => {
    if (isConnected) {
      setActive(false)
      setMinted(false)
      setNftImg(undefined)
      setTokenIdentifier("")
      const img = new Image()
      img.src = minting
      // @ts-ignore
      const curIdentity =
        activeProvider?.identity ?? activeProvider?.client._identity
      getNFTStatus()
      setIdentity(curIdentity)
      checkHumanStatus(curIdentity)
      getNFTTokens(curIdentity)
   
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
      setError("Please connect a wallet.")
      setTimeout(() => {
        setError("")
      }, 2000)
    }
  }

  const mint = async () => {
    if (minted) return setMintOpen(false)
    if (loading || !identity) return
    localStorage.setItem(principal?.toString()!, "1")
    setLoading(true)
    try {
      const result: any = await (
        await popConnection(identity)
      ).actor.claimNFT(identity.getPrincipal(), window.location.hostname)
      getMetaDataByTokenIndex(result["Ok"])
    } catch (error) {
      setError("You have minted a PoP NFT.")
      setTimeout(() => {
        setError("")
        setMintOpen(false)
      }, 2500)
    }
  }

  const getNFTStatus = async () => {
    const statusResult:Info = await (
      await popNFTConnection(identity!)
    ).actor.pop_status()
    console.log("statusResult", statusResult)
    setNftStatus(statusResult);
  }

  const getNFTTokens = async (identity: SignIdentity) => {
    const tokensResult: any = await (
      await popNFTConnection(identity!)
    ).actor.tokens(getAccountId(identity.getPrincipal()))
    console.log("token result", tokensResult)
    // setLoading(true)
    if (hasOwnProperty(tokensResult, "Ok")) {
      if (tokensResult["Ok"].length > 0) {
        console.log(tokensResult["Ok"][0])
        getMetaDataByTokenIndex(tokensResult["Ok"][0])
      }
    } else {
      setLoading(false)
    }
  }

  const getMetaDataByTokenIndex = async (tokenIndex: number) => {
    const tokenIdentifier: any = getTokenIdentifier(
      // @ts-ignore
      process.env.POP_NFT_CANISTER_ID,
      tokenIndex,
    )
    console.log("tokenIdentifier", tokenIdentifier)
    setTokenIdentifier(tokenIdentifier)
    const nftDataResult: any = await (
      await popNFTConnection(identity!)
    ).actor.metadata(tokenIdentifier)
    if (hasOwnProperty(nftDataResult, "Ok")) {
      const metadata = nftDataResult["Ok"]["nonfungible"]["metadata"][0]
      const b64encoded = new TextDecoder("utf8").decode(
        new Uint8Array(metadata),
      )
      setNftImg(b64encoded)
      setMinted(true)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  const checkHumanStatus = async (identity: SignIdentity) => {
    const scope = prefix + qs.stringify(params)
    const result: any = await (
      await popConnection(identity!)
    ).actor.get_token(scope)
    console.log("checkHumanStatus token result", result)
    if (result.Ok && result.Ok.active) {
      clearInterval(timer)
      setActive(true)
    }
  }

  const sanCode = async () => {
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
      const result: any = await (
        await popConnection(identity!)
      ).actor.get_token(scope)
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
            href="https://astroxme.s3.ap-southeast-1.amazonaws.com/pop_o3hfl_me_plus_live_v1.0.0%2B3_202207011406.apk"
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
        <div>
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
            style={{ width: 360, height: 360 }}
            src={minted ? `data:image/png;base64,${nftImg}` : minting}
          />
          {/* <image href={`data:image/png;charset=utf-8;base64, ${nftImg}`} width="360" height="360"/> */}
        </p>
        {
          nftStatus ? (
            <p className="mg_t_10" style={{width: 360, textAlign: 'center'}}>{nftStatus.available - nftStatus.claimed} / {nftStatus.available} remaining</p>
          ) : null
        }
        </div>
      
        <div className="flex-1">
          <h1 className="c_white" style={{ marginBottom: 36 }}>
            Prove you’re a real person to mint a <strong>PoP</strong> NFT.
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
          <button className="mint-button" disabled={loading} onClick={tryMint}>
            Mint Now
          </button>
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
          <p style={{ marginBottom: 30 }}>2.Click "Continue" button.</p>
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
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            backgroundColor: "transparent",
            textAlign: "center",
          },
        }}
      >
        {minted ? (
          <Transfer
            close={() => setMintOpen(false)}
            nftImg={nftImg!}
            fromPrincipal={principal!}
            tokenIdentifier={tokenIdentifier}
            identity={identity!}
          />
        ) : (
          <>
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
                src={minted ? `data:image/png;base64,${nftImg}` : minting}
                alt=""
                style={{ width: 360, height: 360 }}
              />
            </p>
            <h1 className="c_white">{minted ? "Minted!" : "Verified!"}</h1>

            {minted ? (
              <p>
                You have minted a <strong>PoP</strong> NFT.
              </p>
            ) : (
              <p>
                You can mint a <strong>PoP</strong> NFT now.
              </p>
            )}
            <button onClick={mint} disabled={loading} className={`mint-button`}>
              {loading ? "Minting..." : minted ? "Close" : "Mint"}
            </button>
          </>
        )}
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

const client = createClient({
  providers: [
    new InternetIdentity(),
    new AstroX({
      providerUrl: "https://63k2f-nyaaa-aaaah-aakla-cai.raw.ic0.app",
    }),
  ],
  canisters: {},
  globalProviderConfig: {},
})

export default () => (
  <Connect2ICProvider
    /*
     * Disables dev mode in production
     * Should be enabled when using local canisters
     */
    /*
     * List of providers
     */
    client={client}
  >
    <App />
  </Connect2ICProvider>
)
