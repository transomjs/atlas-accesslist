"use strict";
const getClient = require("mongodb-atlas-api-client");
const axios = require("axios");
const debug = require("debug")("transom:atlas");

module.exports = async function updateAtlas(options) {
  const MONGO_REALM = "For MongoDB Realm; do not delete";
  const appNameWithSuffix = `${options.appName} @ `;

  try {
    const client = getClient({
      publicKey: options.publicKey,
      privateKey: options.privateKey,
      baseUrl: "https://cloud.mongodb.com/api/atlas/v1.0",
      projectId: options.projectId,
    });

    // Get my (bare) current public IPv4 address.
    debug(`Fetching external IPv4 address from: ${options.barePublicIpUrl}`);
    const reply = await axios.get(options.barePublicIpUrl).catch((err) => {
      // console.log(err);
      throw new Error(`${err.response.status} Error fetching bare IP address`, err);
    })
    const myIPAddress = reply.data;
    debug(`IPv4 address is: ${myIPAddress}`);

    // Get of all the whitelisted IP addresses on Atlas.
    debug(`Get the IP address Allowlist on Atlas.`);
    const accessList = await client.projectAccesslist.getAll({
      itemsPerPage: 200,
    }).then((result)=>{
      if (result.error) {
        throw new Error(result.error + ": " + result.detail)
      }
      return result;
    });

    // Filter out the ones added for Atlas Realm.
    const ips = accessList.results.filter((ip) => {
      return ip.comment != MONGO_REALM;
    });

    debug(`Found ${ips.length} entries in the AccessList.`);

    // Is this App already whitelisted by it's App name?
    const itemToReplace = ips.find((ip) => {
      return ip.comment.startsWith(appNameWithSuffix);
    });

    // Found one, delete it.
    if (itemToReplace) {
      debug(
        `'${options.appName}' is already in the AccessList as ${itemToReplace.cidrBlock}`
      );
      const deleteResponse = await client.projectAccesslist.delete(
        itemToReplace.comment
      ).then((result)=>{
        if (result.error) {
          throw new Error(result.error + ": " + result.detail)
        }
        return result;
      });
      debug(
        deleteResponse
          ? "Deleted " + itemToReplace.cidrBlock
          : "Failed to delete:" + itemToReplace.comment
      );
    } else {
      debug(`'${options.appName}' does not exist in the AccessList.`);
    }

    // Add my IP to the AccessList.
    debug(`Adding '${options.appName}' / ${myIPAddress} to the AccessList.`);
    const createResponse = await client.projectAccesslist.create(
      [
        {
          ipAddress: myIPAddress,
          comment: appNameWithSuffix + new Date().toISOString(),
        },
      ]
      ).then((result)=>{
        if (result.error) {
          throw new Error(result.error + ": " + result.detail)
        }
        return result;
      });

    debug("List of allowed IPs:");
    createResponse.results
      .filter((ip) => {
        return ip.comment != MONGO_REALM;
      })
      .map((ip) => {
        debug(`\t${ip.cidrBlock} ${ip.comment}`);
      });
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}
