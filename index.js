"use strict";
const updateAtlas = require('./lib/updateAtlas');

function TransomAtlasAccesslist() {
  this.initialize = function (server, options) {
    options = options || {};
    const transomConfig = server.registry.get("transom-config", {});
    const atlasDefn = server.registry.get(
      "transom-config.definition.atlas",
      {}
    );

    const publicKey = atlasDefn.publicKey;
    const privateKey = atlasDefn.privateKey;
    const appName = atlasDefn.name || transomConfig.name || "TransomJS";
    const projectId = atlasDefn.projectId;
    const barePublicIpUrl =
      atlasDefn.barePublicIpUrl || "https://api.ipify.org/";

    const options = {
      publicKey,
      privateKey,
      appName,
      projectId,
      barePublicIpUrl: barePublicIpUrl,
    };

    return updateAtlas(options);
  };
}

module.exports = new TransomAtlasAccesslist();
