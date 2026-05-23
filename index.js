const express = require('express');
const cors = require('cors');
const https = require('https');
const PaytmChecksum = require('paytmchecksum');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/paytm/initiate', (req, res) => {
    const { amount, email } = req.body;
    const orderId = "ORD_" + new Date().getTime();
    const MKEY = process.env.PAYTM_MKEY;
    const MID = "XWRBAA21816232647831";

    var paytmParams = { body: { "requestType": "Payment", "mid": MID, "websiteName": "DEFAULT", "orderId": orderId, "callbackUrl": "https://ashifbuilds.in/portfolio", "txnAmount": { "value": amount.toString(), "currency": "INR" }, "userInfo": { "custId": email } }};

    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), MKEY).then(checksum => {
        paytmParams.head = { "signature": checksum };
        const post_data = JSON.stringify(paytmParams);
        const options = { hostname: 'securegw.paytm.in', port: 443, path: `/theia/api/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': post_data.length } };
        const post_req = https.request(options, (post_res) => {
            let response = "";
            post_res.on('data', chunk => response += chunk);
            post_res.on('end', () => res.json(JSON.parse(response)));
        });
        post_req.write(post_data);
        post_req.end();
    });
});

app.listen(process.env.PORT || 3000);
