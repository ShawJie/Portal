# Gate-Distribute

**config.json require**

## config.json template

```json
{
    // project domain host
    "host": "http://127.0.0.1:8080",
    // clash subscribe url as base url
    "basePath": "https://ninjasub.com/link/mXp6ZDSijcNCAHoc?clash=1",
    // subscribe refresh cron expression
    "refreshCron": "0 30 16 * * *",
    // customize proxies, clash config format
    "proxys": [
        {
            // proxy name
            "name": "Premium|韩国|Shaw|01",
            // proxy server
            "server": "kr.shawpro.club",
            // proxy server port
            "port": 8621,
            // proxy type
            "type": "http",
            // other proxy config...
            "username": "Deligate",
            "password": "28GXFc7AV9EgrNWm3mfp",
            "tls": true,
            "skipCertVerify": false
        }
    ],
    // include proxy with regex
    "include": null,
    // exclude proxy with regex
    "exclude": "(Standard|海外)",
    // custom proxy groups, clash group format, and group within any rules
    "customGroups": [
        {
            "groupName": "OpenAI",
            // type support select, url-test
            "type": "select",
            // target proxies in groups
            "proxys": "(广台|韩国)",
            "rules": [
                {
                    "ruleType": "DOMAIN",
                    "keyword": "chat.openai.com.cdn.cloudflare.net"
                },
                {
                    "ruleType": "DOMAIN",
                    "keyword": "openaiapi-site.azureedge.net"
                },
                {
                    "ruleType": "DOMAIN",
                    "keyword": "openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net"
                },
                {
                    "ruleType": "DOMAIN",
                    "keyword": "openaicomproductionae4b.blob.core.windows.net"
                },
                {
                    "ruleType": "DOMAIN",
                    "keyword": "production-openaicom-storage.azureedge.net"
                },
                {
                    "ruleType": "DOMAIN",
                    "keyword": "o33249.ingest.sentry.io"
                },
                {
                    "ruleType": "DOMAIN",
                    "keyword": "openaicom.imgix.net"
                },
                {
                    "ruleType": "DOMAIN-SUFFIX",
                    "keyword": "ai.com"
                },
                {
                    "ruleType": "DOMAIN-SUFFIX",
                    "keyword": "openai.com"
                },
                {
                    "ruleType": "DOMAIN-KEYWORD",
                    "keyword": "oaistatic"
                }
            ]
        }
    ]
}
```