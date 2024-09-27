const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // 允许跨域请求

const accessKeyId = process.env.ACCESS_KEY_ID; // 子账号的 AccessKeyId
const accessKeySecret = process.env.ACCESS_KEY_SECRET; // 子账号的 AccessKeySecret
const region = process.env.REGION;
const bucket = process.env.BUCKET;

app.get('/get-policy', (req, res) => {
  try {
    const expiration = new Date(new Date().getTime() + 3600 * 1000).toISOString(); // 设置策略过期时间

    const policyString = JSON.stringify({
      expiration,
      conditions: [
        { bucket },
        ["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
      ]
    });

    const policy = Buffer.from(policyString).toString('base64');
    const signature = crypto.createHmac('sha1', accessKeySecret).update(policy).digest('base64');

    res.json({
      accessid: accessKeyId,
      host: `https://${bucket}.${region}.aliyuncs.com`,
      policy,
      signature,
      expire: Math.floor(new Date().getTime() / 1000) + 3600,
      dir: '' // 上传目录，可以指定上传到OSS上的目录
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('获取策略失败');
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`服务器已启动，端口${port}`);
});
