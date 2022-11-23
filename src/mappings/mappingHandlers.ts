import { FlareLog } from "@subql/types-flare";
import { BigNumber } from "@ethersproject/bignumber";
import { Address, Reward } from "../types";

type RewardClaimedLogArgs = [string, string, string, BigNumber, BigNumber] & {
  dataProvider: string;
  whoClaimed: string;
  sentTo: string;
  rewardEpoch: BigNumber;
  amount: BigNumber;
};

export async function handleLog(
  event: FlareLog<RewardClaimedLogArgs>
): Promise<void> {
  logger.info(JSON.stringify(event));

  // ensure that our account entities exist
  const whoClaimed = await Address.get(event.args.whoClaimed.toLowerCase());
  if (!whoClaimed) {
    await Address.create({
      id: event.args.whoClaimed.toLowerCase(),
    }).save();
  }

  const whoRecieved = await Address.get(event.args.sentTo.toLowerCase());
  if (!whoRecieved) {
    await Address.create({
      id: event.args.sentTo.toLowerCase(),
    }).save();
  }

  // Create the new Reward entity
  const reward = Reward.create({
    id: event.transactionHash,
    recipientId: event.args.sentTo.toLowerCase(),
    dataProvider: event.args.dataProvider,
    whoClaimedId: event.args.whoClaimed.toLowerCase(),
    rewardEpoch: event.args.rewardEpoch.toBigInt(),
    amount: event.args.amount.toBigInt(),
  });

  await reward.save();
}
