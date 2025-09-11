import express from "express";

const app = express();

// app.get("/", (req, res) => {
//   res.send(`Server is ready`);
// });

// get a list of 5 jokes
app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "A joke",
      content: "This is a joke",
    },
    {
      id: 2,
      title: "Another joke",
      content: "This is another joke",
    },
    {
      id: 3,
      title: "Yet another joke",
      content: "This is yet another joke",
    },
    {
      id: 4,
      title: "Funny joke",
      content: "This is a funny joke",
    },
    {
      id: 5,
      title: "Hilarious joke",
      content: "This is a hilarious joke",
    },
  ];
  res.send(jokes);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
