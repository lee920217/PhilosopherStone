"use client"
import "./globals.css";
import TrpcProvider from "@/app/_trpc/Provider";
import Header from "./_components/Header/Header";
import { Provider } from "react-redux";
import store from "@/store/store";
import { initConfig } from "@joyid/ckb";
import { ConnectProvider } from '@/hooks/useConnect';
import JoyIdConnector from '@/connectors/joyId';
import MetaMaskConnector from "@/connectors/metamask";
import { MaterialDesignContent, SnackbarProvider } from 'notistack'; 
import { styled } from "@mui/material";
import { GiftReceiveModalProvider } from "./context/GiftReceiveModalContext";
import DesktopHeader from "./_components/Header/DesktopHeader";
import Image from "next/image";
import { useState, useEffect } from "react";
import { bytifyRawString, createSpore, predefinedSporeConfigs, setSporeConfig} from "@spore-sdk/core";
import Script from "next/script";
import { commons, config, helpers } from "@ckb-lumos/lumos";
import { sporeConfig } from "@/utils/config";
import { registerCustomLockScriptInfos } from "@ckb-lumos/lumos/common-scripts/common";
import {createJoyIDScriptInfo, getDefaultConfig} from "@ckb-lumos/joyid"

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-success': {
    backgroundColor: '#1CB562',
    
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: '#E11717',
  },
}));

const _config = {
  autoConnect: true,
  connectors: [new JoyIdConnector(), new MetaMaskConnector()],
};



function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [width, setWidth] = useState<number>(0);
  // Accounts for mobile browser's address bar
  let testLumos = async () => {
    let connection = {
      "address":"ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqqy6hjcvd44k7s39rqt3pvhfnyerd7dgas50yqy0q",
      "ethAddress":"0x0D7c29d0F8a472c56de52C060b402D4DF32b2ce8",
      "keyType":"main_key",
      "alg":-7,
      "nostrPubkey":"4dc494cf203336c4ff6ad452003062e00fa564274c1e254ef261fee86efe1ed6",
      "pubkey":"1c27922d0642eae6acc57ff97bc4b00109f700f5d819436b7ee47ac8a122d03ab4589173e67e8c0bdf156c890b2095739d5d020fa19bafe00319cf98c487c248"
    }
    setSporeConfig(sporeConfig);
    config.initializeConfig(config.predefined.AGGRON4);
    
    registerCustomLockScriptInfos([createJoyIDScriptInfo(connection, getDefaultConfig(false))]);
    // config.initializeConfig(sporeConfig.lumos);
    
    console.log('--->', commons.common.__tests__.getLockScriptInfos());
    let spore = await createSpore({
      data: {
        contentType: 'text/plain',
        content: bytifyRawString('content'),
      },
      fromInfos: ['ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqqy6hjcvd44k7s39rqt3pvhfnyerd7dgas50yqy0q'],
      toLock: helpers.parseAddress("ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqqy6hjcvd44k7s39rqt3pvhfnyerd7dgas50yqy0q"),
      config: predefinedSporeConfigs.Testnet
    });
    // console.log(spore);
  }

  useEffect(() => {
    testLumos();
  }, [])

  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      setWidth(window.innerWidth);
    };
  
    window.addEventListener('resize', handleResize);
    handleResize();
  
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // setSporeConfig(predefinedSporeConfigs.Mainnet);
  // initConfig(JoyIDConfig)  
  return (
    <html lang="en" className="min-h-full min-w-full">
      <head>
        <link rel="icon" href="/svg/ps-favicon.svg" sizes="any" />
        <meta property="og:title" content="Philosopher's Stone" />
        <meta property="og:description" content="On-Chain Gifting Platform" />
        <meta property="og:image" content="/svg/ps-og.png" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-23YX4KSBQE"></Script>
        <Script id="23YX4KSBQE">
          {
            `
            window.dataLayer = window.dataLayer || [];
              {/** @ts-ignore */}
              function gtag(){dataLayer.push(arguments)};
              {/** @ts-ignore */}
              gtag('js', new Date());

              gtag('config', 'G-23YX4KSBQE');
            `
          }
        </Script>
      </head>
      <body className="bg-desktop-bg bg-no-repeat min-h-full min-w-full m-0">
        <Image 
          src='/svg/bg-line-top.svg'
          width={254}
          height={154}
          alt='decor lines'
          className="absolute top-0 right-0"
        />
        <Image 
          src='/svg/bg-line-bottom.svg'
          width={495}
          height={377}
          alt='decor lines'
          className="absolute bottom-0 left-0"
        />
         <Image 
          src='/svg/bg-middle.svg'
          width={1142}
          height={564}
          alt='decor lines'
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
        {/* <TrpcProvider>
          <ConnectProvider value={_config}>
            <GiftReceiveModalProvider>
              <SnackbarProvider
                autoHideDuration={5000} 
                Components={{
                  success: StyledMaterialDesignContent,
                  error: StyledMaterialDesignContent
                }}>
                <Provider store={store}>
                  {width >= 768 && <div className="sticky top-0 left-0 w-full mb-8 z-50"><DesktopHeader /></div>}
                  <div className="container relative flex flex-col min-h-screen mx-auto sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                    {width < 768 && <Header />}
                    <div 
                      className={`flex-1 flex flex-col w-full overscroll-y-contain bg-gradient-conic ${width < 768 ? 'rounded-none' : 'rounded-3xl'}`}
                      style={{boxShadow: '0px -2px 4px 0px rgba(0, 0, 0, 0.25)', minHeight: 'calc(var(--vh, 1vh) * 100 - 64px)'}}
                    >
                      {children}
                    </div>
                  </div>
                </Provider>
              </SnackbarProvider>
            </GiftReceiveModalProvider>
            
          </ConnectProvider>
        </TrpcProvider> */}
      </body>
    </html>
  );
}

export default RootLayout

