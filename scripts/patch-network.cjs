/**
 * Patch os.networkInterfaces() to avoid uv_interface_addresses errors
 * in restricted environments (e.g. some sandboxes, Cursor).
 */
const os = require("os");
const orig = os.networkInterfaces;
if (orig) {
  os.networkInterfaces = function networkInterfaces() {
    try {
      return orig.call(this);
    } catch (err) {
      return {
        lo0: [
          { address: "127.0.0.1", netmask: "255.0.0.0", family: "IPv4", mac: "00:00:00:00:00:00", internal: true, cidr: "127.0.0.1/8" },
        ],
      };
    }
  };
}
