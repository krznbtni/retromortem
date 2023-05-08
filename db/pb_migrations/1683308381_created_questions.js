migrate((db) => {
  const collection = new Collection({
    "id": "d8xmquoekfaclu6",
    "created": "2023-05-05 17:39:41.769Z",
    "updated": "2023-05-05 17:39:41.769Z",
    "name": "questions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "u0gcwqwv",
        "name": "title",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": 1000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "sxy9bx8m",
        "name": "answers",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "oe86c6v8z2gjowx",
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
  const collection = dao.findCollectionByNameOrId("d8xmquoekfaclu6");

  return dao.deleteCollection(collection);
})
