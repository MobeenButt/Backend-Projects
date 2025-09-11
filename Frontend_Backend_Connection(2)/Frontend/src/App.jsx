import { useState } from "react";
import "./App.css";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const [jokes, setJokes] = useState([]);
  useEffect(() => {
    axios
      .get("/api/jokes")
      .then((response) => {
        setJokes(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  });
  return (
    <>
      <h1>Chai aur full stack | youtube</h1>
      <p>Jokes: {jokes.length}</p>

      {jokes.map((joke, index) => (
        <div key={joke.id}>
          <h3>{joke.title}</h3>
          <p>{joke.content}</p>
        </div>
      ))}
    </>
  );
}

export default App;

// CHORES in axios is like fetch  or allow ip address that is stuiable like hm apny parents ko allow krty hain ghar main any k liya likn kissi delivery person ko allow ni krty istrha chores bhi aysa hi ha jo allow krta ha k konsa ip address access kr skta ha server ko
