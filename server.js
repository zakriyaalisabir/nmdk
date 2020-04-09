require('dotenv').config({ debug: process.env.DEBUG && false });

const { Server } = require('./src');
const PORT = process.env.PORT || 3333;

Server.listen(PORT, () => {
  console.log(`Server started running on PORT # ${PORT}`);
  console.log(`Browse to http://localhost:${PORT}`);
});
