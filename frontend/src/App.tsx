import React, { useEffect, useRef, useState } from "react"
import { AstroX, InternetIdentity } from "@connect2ic/core/providers"
import {
  ConnectButton,
  ConnectDialog,
  Connect2ICProvider,
  useConnect,
} from "@connect2ic/react"
import "@connect2ic/core/style.css"
import logo from "./assets/logo.svg"
import banner from "./assets/banner.svg"
import minting from "./assets/mint.gif"
import back from "./assets/back.png"
import HELP from "./assets/help.svg"
import stopImg from "./assets/img.png"
import maxImg from "./assets/img1.png"
import Footer from "./components/Footer"
import qs from "querystring"
import { QRCodeSVG } from "qrcode.react"
import Modal from "react-modal"
import { martianNFTConnection, NFT_URL, popConnection, popNFTConnection } from "./service/connection"
import {
  getAccountId,
  encode_token_id,
  hasOwnProperty,
  validatePrincipalId,
} from "./utils"
import { ActorSubclass, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { createClient } from "@connect2ic/core"
import RateView from "./components/Rate"
import { idlFactory as liveIdl } from './candid/live_detect.idl';
import { _SERVICE as liveService } from './candid/live_detect';
import { idlFactory as nftIdl  } from './candid/Pop.did.idl';
import { _SERVICE as nftService } from './candid/Pop.did';

type Info = {
  claimed: number;
  available: number;
  reserve: number;
  supply: number;
}

type userNFTInfo = {
  tokenIndex: number,
  url: string,
  tokenIdentifier: string,
  type: 'pop' | 'martian'
}

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
let timer: NodeJS.Timeout | undefined

const prefix = "astrox://human?"

type TransferProps = {
  userToken: userNFTInfo;
  close: () => void
  popNftActor: ActorSubclass<nftService>
  martNftActor: ActorSubclass<nftService>
  fromPrincipal: string
  transferDone: () => void
}
const Transfer: React.FC<TransferProps> = (props) => {
  const { userToken, fromPrincipal, close, popNftActor, martNftActor } = props
  const [step, setStep] = useState<"main" | "transfer" | "success">("main")
  const [disabled, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [principalHelp, setPrincipalHelp] = useState(false)
  const [value, setValue] = useState<string>("")
  const [error, setError] = useState(
    "",
  )
  // We will open this transfer feature after NFT market integration.

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
      const curActor = userToken.type === 'pop' ? await popNftActor : martNftActor
      const result: any = await curActor.transfer({
        to: {
          principal: Principal.fromText(to),
        },
        notify: true,
        from: {
          principal: Principal.fromText(fromPrincipal!),
        },
        token: userToken.tokenIdentifier,
        memo: [],
        subaccount: [],
        amount: BigInt(1),
      })
      // setLoading(false)
      setStep("success")
      props.transferDone()
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
            src={`${userToken.url}`}
            alt=""
            style={{ width: 360, height: 360 }}
          />
        </p>
        <h1 className="mg_t_20 c_white">Success!</h1>
        <p className="c_white">
          You have transferred your NFT to the following wallet. NFT can
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
            src={`${userToken.url}`}
            alt=""
            style={{ width: 360, height: 360 }}
          />
        </p>
        <h1
          className="c_white mg_t_20"
          style={{ fontSize: 46, textAlign: "left" }}
        >
          NFT<br></br> Minted
        </h1>
        <p>You have minted and can trade NFT on Yumi marketplace.</p>
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
                  alignItems: "flex-end",
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
                <a>
                  <img
                    src={back}
                    alt=""
                    style={{ width: 30, height: 30, marginRight: 10 }}
                    onClick={() => setStep("main")}
                  />
                </a>
                <div className="flex-1">
                  <h1 className="c_white">Transfer NFT</h1>
                </div>
              </div>

              <p>
                NFT is now supported by Yumi marketplace. Please transfer your NFT to you wallet that your used to log into Yumi.
              </p>
              <div className="flex">
                <div className="flex-1">
                  <input
                    type="text"
                    // disabled
                    placeholder="Enter Principal ID"
                    onChange={(e) => {
                      setValue(e.target.value)
                      checkFormat(e.target.value)
                    }}
                  />
                </div>
                <a>
                  <img src={HELP} alt="" style={{ width: 24, height: 24, marginLeft: 10, marginTop: 50 }} onClick={() => setPrincipalHelp(true)} />
                </a>
              </div>
              {error ? (
                <p className="mg_t_10" style={{ color: "#FF6363" }}>
                  {error}
                </p>
              ) : null}
              <div
                className="flex"
                style={{
                  justifyContent: "center",
                  alignItems: "flex-end",
                  marginTop: 290,
                }}
              >
                <a className="button" onClick={close}>
                  Close
                </a>
                <button
                  onClick={() => transferNFT(value!)}
                  disabled={disabled || loading}
                  className="mint-button"
                >
                  {loading ? "Transferring..." : "Transfer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Modal
        ariaHideApp={false}
        isOpen={principalHelp}
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            backgroundColor: "transparent",
            textAlign: "center",
          },
        }}
      >
        <div className="content" style={{ borderRadius: 10, overflow: 'hidden' }}>
          <h2 className="c_white">You can find it in Profile page of <a style={{ textDecoration: 'underline' }} className="c_brand" href="https://yumi.io" target="_blank">Yumi</a></h2>
          <button
            onClick={() => setPrincipalHelp(false)}
            className="mint-button"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

let userNFTInfo: userNFTInfo[] = [];
function App() {
  const [link, setLink] = useState("")
  const [open, setOpen] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [nftStatus, setNftStatus] = useState<Info>()
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const { principal, activeProvider, isConnected } = useConnect()
  const [minted, setMinted] = useState(false);
  const [claimable, setClaimable] = useState<undefined | number>()
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [noticeOpen1, setNoticeOpen1] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [userTokens, setUserTokens] = useState<undefined | userNFTInfo[]>()
  const [selectToken, setSelectToken] = useState<undefined | userNFTInfo>()
  const liveActor = useRef<ActorSubclass<liveService>>()
  const popNftActor = useRef<ActorSubclass<nftService>>()
  const martNftActor = useRef<ActorSubclass<nftService>>()
  // const [tokenIdentifier, setTokenIdentifier] = useState<string>("")
  // const [nftImg, setNftImg] = useState<string>()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const params = {
    principal,
    host: window.location.hostname,
  }

  useEffect(() => {
    getNFTStatus()
    setActive(false)
    setUserTokens(undefined)
    setClaimable(undefined)
    setSelectToken(undefined)
    setUserTokens(undefined)
    userNFTInfo = []
    if (isConnected) {
      console.log('activeProvider', activeProvider)
      const img = new Image()
      img.src = minting
      init()
 
    }
  }, [principal])

  const init = async () => {
    const result = await activeProvider?.createActor<liveService>('d2fsh-3qaaa-aaaai-acmkq-cai', liveIdl)
    // @ts-ignore
    liveActor.current = result.value
    const result1 = await activeProvider?.createActor<nftService>('3hzxy-fyaaa-aaaap-aaiiq-cai', nftIdl)
    // @ts-ignore
    martNftActor.current = result1.value
    const result2 = await activeProvider?.createActor<nftService>('xpegl-kaaaa-aaaah-abcrq-cai', nftIdl)
    // @ts-ignore
    popNftActor.current = result2.value
    console.log('liveActor', liveActor.current)
    console.log('mart',martNftActor.current)
    console.log('pop',popNftActor.current)
    // @ts-ignore
    getNFTTokens()
    getMartianNFTTokens();
    getClaimable();
    checkHumanStatus()
  }

  const initNFT = () => {
    userNFTInfo = []
    getNFTTokens()
    getMartianNFTTokens();
  }

  const tryMint = () => {
    // setMinted(true)
    // setMintOpen(true)
    // return setNoticeOpen(true);
    console.log(nftStatus)
    if (nftStatus && nftStatus?.claimed > nftStatus?.available && !minted) return setNoticeOpen(true)
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
    console.log(nftStatus?.claimed)
    console.log(nftStatus?.available)
    console.log(nftStatus)
    if (nftStatus && nftStatus?.claimed > nftStatus?.available && !minted) return setNoticeOpen(true)
    if (!(claimable && claimable > 0)) return setMintOpen(false)
    if (loading) return
    setLoading(true)
    try {
      // const result: any = await (
      //   await popConnection(identity)
      // ).actor.claimNFT(window.location.hostname)
      const result: any = await popNftActor.current?.claimWithWhitelist();
      initNFT()
      getClaimable()
      setMintOpen(false)
      getNFTStatus()
    } catch (error) {
      console.log(error)
      setError("You have minted a PoP NFT.")
      setTimeout(() => {
        setError("")
        setMintOpen(false)
      }, 2500)
      getNFTStatus();
    }
  }

  const getNFTStatus = async () => {
    if(!popNftActor.current)return;
    const supplyResult = await popNftActor.current?.supply('test')
    let claimed, reserve, supply, available;
    if (hasOwnProperty(supplyResult!, 'ok')) {
      console.log("supplyResult", supplyResult['ok'])
      supply = supplyResult['ok']
    }
    claimed = await popNftActor.current?.getNextClaimId();
    available = await popNftActor.current?.getSupplyClaim();

    const statusResult: Info = {
      claimed,
      reserve: 0,
      available,
      supply: Number(supply) ?? 0
    }
    console.log('statusResult', statusResult)
    setNftStatus(statusResult)
  }

  const getNFTTokens = async () => {
    if(!popNftActor.current) return 
    const tokensResult: any = await popNftActor.current.tokens(getAccountId(Principal.fromText(principal!) ))
    console.log("token result", tokensResult)
    setLoading(true)
    if (hasOwnProperty(tokensResult, "ok")) {
      if (tokensResult["ok"].length > 0) {
        console.log(tokensResult["ok"])
        const tokenIndexs = tokensResult["ok"]

        for (let i = 0; i < tokenIndexs.length; i++) {
          const tokenIdentifier: any = encode_token_id(
            // @ts-ignore
            Principal.fromText(process.env.POP_NFT_CANISTER_ID),
            tokenIndexs[i],
          )
          const url = await getPopUrlByTokenIndex(tokenIdentifier)
          const obj: userNFTInfo = {
            tokenIndex: tokenIndexs[i],
            tokenIdentifier,
            url,
            type: 'pop'
          };
          userNFTInfo.push(obj)
        }
        console.log(userNFTInfo)
        setUserTokens(userNFTInfo)

      }
    } else {
      setLoading(false)
    }
  }

  const getMartianNFTTokens = async () => {
    if(!martNftActor.current) return;
    const tokensResult: any = await martNftActor.current.tokens(getAccountId(Principal.fromText(principal!)))
    console.log("martian token result", tokensResult)
    setLoading(true)
    if (hasOwnProperty(tokensResult, "ok")) {
      if (tokensResult["ok"].length > 0) {
        console.log(tokensResult["ok"])
        const tokenIndexs = tokensResult["ok"]
        for (let i = 0; i < tokenIndexs.length; i++) {
          const tokenIdentifier: any = encode_token_id(
            // @ts-ignore
            Principal.fromText(process.env.MARTIAN_NFT_CANISTER_ID),
            tokenIndexs[i],
          )
          const url = await getMartianUrlByTokenIndex(tokenIdentifier)
          const obj: userNFTInfo = {
            tokenIndex: tokenIndexs[i],
            tokenIdentifier,
            url,
            type: 'martian'
          };
          userNFTInfo.push(obj)
        }
        setUserTokens(userNFTInfo)
      }
    } else {
      setLoading(false)
    }
  }


  const getMartianUrlByTokenIndex = async (tokenIdentifier: string) => {
    console.log('tokenIdentifier', tokenIdentifier)
    if(!martNftActor.current) return;
    const nftDataResult: any = await martNftActor.current.metadata(tokenIdentifier)
    console.log('getMartianUrlByTokenIndex result', nftDataResult)
    if (hasOwnProperty(nftDataResult, "ok")) {
      const metadata = nftDataResult["ok"]["nonfungible"]["metadata"][0]
      const b64encoded = new TextDecoder("utf8").decode(
        new Uint8Array(metadata),
      )
      const url = JSON.parse(b64encoded).url
      console.log("b64encoded", b64encoded)
      setLoading(false)
      return url;
    } else {
      setLoading(false)
      return undefined;
    }
  }


  const getPopUrlByTokenIndex = async (tokenIdentifier: string) => {
    console.log("tokenIdentifier", tokenIdentifier)
    if(!popNftActor.current) return;
    const nftDataResult: any = await popNftActor.current.metadata(tokenIdentifier)
    if (hasOwnProperty(nftDataResult, "ok")) {
      console.log("nftDataResult", nftDataResult)
      const metadata = nftDataResult["ok"]["nonfungible"]["metadata"][0]
      const b64encoded = new TextDecoder("utf8").decode(
        new Uint8Array(metadata),
      )
      const url = JSON.parse(b64encoded).url
      setLoading(false)
      return url;
    } else {
      setLoading(false)
      return undefined;
    }
  }

  const getClaimable = async () => {
    if(!popNftActor.current )return;
    const result = await popNftActor.current.getClaimable(Principal.fromText(principal!));
    console.log('claim ', result)
    setClaimable(Number(result))
  }

  const checkHumanStatus = async () => {
    if(!popNftActor.current )return;
    const scope = prefix + qs.stringify(params)
    const result: any = await liveActor.current?.get_token(scope)
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
    // return setOpen(true)
    // const startResult: any = await connection.actor.detect_start(scope, 0)
    // console.log("startResult", startResult)
    // setTimeout(async () => {
    //   const result = await connection.actor.detect_end(scope, startResult["Ok"])
    //   console.log(result)
    // }, 4000)
    clearInterval(timer)
    timer = setInterval(async () => {
      const result: any = await liveActor.current?.get_token(scope)
      console.log(result)
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
            href="https://astroxme.s3.ap-southeast-1.amazonaws.com/pop_o3hfl_me_plus_v1.0.0%2B4_202207052356.apk"
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
      <div className="flex">
        <div>
          <p
            style={{
              borderRadius: 20,
              overflow: "hidden",
              width: 247,
              height: 247,
              marginRight: 100,
            }}
          >
            {/* <img
              style={{ width: 360, height: 360 }}
              src={minted ? `data:image/png;base64,${nftImg}` : minting}
            /> */}
            <img
              style={{ width: 247, height: 247 }}
              src={minting}
            />
          </p>
          {nftStatus ? (
            <div className="flex mg_t_10" style={{ width: 247, justifyContent: 'space-between' }}>
              <p>
                {nftStatus.supply - nftStatus.claimed} / {nftStatus.supply}{" "}remaining
                {/* 8314 / 8800 */}
              </p>
              <a className="c_brand" onClick={() => setRateOpen(true)} style={{ textDecoration: 'underline' }}>Volume &gt;</a>
            </div>
          ) : null}
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
              <div>
                <p className="c_brand" style={{ marginLeft: 10 }}>Principal ID: </p>
                <p className="c_white" style={{ marginLeft: 10 }}>
                  {principal}
                </p>
              </div>
            ) : null}
          </div>
          <div className="flex">
            <button className="mint-button" disabled={loading || !(claimable && claimable > 0)} onClick={tryMint}>
              Mint Now
            </button>
            {claimable !== undefined && active ? (
              <p className="c_white" style={{ marginLeft: 10, marginTop: 45 }}>
                {
                  claimable === 0 ? 'You have minted all your NFT.' : <span>You can mint <span className="c_brand">{claimable}</span> NFT now.</span>
                }
              </p>
            ) : null}
          </div>
          {
            userTokens ? (
              <>
                {
                  userTokens.filter(o => o.type === 'pop').length > 0 ? (
                    <div style={{ marginTop: 60 }}>
                      <p className="c_white" style={{ marginRight: 10 }}>
                        PoP NFT:
                      </p>
                      <div className="flex">

                        <div className="flex-1 flex">
                          {
                            userTokens.filter(o => o.type === 'pop').map((tokenInfo) => {
                              return (
                                <div style={{ width: 137, marginRight: 40 }}>
                                  <img
                                    style={{ width: 137, height: 137, borderRadius: 10, display: 'block' }}
                                    src={tokenInfo.url}
                                  />

                                  <button
                                    className="mint-button"
                                    style={{
                                      width: '100%',
                                      marginTop: 20
                                    }}
                                    onClick={() => {
                                      setSelectToken(tokenInfo)
                                      setTransferOpen(true)
                                    }}>
                                    Transfer
                                  </button>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </div>
                  ) : null
                }
                {
                  userTokens.filter(o => o.type === 'martian').length > 0 ? (
                    <div style={{ marginTop: 60 }}>
                      <p className="c_white" style={{ marginRight: 10 }}>
                        Martian NFT:
                      </p>
                      <div className="flex">
                        <div className="flex-1 flex">
                          {
                            userTokens.filter(o => o.type === 'martian').map((tokenInfo) => {
                              return (
                                <div style={{ width: 137, marginRight: 40 }}>
                                  <img
                                    style={{ width: 137, height: 137, borderRadius: 10, display: 'block' }}
                                    src={tokenInfo.url}
                                  />

                                  <button
                                    className="mint-button"
                                    style={{
                                      width: '100%',
                                      marginTop: 20
                                    }}
                                    onClick={() => {
                                      setSelectToken(tokenInfo)
                                      setTransferOpen(true)
                                    }}>
                                    Transfer
                                  </button>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </div>
                  ) : null
                }
              </>
            ) : null
          }
        </div>
      </div>
      <Footer />
      <Modal
        ariaHideApp={false}
        isOpen={noticeOpen1}
        contentLabel="Example Modal"
        style={customStyles}
      >
        <div className="modal-content">
          <h1 className="c_white">Notice</h1>
          <p className="c_white">We are upgrading now. Therefore login with ME wallet is temporarily unavailable. Your NFTs still remain safe in your wallet.
            Please stay tuned with our latest announcement and we will be back soon.</p>
          <p style={{ textAlign: "center" }}>
            <a onClick={() => setNoticeOpen1(false)} className="button">
              OK
            </a>
          </p>
        </div>
      </Modal>

      <Modal
        ariaHideApp={false}
        isOpen={open}
        contentLabel="Example Modal"
        style={customStyles}
      >
        {/* <div className="modal-content">
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
        </div> */}
        <div className="modal-content">
          <h1 className="c_white">Notice</h1>
          <p className="c_white">The first round is ended. Please wait for the next round.</p>
          <p style={{ textAlign: "center" }}>
            <a onClick={() => setOpen(false)} className="button">
              OK
            </a>
          </p>
        </div>
      </Modal>
      <Modal
        ariaHideApp={false}
        isOpen={transferOpen}
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            backgroundColor: "transparent",
            textAlign: "center",
          },
        }}
      >
        <Transfer
          close={() => setTransferOpen(false)}
          userToken={selectToken!}
          fromPrincipal={principal!}
          popNftActor={popNftActor.current!}
          martNftActor={martNftActor.current!}
          transferDone={() => {
            getNFTStatus()
            initNFT()
          }}
        />
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
            src={minting}
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
      </Modal>
      <Modal
        ariaHideApp={false}
        isOpen={noticeOpen}
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            backgroundColor: "transparent",
            textAlign: "center",
          },
        }}
      >
        <div style={{ width: 460, borderRadius: 10, overflow: "hidden" }}>
          {/* <img src={stopImg} alt="" style={{ marginTop: 30, display: 'block', maxWidth: '100%' }} />
          <div className="content">
            <h2 className="c_white">We'll be back</h2>
            <p>We are busy updating the event for you and will be back soon.</p>
            <button
              onClick={() => setNoticeOpen(false)}
              className={`mint-button`}
            >
              Close
            </button>
          </div> */}
          <img
            src={maxImg}
            alt=""
            style={{ marginTop: 30, display: "block", maxWidth: "100%" }}
          />
          <div className="content">
            <h2 className="c_white">Maximum number of claims</h2>
            <p>The NFT issued in this round have been minted. Please stay tuned and join our Discord to get the latest news!</p>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <a onClick={() => setNoticeOpen(false)} className="button">
                Close
              </a>
              <a href="https://discord.gg/4f43MwcDRS" target="_blank">
                <button
                  onClick={() => setNoticeOpen(false)}
                  className={`mint-button`}
                >
                  Join Discord
                </button>
              </a>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        ariaHideApp={false}
        isOpen={rateOpen}
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            backgroundColor: "transparent",
            textAlign: "center",
          },
        }}
      >
        <RateView close={() => setRateOpen(false)} />
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
      // providerUrl: "https://63k2f-nyaaa-aaaah-aakla-cai.raw.ic0.app",
      providerUrl: "http://localhost:8080",
      noUnify: true,
    }),
  ],
  canisters: {},
  globalProviderConfig: {
    whitelist: ['xpegl-kaaaa-aaaah-abcrq-cai', '3hzxy-fyaaa-aaaap-aaiiq-cai', 'd2fsh-3qaaa-aaaai-acmkq-cai'],
  },
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
