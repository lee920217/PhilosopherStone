import { HashkeyObj } from '@/types/Hashkey';
import { formatString } from '@/utils/common';
import { enqueueSnackbar } from 'notistack';
import React from 'react';

interface HistoryListProps {
  HashkeyList: HashkeyObj[];
}

const HashkeyList: React.FC<HistoryListProps> = ({ HashkeyList }) => {
  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.protocol}//${window.location.host}/collect/${textToCopy}`,
      );
      enqueueSnackbar('Copied Successful', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Copied Fail', { variant: 'error' });
    }
  };
  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
        <div className="flex text-white001 border-b border-white009 text-white003 py-2">
          <div className="flex-1 font-SourceSanPro text-labelmb px-2 py-1">
            Transaction #
          </div>
          <div className="w-32 font-SourceSanPro text-labelmb px-1 py-1">
            Sent URL
          </div>
          <div className="w-12 font-SourceSanPro text-labelmb px-1 py-1"></div>
        </div>
        {HashkeyList?.map((item, index) => {
          const key = Object.keys(item)[0]; // 获取对象的键
          const data = item[key]; // 获取对象的值（嵌套对象）
          return (
            <div
              key={index}
              className="w-full flex items-center border-b text-white001 border-white009 py-2"
            >
              <div className="flex-1 text-body1mb px-1 px-2 overflow-hidden font-SourceSanPro text-ellipsis whitespace-nowrap">
                {data.txHash && formatString(data.txHash)}
              </div>
              <div className="w-32 font-SourceSanPro text-body1mb px-1 py-1">
                {key}
              </div>
              <div
                className="cursor-pointer w-18 font-SourceSanPro text-body1mb px-1 py-1 text-linkColor"
                onClick={() => {
                  handleCopy(key);
                }}
              >
                Copy
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HashkeyList;
