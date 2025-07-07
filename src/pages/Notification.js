import React from "react";

const Notification = ({ message }) => {
  return (
    <div style={styles.notification}>
      {message}
    </div>
  );
};

const styles = {
  notification: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ff9800",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
    animation: "fadeInOut 2s ease-in-out"
  }
};

export default Notification;
