const express = require('express');
const OSS = require('ali-oss');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // 允许所有跨域请求

// 从环境变量中获取配置
const accessKeyId = process.env.ACCESS_KEY_ID;
const accessKeySecret = process.env.ACCESS_KEY_SECRET;
const roleArn = process.env.ROLE_ARN;
const region = process.env.REGION;
const bucket = process.env.BUCKET;

app.get('/get-sts', async (req, res) => {
  try {
    const sts = new OSS.STS({
      accessKeyId,
      accessKeySecret
    });

    // 定义权限策略
    const policy = {
      "Version": "1",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "oss:PutObject",
            "oss:PostObject"
          ],
          "Resource": [`acs:oss:*:*:${bucket}/*`]
        }
      ]
    };
    
    // 获取临时凭证，有效期为1小时（3600秒）
    const token = await sts.assumeRole(roleArn, policy, 3600);

    res.json({
      AccessKeyId: token.credentials.AccessKeyId,
      AccessKeySecret: token.credentials.AccessKeySecret,
      SecurityToken: token.credentials.SecurityToken,
      Expiration: token.credentials.Expiration,
      region,
      bucket
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('获取STS凭证失败');
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`服务器已启动，端口${port}`);
});
