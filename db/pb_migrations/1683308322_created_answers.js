migrate((db) => {
  const collection = new Collection({
    "id": "oe86c6v8z2gjowx",
    "created": "2023-05-05 17:38:42.897Z",
    "updated": "2023-05-05 17:38:42.897Z",
    "name": "answers",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hurjucc4",
        "name": "creator",
        "type": "relation",
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "1v4eoqqo",
        "name": "details",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": 1000,
          "pattern": "00"
        }
      },
      {
        "system": false,
        "id": "jvylc4m7",
        "name": "votes",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "nksixnrarslsjjw",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": []
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("oe86c6v8z2gjowx");

  return dao.deleteCollection(collection);
})
