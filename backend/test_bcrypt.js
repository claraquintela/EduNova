const bcrypt = require('bcrypt'); bcrypt.hash('test', 10, (err, hash) => { if (err) console.error(err); else console.log(hash); });
