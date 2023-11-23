# Gate-Distribute

**config.json require**

## config.json template

```json
{
    // project domain host
    "host": "<DOMAIN REQUEST HOST>",
    // basic auth (optional, require .htpaasswd file)
    "accessControl": false,
    // clash subscribe url as base url
    "basePath": "<YOUR CLASH SUBSCRIBE PAHT>",
    // subscribe refresh cron expression
    "refreshCron": "<SUBSCRIBE REFRESH CRON>",
    // customize proxies, clash config format
    "proxys": [
        {
            // proxy name
            "name": "<CUSTOM PROXY NAME>",
            // proxy server
            "server": "<PROXY SERVER>",
            // proxy server port
            "port": 1234,
            // proxy type
            "type": "<PROXY TYPE>"
            // other proxy config...
        }
    ],
    // include proxy with regex
    "include": null,
    // exclude proxy with regex
    "exclude": "<EXCLUDE NODE WITH REGEX>",
    // custom proxy groups, clash group format, and group within any rules
    "customGroups": [
        {
            "groupName": "<CUSTOM GROUP NAME>",
            // type support select, url-test
            "type": "<GROUP ACTON TYPE>",
            // target proxies in groups
            "proxys": "<MATCHED PROXY NAME WITH REGEX>",
            "rules": [
                {
                    "ruleType": "DOMAIN",
                    "keyword": "chat.openai.com.cdn.cloudflare.net"
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