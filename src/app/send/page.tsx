/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { transferSpore as _transferSpore } from '@spore-sdk/core';
import { useSporeQuery } from '@/hooks/useQuery/useQuerybySpore';
import { BI, OutPoint, config, helpers } from '@ckb-lumos/lumos';
import {
  fetchBlindBoxAPI,
  fetchGiftAPI,
  fetchHashkeyAPI,
  fetchHistoryAPI,
  fetchWalletAPI,
} from '@/utils/fetchAPI';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Image from 'next/image';
import useLoadingOverlay from '@/hooks/useLoadOverlay';
import LoadingOverlay from '../_components/LoadingOverlay/LoadingOverlay';
import { useConnect } from '@/hooks/useConnect';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useSporesByAddressQuery } from '@/hooks/useQuery/useSporesByAddress';
import { GiftProps } from '@/types/Gifts';
import { SporeItem } from '@/types/Hashkey';
import { GenerateHashKey } from '@/utils/common';
import { sporeConfig } from '@/utils/config';
import Button from '@/app/_components/Button/Button';
import { createTransactionFromSkeleton } from '@ckb-lumos/lumos/helpers';
import { signRawTransaction } from '@joyid/ckb';
import useQueryDobById from '@/hooks/useQueryDobById';
import { getPrevBgTrait } from '@/utils/getMedia';
import DobImage from '../_components/common/DobImage/DobImage';
import { getImageUrlById } from '@/utils/backgroundImageSettings';
import { ccc } from '@ckb-ccc/connector-react';
import { QueryDobByAdderssItem } from '@/hooks/useQueryDobByAddress';

const SendGift: React.FC = () => {
  const router = useRouter();

  const [message, setMessage] = useState<string>('');
  const [toWalletAddress, setToWalletAddress] = useState<string>('');
  const [hasGift, setHasGift] = useState<string>();
  const [occupied, setOccupied] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Wallet Address' | 'URL'>('URL');
  const [hashKey, setHashKey] = useState<string>('');
  const [imgData, setImgData] = useState<string>();
  const [walletAddress, setWalletAddress] = useState<string>();

  const { data: spore, isLoading: isSporeLoading } = useSporeQuery(
    hasGift as string,
  );
  const { data: dobData, loading: isDobLoading } = useQueryDobById(
    hasGift as string,
  );
  const {
    isVisible,
    showOverlay,
    hideOverlay,
    progressStatus,
    setProgressStatus,
  } = useLoadingOverlay();

  const searchParams = useSearchParams();
  const signer = ccc.useSigner();
  const type = searchParams.get('type');
  const texts = [
    'Unmatched Flexibility and Interopera­bility',
    'Supreme Security and Decentrali­zation',
    'Inventive Tokenomics',
  ];

  const getBlindBox = async (boxName: string) => {
    const data = await fetchBlindBoxAPI({
      action: 'getBoxByName',
      key: walletAddress!!,
      name: boxName,
    });
    return data.box.boxData;
  };

  const _getRandomIndex = (length: number) => {
    return Math.floor(Math.random() * length);
  };

  const _randomExtractGift = async () => {
    if (type !== 'BlindBox') return;
    const boxName = searchParams.get('name');
    if (!boxName) return;
    let selectedBlindBox = await getBlindBox(boxName);
    let randomSelect =
      selectedBlindBox[_getRandomIndex(selectedBlindBox.length)];
    if (!randomSelect) return;
    setHasGift(randomSelect.id);
  };

  const generateKey = (id: string) => {
    let _hashkey = new Date().getTime().toString() + id;
    setHashKey(GenerateHashKey(_hashkey));
  };

  const formatNumberWithCommas = (num: number) => {
    const numStr = num.toString();
    const reversedNumStr = numStr.split('').reverse().join('');
    const commaInserted = reversedNumStr.replace(/(\d{3})(?=\d)/g, '$1,');
    setOccupied(commaInserted.split('').reverse().join(''));
  };

  useEffect(() => {
    if (spore && spore.id && activeTab === 'URL' && hashKey === '') {
      generateKey(spore.id);
    }
  }, [activeTab, hashKey, spore]);

  useEffect(() => {
    if (type !== 'BlindBox') {
      const hasGiftValue = searchParams.get('hasGift');
      setHasGift(hasGiftValue ?? '');
    }
  }, [searchParams, type]);

  useEffect(() => {
    if (dobData) {
      setImgData(getPrevBgTrait(dobData[0].dobDecodeOutput?.render_output!!));
    }
  }, [dobData]);

  useEffect(() => {
    if (signer) {
      (async () => {
        setWalletAddress(await signer.getRecommendedAddress());
      })();
    }
  }, [signer]);

  const transferSpore = useCallback(
    async (...args: Parameters<typeof _transferSpore>) => {
      const { txSkeleton, outputIndex } = await _transferSpore(...args);
      const txHash = await signer?.sendTransaction(
        ccc.Transaction.fromLumosSkeleton(txSkeleton),
      );
      return {
        txHash,
        index: BI.from(outputIndex).toHexString(),
      } as OutPoint;
    },
    [signer],
  );

  const transferSporeMutation = useMutation({
    mutationFn: transferSpore,
    onSuccess: () => {},
    onError: error => {
      enqueueSnackbar('Gift Send Failed', { variant: 'error' });
    },
  });

  const callSaveAction = async (key: string, id: string, value: GiftProps) => {
    const response = await fetchGiftAPI({ action: 'save', key, id, value });
    return response.data;
  };

  const saveHashKey = async (key: string, record: SporeItem) => {
    const response = await fetchHashkeyAPI({
      action: 'saveHashkey',
      key,
      record,
    });
  };

  async function PutIntoProcessList(
    key: string,
    id: string,
    to: string,
    giftId: string,
  ) {
    const response = await fetchHistoryAPI({
      action: 'setHistory',
      key,
      record: {
        actions: 'send',
        status: 'pending',
        sporeId: giftId,
        from: walletAddress!!,
        to: to,
        id: id,
      },
    });
    return response;
  }

  const handleSubmit = useCallback(
    async (values: { to: string }) => {
      showOverlay();
      if (
        !walletAddress ||
        !dobData ||
        (!values.to && activeTab === 'Wallet Address') ||
        !spore
      ) {
        return;
      }
      //update wallet address by activeTab
      let toAddress = values.to;
      if (activeTab === 'URL') {
        let rlt = await fetchWalletAPI({
          action: 'getAddress',
        });
        toAddress = rlt.address;
      }
      let rlt = await transferSporeMutation.mutateAsync({
        outPoint: spore.cell?.outPoint!,
        fromInfos: [walletAddress!!],
        toLock: helpers.parseAddress(toAddress, {
          config: sporeConfig.lumos,
        }),
        config: sporeConfig,
        useCapacityMarginAsFee: true,
      });
      await saveHashKey(hashKey, {
        sporeId: `0x${dobData[0].id}`,
        senderWalletAddress: walletAddress,
        txHash: rlt.txHash,
        dobData: dobData[0],
      });

      // await PutIntoProcessList(walletAddress!!, rlt.txHash, toAddress, spore.id);
      await callSaveAction(toAddress, spore.id, {
        giftMessage: message,
        dobData: dobData!![0],
      });

      setProgressStatus('done');
      enqueueSnackbar('Gift Send Successful', { variant: 'success' });
      if (activeTab === 'URL') {
        router.push(`/finished?tx=${rlt.txHash}&type=URL&key=${hashKey}`);
      } else {
        router.push(`/finished?tx=${rlt.txHash}&type=Wallet&key=${hashKey}`);
      }
    },
    [transferSporeMutation],
  );

  useEffect(() => {
    if (!isSporeLoading) {
      formatNumberWithCommas(
        BI.from(spore?.cell?.cellOutput.capacity).toNumber() / 10 ** 8,
      );
    }
  }, [isSporeLoading, spore?.cell?.cellOutput.capacity]);

  return (
    <div className="container universe-bg mx-auto rounded-3xl">
      <LoadingOverlay
        isVisible={isVisible}
        texts={texts}
        progressStatus={progressStatus}
      />
      <div>
        <div className="flex justify-center mt-8 flex-col items-center text-white001">
          <h3 className="font-Montserrat text-hd3mb text-center mb-6">
            Send {type === 'BlindBox' ? 'Blind Box' : 'Gift'}
          </h3>
          {type === 'BlindBox' ? (
            <>
              {isSporeLoading ? (
                <img
                  src={'/svg/blindbox-animation-1.svg'}
                  className="animate-wiggle"
                  width={164}
                  height={120}
                  alt={'unkown-animation'}
                />
              ) : (
                <img
                  src={'/svg/blindbox-animation-2.svg'}
                  width={164}
                  height={120}
                  alt={'unkown-animation'}
                />
              )}
            </>
          ) : (
            <>
              {dobData && imgData && (
                <DobImage
                  bgUrl={getImageUrlById(dobData[0].clusterId) || ''}
                  imgUrl={`https://dobfs.dobby.market/${imgData}`}
                ></DobImage>
              )}
            </>
          )}
          <p className="text-white001 font-SourceSanPro text-hd2mb mt-4">
            {type === 'BlindBox' ? `******` : `${occupied}`} CKB
          </p>
          <p className="text-white001 font-SourceSanPro text-body1mb text-white005 mt-2">
            {type === 'BlindBox'
              ? `************`
              : `${hasGift?.slice(0, 10)}......${hasGift?.slice(
                  hasGift.length - 10,
                  hasGift.length,
                )}`}
          </p>
        </div>
        <div className="flex flex-col px-4">
          <p className="text-white001 font-SourceSanPro text-labelbdmb mt-4">
            Gift Message
          </p>
          <textarea
            id="message"
            autoFocus
            value={message}
            className="w-full h-24 border border-white009 rounded-lg bg-primary008 mt-2 px-4 py-2 text-white001"
            onChange={e => setMessage(e.target.value)}
          />
        </div>
        <div className="flex flex-col px-4 mt-6">
          <p className="text-white001 font-SourceSanPro text-labelbdmb">
            Delivery method
          </p>
          <div className="flex rounded-md bg-primary011 p-1 mt-2">
            <button
              className={`flex-1 py-3 font-SourceSanPro ${
                activeTab === 'URL'
                  ? 'bg-primary010 text-labelbdmb text-white001'
                  : 'text-labelmb text-white005'
              } rounded-md `}
              onClick={() => {
                setActiveTab('URL');
              }}
            >
              URL
            </button>
            <button
              className={`flex-1 py-3 font-SourceSanPro ${
                activeTab === 'Wallet Address'
                  ? 'bg-primary010 text-labelbdmb text-white001'
                  : 'text-labelmb text-white005'
              } rounded-md`}
              onClick={() => setActiveTab('Wallet Address')}
            >
              Wallet Address
            </button>
          </div>
        </div>
        {activeTab === 'URL' && (
          <>
            <div className="flex flex-col px-4">
              <p className="text-white001 font-SourceSanPro text-body1bdmb mt-4">
                Wallet key
              </p>
              <input
                id="walletAddress"
                value={hashKey}
                onChange={e => setHashKey(e.target.value)}
                className="w-full h-12 border border-white009 rounded-lg bg-primary008 mt-2 px-4 text-white001"
              />
            </div>

            <p className="px-4 mt-4 text-white001 font-SourceSanPro text-labelmb">
              For URL delivery, click &#39;Pack Gift&#39; below to get a
              shareable link.
            </p>
          </>
        )}
        {activeTab === 'Wallet Address' && (
          <>
            <div className="flex flex-col px-4">
              <p className="text-white001 font-SourceSanPro text-body1bdmb mt-4">
                Recipient’s wallet address*
              </p>
              <input
                id="walletAddress"
                placeholder="E.g. 0xAbCdEfGhIjKlMnOpQrStUvWxYz0123456789"
                value={toWalletAddress}
                onChange={e => setToWalletAddress(e.target.value)}
                className="w-full h-12 border border-white009 rounded-lg bg-primary008 mt-2 px-4 text-white001"
              />
            </div>
          </>
        )}
        <div className="px-4">
          <Button
            type="solid"
            label="Pack Gift"
            onClick={() => {
              handleSubmit({
                to: toWalletAddress || GenerateHashKey(hasGift!!),
              });
            }}
            disabled={!toWalletAddress && activeTab !== 'URL'}
            className="px-4 my-8"
          />
        </div>
      </div>
    </div>
  );
};

export default SendGift;
