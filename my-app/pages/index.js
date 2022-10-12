import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { Contract, providers } from "ethers";
import { whitelistAddress, abi } from "../constants";

export default function Home() {
  const [numOfWhitlisted, setNumOfWhitlisted] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedList, setJoinedList] = useState(false);
  const [loading, setLoading] = useState(false);

  const web3ModalRef = useRef(null);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      return web3Provider.getSigner();
    }

    return web3Provider;
  };

  const checkIfAddressISWhitelisted = async () => {
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(whitelistAddress, abi, signer);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedList(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const getNumOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new Contract(whitelistAddress, abi, provider);
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumOfWhitlisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressISWhitelisted();
      getNumOfWhitelisted();
    } catch (error) {
      console.error(error);
    }
  };

  const joinWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(whitelistAddress, abi, signer);

      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);

      await getNumOfWhitelisted();
      setJoinedList(true);
    } catch (error) {
      console.error(error);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedList) {
        return <p>You are whitelisted</p>;
      } else if (loading) {
        return <p>Loading...</p>;
      } else {
        return (
          <button onClick={joinWhitelist} className={styles.button}>
            Join Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        cacheProvider: true,
        providerOptions: {
          metamask: {},
        },
        disableInjectedProvider: false,
      });
    }

    connectWallet();
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>whitelist dApp</title>
        <meta name="description" content="whitelist dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.box}>
          <h1 className={styles.title}>Welcome to Crypto devs</h1>
          <div className={styles.description}>{numOfWhitlisted} hav already been whitelisted</div>
          {renderButton()}
        </div>

        <div>
          <img src="./logo.svg" alt="" className={styles.image} />
        </div>
      </main>

      <footer className={styles.footer}>Made with &#10084; by Crypto Devs</footer>
    </div>
  );
}
