# Portal - a proxy convert and distribute service

> Portal is a proxy convert and distribute service, it can convert clash subscribe (actualy only node proxy node info) to clash config, surfboard config, singbox config (may be more later), and distribute to client with http api.

## How to deploy

Portal support deploy with docker, if you got docker environment, you can just run below command to deploy portal.

```bash
# pull repository with git
git clone https://github.com/ShawJie/Portal.git portal

# build docker image with dockerfile at local
docker build --tag shaw/portal .

docker run 
    -v /path/to/config.json:/data/config.json \
    -v /path/to/authfolder:/data/auth \
    -p 8080:8080 \
    --name portal shaw/portal
```

Or you can just pull this repository and deploy with nodejs.

```
# pull repository with git
git clone https://github.com/ShawJie/Portal.git portal

# change directory to portal
cd portal

# install dependencies
npm install

# run with nodejs
node index.js
```

**Attantion: config.json is required, basic auth is optional.**

## API

**Resource List**

```
GET   /

ResponseBody: 
[
    {
        "path": "/clash",
        "method": "GET"
    },
    {
        "path": "/surfboard",
        "method": "GET"
    },
    {
        "path": "/singbox",
        "method": "GET"
    }
]
```

Other resource detail will flow at resource path. such as `{host}/clash` will get clash config.

## config.json template

you can run `cp config.template.json config.json` to create a config.json file, and modify it.

### Multiple Source Paths Support

Portal now supports loading proxies from multiple Clash subscribe sources. Each source can be named, and all proxies from that source will be tagged with the source name for easy identification.

**Features:**
- Load from multiple subscribe URLs simultaneously
- Each source is tagged with its name (format: `proxyName|sourceName`)
- Individual source failures won't affect other sources
- Sources are loaded in parallel for better performance

**Example:**
```json
"sourcePaths": [
    {
        "name": "Provider-A",
        "url": "https://example.com/clash/subscribe1"
    },
    {
        "name": "Provider-B",
        "url": "https://example.com/clash/subscribe2"
    }
]
```

Proxies from Provider-A will be named like `HK-Node-01|Provider-A`, and from Provider-B like `US-Node-01|Provider-B`.

```json
{
    // project domain host
    "host": "<DOMAIN REQUEST HOST>",
    // basic auth (optional, require .htpaasswd file)
    "accessControl": false,
    // multiple clash subscribe sources (each source will be tagged with its name)
    "sourcePaths": [
        {
            "name": "<SOURCE NAME>",
            "url": "<YOUR CLASH SUBSCRIBE URL>"
        }
    ],
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
            "attachGroup": [
                "<GROUP THAT YOU WANT ATTACH>"
            ],
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