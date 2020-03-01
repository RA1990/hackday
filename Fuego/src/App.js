import React from "react";
import "./App.css";
import Header from "./components/Header";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container">
        <div className="row mt-5">
          <div className="col">Today's Top earners</div>
          <div className="col">All Time Top earners</div>
        </div>
      </div>
    </div>
  );
}

export default App;
