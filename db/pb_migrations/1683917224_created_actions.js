migrate((db) => {
  const collection = new Collection({
    "id": "lof22t72hn4a9d9",
    "created": "2023-05-12 18:47:04.566Z",
    "updated": "2023-05-12 18:47:04.566Z",
    "name": "actions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "1rcewimw",
        "name": "text",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": 2,
          "max": 1000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ykk8pkac",
        "name": "due",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "gicppmuj",
        "name": "state",
        "type": "select",
        "required": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "todo",
            "in progress",
            "done",
            "cancelled"
          ]
        }
      },
      {
        "system": false,
        "id": "uilxihvk",
        "name": "assignees",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
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
  const collection = dao.findCollectionByNameOrId("lof22t72hn4a9d9");

  return dao.deleteCollection(collection);
})
