# transom-atlas-accesslist
Auto add the node server's IP address to [Atlas MongoDB](https://cloud.mongodb.com/) using the [Atlas Administration API](https://docs.atlas.mongodb.com/reference/api/ip-access-list/add-entries-to-access-list/).

##
Include this plugin near the top of your TransomJS server statup so that the IP address 
is added *before* the server tries to connect to MongoDB.

```javascript
transom.configure(transomAtlasAccesslist);

transom.configure(transomMongoose, {
    mongodbUri: process.env.MONGO
});

```

## Transom API definition
The definition file entry for the Atlass plugin should be populated using environment variables so that these
keys don't end up in source control.

If `atlas.name` is not provided the plugin will create one using the `name` at the root of the API object.

```javascript
{
  name: "My Transom App",
  definition: {
        atlas: {
            publicKey: process.env.ATLAS_PUBLIC_KEY,
            privateKey: process.env.ATLAS_PRIVATE_KEY,
            projectId: process.env.ATLAS_PROJECT_ID,
            // Use an APP-ID or HOSTNAME in the name to prevent getting remove by a second instance!
            // name: process.env.ATLAS_NAME + `(${process.env.NODE_ENV})`,
        }
  }
}
```
ATLAS_PUBLIC_KEY and ATLAS_PUBLIC_KEY are keys provided for the Organization in the Atlas dashboard.
Create a new pair of keys by going to Organization > Access Manager > API Keys (button, top right).

ATLAS_PROJECT_ID can be found under Organization > Projects > Copy Project ID (actions menu)

