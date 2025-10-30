import ChatBot from "./components/Chatbot";
// import Popup from "./popup";

import { AppProvider } from "./contexts/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <div className="h-screen flex justify-center items-end">
      <AppProvider>
        <QueryClientProvider client={queryClient}>
          <ChatBot />
          {/* <Popup /> */}
        </QueryClientProvider>
      </AppProvider>
    </div>
  );
}

export default App;
