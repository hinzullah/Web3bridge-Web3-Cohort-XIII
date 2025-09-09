import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractConfig } from "../lib/contract";

export default function ClaimBtn() {
  const { writeContract, data: tx } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: tx });

  const handleClaim = () => {
    writeContract({
      ...contractConfig,
      functionName: "claimRewards",
    });
  };

  return (
    <button
      onClick={handleClaim}
      className="bg-purple-500 text-white px-4 py-2 mt-2"
      disabled={isLoading}
    >
      {isLoading ? "Claiming..." : "Claim Rewards"}
      {isSuccess && " ✅"}
    </button>
  );
}
