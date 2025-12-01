import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from "./pages/Customize";
import { userDataContext } from "./context/UserContext";
import Home from "./pages/Home";
import Customize2 from "./pages/Customize2";
import HotwordListener from "./components/HotwordListener";

function App() {
  const { userData, setUserData } = useContext(userDataContext);

  return (
    <>
      {/* 
        🔥 HotwordListener - Detects custom wake words like "hello", "hey", "hi" plus "hey nova"
        Currently disabled in favor of Home.jsx implementation which has better integration
        To enable, uncomment below and Home.jsx will detect wake words before AI response
      */}
      {/* 
      <HotwordListener
        mode="simple"
        hotword="hey nova"
        customWakeWords={["hello", "hey", "hi"]}
        assistantEndpoint="/api/user/asktoassistant"
        onWake={(detectedKeyword) =>
          console.log(`🎤 Wake word detected: ${detectedKeyword}`)
        }
        onResult={(res) => console.log("✅ AI Response:", res)}
      />
      */}

      {/* 🔻 All your routes */}
      <Routes>
        <Route
          path="/"
          element={
            userData?.assistantImage && userData?.assistantName ? (
              <Home />
            ) : (
              <Navigate to={"/customize"} />
            )
          }
        />

        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        />

        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to={"/"} />}
        />

        <Route
          path="/customize"
          element={userData ? <Customize /> : <Navigate to={"/signup"} />}
        />

        <Route
          path="/customize2"
          element={userData ? <Customize2 /> : <Navigate to={"/signup"} />}
        />
      </Routes>
    </>
  );
}

export default App;
