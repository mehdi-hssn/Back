require("dotenv").config();
const app = require("./src/app");

//const { API_PORT } = process.env;
const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server started on port: ${PORT}`);
});
