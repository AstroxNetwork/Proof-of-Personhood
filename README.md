# Proof of Personhood

**a Sybil-proof identity system powered by decentralized AI human detection**


## Demo

Click here to try: [PoP demo](https://yakuo-miaaa-aaaai-acjfq-cai.ic0.app/)

Watch demo: [PoP demo video](https://www.youtube.com/embed/aDZQ94zmZg8)

## Inspiration

One of the most challenging Web3 issues is known as the Sybil attack.  A Sybil attack is when a user leverages multiple crypto wallets and web2 social media identity to gain multiple positions with an unfair advantage of systems.

Examples of Sybil attacks are quite common in Web3, such as:

- Token airdrops are exploited by bot-controlled wallets to gain a large percentage of community tokens, diluting the value for those left holding their bags when the bad actor sells off all their rewarded tokens as their core objective is to game the system. Here is a recent example. The same applies to NFT whitelist as well.

- Twitter, Discords and Telegrams have been plagued with phishing links sent by bot accounts luring a user to interact with malicious smart contracts to steal their crypto assets.

In addition, many efforts are trying to build social impact projects, as well as crypto as a public good, all requiring a decentralized Identity layer with Sybil-resistance as the building block of the projects:

- Universal Basic Income (UBI) aiming to support sustainable development; and

- 1 human 1 vote for Web3 DAO governance avoiding plutocracy. Examples like Optimism’s the [citizens’ house](https://twitter.com/optimismPBC/status/1519001576677036032?s=20&t=rlLHdqA1JokWVC4HKxO2jA)

To prevent Sybil attack, both centralized and decentralized identity solutions exist with different pros and cons.

Centralized solutions like [Blockpass](https://www.blockpass.org/) require users to KYC (Know Your Customer) and provide their sensitive personal information such as government IDs, addresses, photos, etc without any understanding of how that information will be secured. Such private information is stored in centralized servers, which are prone to data leak hacks.

Decentralized solutions such as [ProofofHumanity](https://www.proofofhumanity.id/). [BrightID](https://www.brightid.org/) doesn’t require government IDs and all rely on other human users to distinguish humans from bots. They use different mechanism designs with various economic incentives, and also human coordination is required. BrightID users need to attend a Zoom group verification call at specific timeslots and ProofofHumanity requires users to reveal a selfie video with their ETH address online to make a public announcement. It’s not easy for normal users, so both solutions have been around for a couple of years with only modest success in adaption.

## What it does

Proof of Personhood is a Sybil-proof identity system powered by decentralized AI human detection. It allows:  

- a user to verify he or she is not a bot by answering a combination of random challenges with sequential simple human actions like simultaneous face gestures and voice comments;

- dApps or Web2.0 apps can require users to complete Proof of Personhood to avoid a Sybil attack;

- Privacy preserved. No sensitive information (user face image or voice) ever leaves the user's device. The on-device AI algorithm and the algorithm running on the IC canister together perform a Reverse Turing Test, in a decentralized way. 

## How we built it

#### Frontend

The Proof of Personhood is integrated with AstroX ME mobile wallet app (soon to be released) as an advanced add-on feature (under the Experiment menu). The mobile app is built with Flutter using [Agent_Dart](https://github.com/AstroxNetwork/agent_dart) to interact with Internet Computer. 

#### AI: Human Liveness Detection  

The core components are face detection and face tracking based on Deep Neural Network (DNN) to detect real human interaction. A random sequence of face gestures are computed at the canister and sent to app to challenge the user to perform. So photo, pre-recorded video or paper mask attacks can be prevented. 

In addition, a random number speech challenge is also required with simultaneous face tracking. 

During the challenges, none of the face image or voice data are leaving the device. Only the results of the liveness detection are sent back to the canister to determine the final result. 

See the attached picture 1 for Human Liveness AI Detection Flow.

#### Backend

The Proof of Personhood canister is built using Rust. It performs two tasks: 

- Compute interactive random challenges and send to app;

- Authenticate a web app that needs a user's proof of personhood. A user can scan a QRcode generated on the web to perform the proof of personhood. (See the attached picture 2 for flowchart)

## Challenges we ran into

Originally we wanted to run the entire AI on canister with a "thin client" only, so that a user can use proof of personhood from a web browser, and also *on-chain AI models* would be so cool to unlock many new use cases. However, we found out DNN is too computation-intensive to run on today's canister. 

## Accomplishments that we're proud of

We have built an end-to-end Sybil-proof identity on the Internet Computer using AI liveness detection as well as the demo web app in just less than 3 weeks!

## What we learned

We are a team of experienced engineers and entrepreneurs who have built Internet-scale applications in the past 10 years, and have started to build on Internet Computer since last year. 

During the project, we learned a lot about the problem space of Sybil-proof decentralized identity and previous attempts. Dfinity's [People Parties](https://forum.dfinity.org/t/long-term-r-d-people-parties-proof-of-human-proposal/9636) project has provided us with a lot insights and  inspired us to try a different approach using a combination of various mature technologies for faster trial-and-error. 

We also learned a lot about the existing AI solutions. Although the solutions are mature in some use cases (especially face detection and voice), some assumptions do not apply to web3. So more innovations are needed to bridge the two technologies.  

## What's next for Proof of Personhood

We intend to make Proof of Personhood a public good for a Sybil-attack-free Web3 world. To make it a reality, there are a few milestones ahead: 

1. Drive user growth and adaption of Web3 apps using Proof of Personhood service;
2. Incorporate additional methods like mechanism design/incentive, or social graph to combat new Sybil-attack vectors, while striking a good balance for ease of use for end-users and effectiveness of Sybil-resistance;
3. Explore a good business model or tokenomics to support the long-term health of proof of personhood (R&D cost, canister cycle costs, etc).
