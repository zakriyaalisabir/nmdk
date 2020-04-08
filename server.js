require('dotenv').config({ debug: process.env.DEBUG });

const { Server } = require('./src');
const PORT = process.env.PORT || 3333;

Server.listen(PORT, () => {
    console.log(`Server started running on PORT # ${PORT}`);
    console.log(`browse to http://localhost:${PORT}`);
    
});
