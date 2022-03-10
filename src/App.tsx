import { useEffect, useRef, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { Web3Provider } from "@ethersproject/providers";
import { WebBundlr } from "@bundlr-network/client/build/web";
import Drop from "./pages/Drop";
import Sites from "./pages/Sites";
import { Bundlr } from "./contexts/Bundlr";
import { notyf } from "./shared/notyf";
import jazzicon from "@metamask/jazzicon";
import { truncateAddress } from "./shared/helpers";
import { IoWalletOutline } from "react-icons/io5";

function App() {
  const [bundlr, setBundlr] = useState<WebBundlr | null>(null);
  const avatar = useRef<HTMLDivElement>(null);

  const connect = async () => {
    if (!window?.ethereum?.isMetaMask) {
      return notyf.error("Metamask is not installed");
    }
    try {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new Web3Provider(window.ethereum);
      await provider._ready();
      const chainId = "0x89";
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
      } catch (e: any) {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId,
                rpcUrls: ["https://polygon-rpc.com"],
                chainName: "Polygon Mainnet",
                nativeCurrency: {
                  name: "Matic",
                  symbol: "MATIC",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://polygonscan.com"],
              },
            ],
          });
        }
      }
      const bundlr = new WebBundlr(
        "https://node1.bundlr.network",
        "matic",
        provider
      );
      await bundlr.ready();
      setBundlr(bundlr);
    } catch (e: any) {
      console.error(e);
      notyf.error(e.message);
    }
  };

  const renderAvatar = () => {
    if (avatar.current) {
      if (bundlr?.address)
        avatar.current.replaceChildren(
          jazzicon(32, parseInt(bundlr.address.slice(2, 10), 16))
        );
      else avatar.current.innerHTML = "";
    }
  };

  useEffect(() => renderAvatar(), []);

  useEffect(() => renderAvatar(), [bundlr]);

  return (
    <Bundlr.Provider value={bundlr}>
      <div className="flex flex-col min-h-screen text-white max-w-3xl mx-auto py-7 px-7">
        <header className="flex justify-between items-center pb-7">
          <div className="border-2 border-muted rounded-3xl p-1 text-sm">
            {[
              ["/", "New drop"],
              ["/sites", "My sites"],
            ].map(([link, name]) => (
              <NavLink
                key={link}
                className={(navData) =>
                  (navData.isActive
                    ? "bg-highlight rounded-full"
                    : "hover:text-gray-300") +
                  " px-4 leading-8 inline-block transition-[color]"
                }
                to={link}
              >
                {name}
              </NavLink>
            ))}
          </div>
          {bundlr ? (
            <div className="border-2 border-muted rounded-3xl py-1 text-sm pr-4 pl-1 flex items-center select-none">
              <div className="inline-flex mr-4" ref={avatar}></div>
              <span>{truncateAddress(bundlr.address)}</span>
            </div>
          ) : (
            <button
              className="border-2 border-muted rounded-3xl py-1 text-sm leading-8 px-4 hover:text-gray-300 flex items-center gap-2"
              onClick={connect}
            >
              <IoWalletOutline />
              Connect wallet
            </button>
          )}
        </header>
        <Routes>
          <Route path="/" element={<Drop />} />
          <Route path="sites" element={<Sites />} />
        </Routes>
      </div>
    </Bundlr.Provider>
  );
}

export default App;
