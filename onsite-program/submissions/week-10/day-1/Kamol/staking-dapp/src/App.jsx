import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import StakeForm from "./components/StakeForm";
import ClaimBtn from "./components/ClaimBtn";
import WithdrawBtn from "./components/WithdrawBtn";
import EmergencyBtn from "./components/EmergencyBtn";

function App() {
  return (
    <div>
      <Header />
      <Dashboard />
      <StakeForm />
      <div className="p-4 flex gap-4">
        <ClaimBtn />
        <WithdrawBtn amount={100} />
        <EmergencyBtn />
      </div>
    </div>
  );
}

export default App;
