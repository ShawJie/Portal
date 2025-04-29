import SurfboardAbstractConfigSection from "./SurfboardAbstractConfigSection.js";


const INHERIT_DNS_SERVER = ["system", "8.8.8.8", "8.8.4.4", "9.9.9.9:9953"];
const INHERIT_PROXY_SKIPPATH = ["127.0.0.1", "192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12", "100.64.0.0/10", "17.0.0.0/8", "localhost", "*.local", "*.crashlytics.com"];
const INHERIT_PROXY_TEST_URL = "http://www.gstatic.com/generate_204";
const INHERIT_REAL_IP_PATH = ["*.srv.nintendo.net", "*.stun.playstation.net", "xbox.*.microsoft.com", "*.xboxlive.com"];

class SurfboardGeneral extends SurfboardAbstractConfigSection {

    constructor() {
        super("General");
        this.addProperty("dns-server", INHERIT_DNS_SERVER.join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
        this.addProperty("skip-proxy", INHERIT_PROXY_SKIPPATH.join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
        this.addProperty("proxy-test-url", INHERIT_PROXY_TEST_URL);
        this.addProperty("always-real-ip", INHERIT_REAL_IP_PATH.join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }
}

export default SurfboardGeneral;
