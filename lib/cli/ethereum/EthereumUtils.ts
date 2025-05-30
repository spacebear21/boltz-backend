import { ContractABIs } from 'boltz-core';
import type { ERC20 } from 'boltz-core/typechain/ERC20';
import type { ERC20Swap } from 'boltz-core/typechain/ERC20Swap';
import type { EtherSwap } from 'boltz-core/typechain/EtherSwap';
import {
  Contract,
  type HDNodeWallet,
  JsonRpcProvider,
  type Provider,
  type Signer,
  Wallet,
} from 'ethers';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import Config, { type ConfigType } from '../../Config';

const getBoltzFilePath = (file: string): string =>
  path.join(Config.defaultDataDir, file);

const getBoltzWallet = (): HDNodeWallet => {
  for (const file of ['seedEvm.dat', 'seed.dat']) {
    const filePath = getBoltzFilePath(file);

    if (existsSync(filePath)) {
      return Wallet.fromPhrase(
        readFileSync(filePath, {
          encoding: 'utf-8',
        }).trim(),
      );
    }
  }

  throw 'no Boltz wallet found';
};

const loadConfig = (): ConfigType =>
  new Config().load({ configpath: getBoltzFilePath('boltz.conf') });

export const getContracts = (
  chain: 'rsk' | 'ethereum',
  signer: Signer,
): {
  token: ERC20;
  etherSwap: EtherSwap;
  erc20Swap: ERC20Swap;
} => {
  const config = loadConfig()[chain];
  if (config === undefined) {
    throw `${chain} configuration missing`;
  }

  const contracts: any = {};

  Object.entries({
    etherSwap: {
      abi: ContractABIs.EtherSwap,
      address: config.contracts[0].etherSwap,
    },
    erc20Swap: {
      abi: ContractABIs.ERC20Swap,
      address: config.contracts[0].erc20Swap,
    },
    token: {
      abi: ContractABIs.ERC20,
      address: config.tokens.find(
        (token) => token.contractAddress !== undefined,
      )!.contractAddress!,
    },
  }).forEach(
    ([name, config]) =>
      (contracts[name] = new Contract(config.address, config.abi, signer)),
  );

  return contracts;
};

export const getBoltzAddress = async (): Promise<string> =>
  getBoltzWallet().getAddress();

export const connectEthereum = async (providerUrl: string): Promise<Signer> =>
  getBoltzWallet().connect(new JsonRpcProvider(providerUrl));

export const getLogsQueryStartHeight = async (
  provider: Provider,
  delta: number,
): Promise<number> => {
  const blockHeight = await provider.getBlockNumber();
  return Math.max(blockHeight - delta, 0);
};
