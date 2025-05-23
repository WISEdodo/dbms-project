import { Webchat, WebchatProvider, Fab, getClient } from "@botpress/webchat";
import { buildTheme } from "@botpress/webchat-generator";
import { useState, useEffect } from "react";

const { theme, style } = buildTheme({
  themeName: "midnight",
  themeColor: "#634433",
});

const clientId = "7ec8a49a-bbc0-4d9e-b215-36810c72fbc0";

const ChatbotComponent = () => {
  const client = getClient({ clientId });
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);
  const [chatKey, setChatKey] = useState(Date.now());
  const [showFab, setShowFab] = useState(false); // State to track button visibility

  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState);
  };

  useEffect(() => {
    setChatKey(Date.now());

    const handleScroll = () => {
      // Show the button when the user scrolls down 100px
      if (window.scrollY > 100) {
        setShowFab(true);
      } else {
        setShowFab(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div style={{ width: "0vw", height: "0vh", position: "relative" }}>
      <style>{style}</style>
      <WebchatProvider theme={theme} client={client}>
        <Fab
          onClick={toggleWebchat}
          style={{
            position: "fixed",
            bottom: "20px",
            right: showFab ? "20px" : "-100px", // Move the button off-screen if `showFab` is false
            zIndex: 1000,
            transition: "right 0.5s ease", // Smooth transition effect
            display:"none",
          }}
        />
        <div
          style={{
            display: isWebchatOpen ? "block" : "none",
            position: "fixed",
            bottom: "80px",
            right: "20px",
            zIndex: 1000,
            width: "350px",
            height: "500px",
            maxHeight: "70vh",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            borderRadius: "10px",
            backgroundColor: "#fff", // Add a background color
          }}
        >
          <Webchat
            key={chatKey}
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              overflowY: "auto",
            }}
          />
        </div>
      </WebchatProvider>
    </div>
  );
};

export default ChatbotComponent;
