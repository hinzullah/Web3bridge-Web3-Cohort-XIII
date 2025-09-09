import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractConfig } from "../lib/contract";

export default function EmergencyBtn() {
  const { writeContract, data: tx } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: tx });

  const handleEmergency = () => {
    writeContract({
      ...contractConfig,
      functionName: "emergencyWithdraw",
    });
  };

  return (
    <button
      onClick={handleEmergency}
      className="bg-orange-600 text-white px-4 py-2 mt-2"
      disabled={isLoading}
    >
      {isLoading ? "Emergency..." : "Emergency Withdraw"}
      {isSuccess && " ✅"}
    </button>
  );
}
