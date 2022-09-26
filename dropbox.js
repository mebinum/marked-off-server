const https = require("https");
const fs = require('fs');
const dotenv = require("dotenv");

dotenv.config();

const uploadFileToDropbox = (path, filename) => {
  
  fs.readFile(path, 'utf8', function (err, data) {
	const req = https.request('https://content.dropboxapi.com/2/files/upload', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${process.env.DROPBOX_TOKEN}`,
			'Dropbox-API-Arg': JSON.stringify({
				'path': `/contracts/${filename}`,
				'mode': 'overwrite',
				'autorename': true, 
				'mute': false,
				'strict_conflict': false
			}),
	    'Content-Type': 'application/octet-stream',
		}
	}, (res) => {
		  console.log("statusCode: ", res.statusCode);
	    console.log("headers: ", res.headers);

	    res.on('data', function(d) {
	        process.stdout.write(d);
	    });
	});

	req.write(data);
	req.end();
});
};

module.exports =  {
  uploadFileToDropbox
};
