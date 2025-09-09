import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractConfig } from "../lib/contract";

export default function WithdrawBtn({ amount }) {
  const { writeContract, data: tx } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: tx });

  const handleWithdraw = () => {
    writeContract({
      ...contractConfig,
      functionName: "withdraw",
      args: [amount], // assumes withdraw(amount)
    });
  };

  return (
    <button
      onClick={handleWithdraw}
      className="bg-red-500 text-white px-4 py-2 mt-2"
      disabled={isLoading}
    >
      {isLoading ? "Withdrawing..." : `Withdraw ${amount}`}
      {isSuccess && " ✅"}
    </button>
  );
}
